from __future__ import annotations

import json
from pathlib import Path
import random
import threading
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict

import numpy as np

from ..config import get_settings


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
        self.pull_counts = {arm: 0 for arm in self.arms}

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
        self.pull_counts[arm] = self.pull_counts.get(arm, 0) + 1

    def to_dict(self) -> dict[str, Any]:
        return {
            "n_features": self.n_features,
            "alpha": self.alpha,
            "arms": self.arms,
            "A": {arm: self.A[arm].tolist() for arm in self.arms},
            "b": {arm: self.b[arm].tolist() for arm in self.arms},
            "pull_counts": self.pull_counts,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "LinUCB":
        engine = cls(n_features=int(data.get("n_features", 10)), alpha=float(data.get("alpha", 1.0)))
        for arm in engine.arms:
            if arm in data.get("A", {}):
                engine.A[arm] = np.array(data["A"][arm], dtype=float)
            if arm in data.get("b", {}):
                engine.b[arm] = np.array(data["b"][arm], dtype=float)
        pull_counts = data.get("pull_counts", {})
        engine.pull_counts = {arm: int(pull_counts.get(arm, 0)) for arm in engine.arms}
        return engine

    def summary(self) -> dict[str, Any]:
        return {
            "n_features": self.n_features,
            "alpha": self.alpha,
            "pull_counts": dict(self.pull_counts),
        }


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
        self._lock = threading.RLock()
        self.state_path: Path = Path(get_settings().bandit_state_path)
        self.persist_state = mode == "rl"
        self.rule_sequences = {
            "activist": ["activity", "example", "theory", "exercise"],
            "reflector": ["theory", "example", "activity", "exercise"],
            "theorist": ["theory", "activity", "example", "exercise"],
            "pragmatist": ["example", "activity", "theory", "exercise"],
        }
        self.rule_positions: dict[str, int] = {}
        self.rl_engine = LinUCB(n_features=10, alpha=alpha)
        self.bandit = EpsilonGreedyBandit()
        self.last_routes: dict[str, dict[str, Any]] = {}
        self.load_state()

    def _state_payload(self) -> dict[str, Any]:
        return {
            "mode": self.mode,
            "rule_positions": self.rule_positions,
            "last_routes": self.last_routes,
            "rl_engine": self.rl_engine.to_dict(),
            "bandit": {
                "epsilon": self.bandit.epsilon,
                "decay": self.bandit.decay,
            },
        }

    def save_state(self) -> None:
        if not self.persist_state:
            return
        with self._lock:
            self.state_path.parent.mkdir(parents=True, exist_ok=True)
            self.state_path.write_text(json.dumps(self._state_payload(), indent=2, sort_keys=True), encoding="utf-8")

    def load_state(self) -> None:
        if not self.persist_state:
            return
        if not self.state_path.exists():
            return
        with self._lock:
            payload = json.loads(self.state_path.read_text(encoding="utf-8"))
            self.rule_positions = {key: int(value) for key, value in payload.get("rule_positions", {}).items()}
            self.last_routes = payload.get("last_routes", {}) or {}
            if "rl_engine" in payload:
                self.rl_engine = LinUCB.from_dict(payload["rl_engine"])
            bandit_state = payload.get("bandit", {})
            self.bandit.epsilon = float(bandit_state.get("epsilon", self.bandit.epsilon))
            self.bandit.decay = float(bandit_state.get("decay", self.bandit.decay))

    def get_learner_route(self, learner_id: str) -> dict[str, Any] | None:
        return self.last_routes.get(str(learner_id))

    def snapshot(self) -> dict[str, Any]:
        return {
            "mode": self.mode,
            "state_path": str(self.state_path),
            "rule_positions": dict(self.rule_positions),
            "last_routes": dict(self.last_routes),
            "rl_engine": self.rl_engine.summary(),
        }

    def get_next_content(self, state: LearnerState) -> str:
        with self._lock:
            if self.mode == "rule":
                sequence = self.rule_sequences.get(state.learning_style, self.rule_sequences["activist"])
                position = self.rule_positions.get(state.learner_id, 0)
                choice = sequence[position % len(sequence)]
                self.rule_positions[state.learner_id] = position + 1
                self.last_routes[state.learner_id] = {
                    "engine": "rule",
                    "content_type": choice,
                    "learning_style": state.learning_style,
                    "sequence_position": position,
                    "recorded_at": datetime.utcnow().isoformat() + "Z",
                }
                self.save_state()
                return choice
            context = state.to_vector()
            choice = self.rl_engine.select_arm(context)
            self.last_routes[state.learner_id] = {
                "engine": "rl",
                "content_type": choice,
                "learning_style": state.learning_style,
                "recorded_at": datetime.utcnow().isoformat() + "Z",
            }
            self.save_state()
            return choice

    def record_interaction(self, state: LearnerState, content_type: str, reward: float) -> None:
        with self._lock:
            if self.mode == "rl":
                self.rl_engine.update(content_type, state.to_vector(), reward)
            elif self.mode == "rule":
                self.rule_positions[state.learner_id] = self.rule_positions.get(state.learner_id, 0) + 1
            self.last_routes[state.learner_id] = {
                **(self.last_routes.get(state.learner_id, {})),
                "last_interaction_content_type": content_type,
                "last_reward": reward,
                "interaction_recorded_at": datetime.utcnow().isoformat() + "Z",
            }
            self.save_state()


adaptive_engine = AdaptiveEngine(mode="rl", alpha=1.0)


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
