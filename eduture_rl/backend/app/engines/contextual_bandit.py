from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Dict
import random

import numpy as np


@dataclass
class LearnerState:
    learner_id: str
    time_on_task: float
    error_rate: float
    revisit_count: float
    completion_rate: float
    engagement_score: float
    learning_style: str
    topic_difficulty: float

    def to_vector(self) -> np.ndarray:
        style_encoding = {
            "activist": [1, 0, 0, 0],
            "reflector": [0, 1, 0, 0],
            "theorist": [0, 0, 1, 0],
            "pragmatist": [0, 0, 0, 1],
        }
        base = [
            self.time_on_task,
            self.error_rate,
            self.revisit_count,
            self.completion_rate,
            self.engagement_score,
            self.topic_difficulty,
        ]
        return np.array(base + style_encoding.get(self.learning_style, [0, 0, 0, 0]), dtype=float)


@dataclass
class Interaction:
    learner_id: str
    content_type: str
    context: np.ndarray
    reward: float
    timestamp: datetime


class LinUCB:
    def __init__(self, n_features: int, alpha: float = 1.0):
        self.n_features = n_features
        self.alpha = alpha
        self.arms = ["theory", "example", "activity", "exercise"]
        self.A = {arm: np.eye(n_features) for arm in self.arms}
        self.b = {arm: np.zeros(n_features) for arm in self.arms}

    def select_arm(self, context: np.ndarray) -> str:
        scores = {}
        for arm in self.arms:
            a_inv = np.linalg.inv(self.A[arm])
            theta = a_inv @ self.b[arm]
            mu = theta @ context
            cb = self.alpha * np.sqrt(context @ a_inv @ context)
            scores[arm] = mu + cb
        return max(scores, key=scores.get)

    def update(self, arm: str, context: np.ndarray, reward: float) -> None:
        self.A[arm] += np.outer(context, context)
        self.b[arm] += reward * context


class EpsilonGreedyBandit:
    def __init__(self, epsilon: float = 0.2, decay: float = 0.995):
        self.arms = ["theory", "example", "activity", "exercise"]
        self.epsilon = epsilon
        self.decay = decay
        self.history = {arm: [] for arm in self.arms}

    def select_arm(self, context: np.ndarray) -> str:
        if random.random() < self.epsilon:
            return random.choice(self.arms)
        scores = {arm: (np.mean([r for _, r in self.history[arm]]) if self.history[arm] else 0.5) for arm in self.arms}
        return max(scores, key=scores.get)

    def update(self, arm: str, context: np.ndarray, reward: float) -> None:
        self.history[arm].append((context, reward))
        self.epsilon = max(0.05, self.epsilon * self.decay)


class AdaptiveEngine:
    def __init__(self, mode: str = "rl", alpha: float = 1.0):
        self.mode = mode
        self.rule_sequences = {
            "activist": ["activity", "example", "theory", "exercise"],
            "reflector": ["theory", "example", "activity", "exercise"],
            "theorist": ["theory", "activity", "example", "exercise"],
            "pragmatist": ["example", "activity", "theory", "exercise"],
        }
        self.rule_positions: dict[str, int] = {}
        self.rl_engine = LinUCB(n_features=10, alpha=alpha)
        self.bandit = EpsilonGreedyBandit()

    def get_next_content(self, state: LearnerState) -> str:
        if self.mode == "rule":
            sequence = self.rule_sequences.get(state.learning_style, self.rule_sequences["activist"])
            position = self.rule_positions.get(state.learner_id, 0)
            choice = sequence[position % len(sequence)]
            self.rule_positions[state.learner_id] = position + 1
            return choice
        context = state.to_vector()
        return self.rl_engine.select_arm(context)

    def record_interaction(self, state: LearnerState, content_type: str, reward: float) -> None:
        if self.mode == "rl":
            self.rl_engine.update(content_type, state.to_vector(), reward)
        elif self.mode == "rule":
            self.rule_positions[state.learner_id] = self.rule_positions.get(state.learner_id, 0) + 1


class RewardCalculator:
    @staticmethod
    def calculate(data: dict) -> float:
        reward = 0.0
        reward += 0.35 if data.get("completed") else 0.0
        reward += min(0.35, data.get("quiz_score", 0) / 100.0 * 0.35)
        expected = data.get("expected_time", 1) or 1
        actual = data.get("actual_time", expected)
        efficiency = max(0.0, 1.0 - abs(actual - expected) / expected)
        reward += 0.2 * efficiency
        reward -= 0.05 if data.get("is_revisit") else 0.0
        return float(max(0.0, min(1.0, reward)))
