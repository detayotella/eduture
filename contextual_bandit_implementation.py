"""
Contextual Bandit Implementation for EDUTURE
============================================
A practical, production-ready implementation of Contextual Bandit
for adaptive content sequencing in educational hypermedia.

Author: [Your Name]
Date: 2025
"""

import numpy as np
import json
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import random


@dataclass
class LearnerState:
    """Represents the current state of a learner"""
    learner_id: str
    time_on_task: float          # Normalized 0-1
    error_rate: float            # 0-1
    revisit_count: float         # Normalized
    completion_rate: float       # 0-1
    engagement_score: float      # 0-1
    learning_style: str          # 'activist', 'reflector', 'theorist', 'pragmatist'
    topic_difficulty: float      # 0-1
    
    def to_vector(self) -> np.ndarray:
        """Convert state to feature vector for model input"""
        # Encode learning style as one-hot
        style_encoding = {
            'activist': [1, 0, 0, 0],
            'reflector': [0, 1, 0, 0],
            'theorist': [0, 0, 1, 0],
            'pragmatist': [0, 0, 0, 1]
        }
        
        base_features = [
            self.time_on_task,
            self.error_rate,
            self.revisit_count,
            self.completion_rate,
            self.engagement_score,
            self.topic_difficulty
        ]
        
        return np.array(base_features + style_encoding.get(self.learning_style, [0, 0, 0, 0]))


@dataclass
class Interaction:
    """Records a single learner-content interaction"""
    learner_id: str
    content_type: str
    context: np.ndarray
    reward: float
    timestamp: datetime
    
    def to_dict(self):
        return {
            'learner_id': self.learner_id,
            'content_type': self.content_type,
            'context': self.context.tolist(),
            'reward': self.reward,
            'timestamp': self.timestamp.isoformat()
        }


class LinUCB:
    """
    Linear Upper Confidence Bound (LinUCB) Algorithm
    
    A contextual bandit approach that uses linear regression
    to estimate rewards with confidence bounds.
    
    Reference: Li et al. (2010) "A Contextual-Bandit Approach to 
    Personalized News Article Recommendation"
    """
    
    def __init__(self, n_features: int, alpha: float = 1.0):
        """
        Args:
            n_features: Dimension of context vector
            alpha: Exploration parameter (higher = more exploration)
        """
        self.n_features = n_features
        self.alpha = alpha
        
        # Initialize A matrix (d x d) and b vector (d x 1) for each arm
        self.arms = ['theory', 'example', 'activity', 'exercise']
        self.A = {arm: np.eye(n_features) for arm in self.arms}
        self.b = {arm: np.zeros(n_features) for arm in self.arms}
        self.theta = {arm: np.zeros(n_features) for arm in self.arms}
        
        # Tracking
        self.selection_counts = {arm: 0 for arm in self.arms}
        self.total_selections = 0
    
    def select_arm(self, context: np.ndarray) -> str:
        """
        Select the best arm (content type) for given context
        using UCB strategy
        """
        p = {}
        
        for arm in self.arms:
            # Compute theta (estimated coefficients)
            A_inv = np.linalg.inv(self.A[arm])
            self.theta[arm] = A_inv @ self.b[arm]
            
            # Estimated reward
            mu = self.theta[arm] @ context
            
            # Confidence interval
            cb = self.alpha * np.sqrt(context @ A_inv @ context)
            
            # Upper confidence bound
            p[arm] = mu + cb
        
        # Select arm with highest UCB
        selected_arm = max(p, key=p.get)
        
        # Update tracking
        self.selection_counts[selected_arm] += 1
        self.total_selections += 1
        
        return selected_arm
    
    def update(self, arm: str, context: np.ndarray, reward: float):
        """
        Update the model with observed reward
        
        Args:
            arm: The content type that was selected
            context: Context vector when selection was made
            reward: Observed reward (0-1)
        """
        self.A[arm] += np.outer(context, context)
        self.b[arm] += reward * context
    
    def get_arm_weights(self, context: np.ndarray) -> Dict[str, float]:
        """Get predicted reward for each arm (for debugging)"""
        weights = {}
        for arm in self.arms:
            A_inv = np.linalg.inv(self.A[arm])
            theta = A_inv @ self.b[arm]
            weights[arm] = theta @ context
        return weights


class EpsilonGreedyBandit:
    """
    Epsilon-Greedy Contextual Bandit
    
    Simpler alternative to LinUCB. Uses logistic regression
    for reward prediction with epsilon exploration.
    """
    
    def __init__(self, epsilon: float = 0.2, decay: float = 0.995):
        """
        Args:
            epsilon: Initial exploration probability
            decay: Epsilon decay rate per update
        """
        self.arms = ['theory', 'example', 'activity', 'exercise']
        self.epsilon = epsilon
        self.initial_epsilon = epsilon
        self.decay = decay
        
        # Simple linear models (can be replaced with sklearn)
        self.models = {arm: SimpleLinearModel() for arm in self.arms}
        self.interaction_history = {arm: [] for arm in self.arms}
    
    def select_arm(self, context: np.ndarray) -> str:
        """Select arm using epsilon-greedy strategy"""
        
        # Exploration: random selection
        if random.random() < self.epsilon:
            return random.choice(self.arms)
        
        # Exploitation: choose best predicted arm
        predictions = {}
        for arm in self.arms:
            if len(self.interaction_history[arm]) >= 5:  # Minimum data threshold
                pred = self.models[arm].predict(context)
                predictions[arm] = pred
            else:
                predictions[arm] = 0.5  # Neutral if insufficient data
        
        # Select arm with highest predicted reward
        return max(predictions, key=predictions.get)
    
    def update(self, arm: str, context: np.ndarray, reward: float):
        """Update model with new observation"""
        self.interaction_history[arm].append((context, reward))
        
        # Retrain model periodically
        if len(self.interaction_history[arm]) % 10 == 0:
            contexts = np.array([c for c, r in self.interaction_history[arm]])
            rewards = np.array([r for c, r in self.interaction_history[arm]])
            self.models[arm].fit(contexts, rewards)
        
        # Decay epsilon
        self.epsilon = max(0.05, self.epsilon * self.decay)
    
    def reset_exploration(self):
        """Reset epsilon to initial value (for new learners)"""
        self.epsilon = self.initial_epsilon


class SimpleLinearModel:
    """Simple linear regression model for reward prediction"""
    
    def __init__(self):
        self.weights = None
        self.bias = 0.5
    
    def fit(self, X: np.ndarray, y: np.ndarray):
        """Fit linear model using least squares"""
        try:
            # Add bias term
            X_bias = np.column_stack([np.ones(len(X)), X])
            
            # Normal equation
            params = np.linalg.pinv(X_bias.T @ X_bias) @ X_bias.T @ y
            
            self.bias = params[0]
            self.weights = params[1:]
        except:
            # Fallback to simple average
            self.bias = np.mean(y)
            self.weights = np.zeros(X.shape[1])
    
    def predict(self, x: np.ndarray) -> float:
        """Predict reward for context"""
        if self.weights is None:
            return self.bias
        return self.bias + self.weights @ x


class AdaptiveEngine:
    """
    Main adaptive engine that combines rule-based and RL-based approaches
    """
    
    def __init__(self, mode: str = 'rl', alpha: float = 1.0):
        """
        Args:
            mode: 'rule' for rule-based, 'rl' for contextual bandit
            alpha: Exploration parameter for RL
        """
        self.mode = mode
        
        # Rule-based sequences (from original EDUTURE)
        self.rule_sequences = {
            'activist': ['activity', 'example', 'theory', 'exercise'],
            'reflector': ['theory', 'example', 'activity', 'exercise'],
            'theorist': ['theory', 'example', 'exercise', 'activity'],
            'pragmatist': ['example', 'activity', 'theory', 'exercise']
        }
        
        # RL engine
        self.n_features = 10  # 6 base + 4 one-hot encoded learning style
        self.rl_engine = LinUCB(n_features=self.n_features, alpha=alpha)
        
        # Track learner progress
        self.learner_progress = {}
    
    def get_next_content(self, learner_state: LearnerState) -> str:
        """
        Get next content type for learner
        
        Args:
            learner_state: Current state of the learner
            
        Returns:
            Content type to present next
        """
        if self.mode == 'rule':
            return self._rule_based_selection(learner_state)
        else:
            return self._rl_based_selection(learner_state)
    
    def _rule_based_selection(self, state: LearnerState) -> str:
        """Select content using predefined rules"""
        sequence = self.rule_sequences.get(state.learning_style, 
                                           self.rule_sequences['activist'])
        
        # Get already completed items for this learner
        completed = self.learner_progress.get(state.learner_id, [])
        
        # Find first uncompleted item in sequence
        for content_type in sequence:
            if content_type not in completed:
                return content_type
        
        # All completed
        return None
    
    def _rl_based_selection(self, state: LearnerState) -> str:
        """Select content using contextual bandit"""
        context = state.to_vector()
        return self.rl_engine.select_arm(context)
    
    def record_interaction(self, learner_state: LearnerState, 
                          content_type: str, 
                          reward: float):
        """
        Record interaction and update RL model
        
        Args:
            learner_state: State when content was selected
            content_type: Type of content presented
            reward: Observed reward (0-1)
        """
        # Update progress tracking
        if learner_state.learner_id not in self.learner_progress:
            self.learner_progress[learner_state.learner_id] = []
        self.learner_progress[learner_state.learner_id].append(content_type)
        
        # Update RL model
        if self.mode == 'rl':
            context = learner_state.to_vector()
            self.rl_engine.update(content_type, context, reward)
    
    def get_engine_stats(self) -> Dict:
        """Get statistics about the engine's performance"""
        if self.mode == 'rl':
            return {
                'mode': 'rl',
                'total_selections': self.rl_engine.total_selections,
                'selection_distribution': self.rl_engine.selection_counts,
                'exploration_rate': self.rl_engine.alpha
            }
        else:
            return {
                'mode': 'rule',
                'learner_count': len(self.learner_progress)
            }


class RewardCalculator:
    """
    Calculates reward for learner interactions
    """
    
    @staticmethod
    def calculate(interaction_data: Dict) -> float:
        """
        Calculate reward based on interaction metrics
        
        Args:
            interaction_data: Dictionary containing:
                - completed: bool
                - quiz_score: float (0-100)
                - expected_time: float (minutes)
                - actual_time: float (minutes)
                - is_revisit: bool
                - engagement_signals: dict (optional)
        
        Returns:
            Reward value between 0 and 1
        """
        # Component 1: Completion (35% weight)
        completion = 1.0 if interaction_data.get('completed', False) else 0.0
        
        # Component 2: Performance (35% weight)
        quiz_score = interaction_data.get('quiz_score', 50)
        performance = quiz_score / 100.0
        
        # Component 3: Time efficiency (20% weight)
        expected_time = interaction_data.get('expected_time', 10)
        actual_time = interaction_data.get('actual_time', expected_time)
        
        if expected_time > 0:
            # Optimal time is around 1x expected (not too fast, not too slow)
            time_ratio = actual_time / expected_time
            if 0.8 <= time_ratio <= 1.5:
                time_efficiency = 1.0
            elif time_ratio < 0.8:
                time_efficiency = 0.7  # Too fast, might be rushing
            else:
                time_efficiency = max(0, 1.0 - (time_ratio - 1.5) * 0.5)
        else:
            time_efficiency = 0.5
        
        # Component 4: Revisit penalty (10% weight, negative)
        revisit_penalty = 0.15 if interaction_data.get('is_revisit', False) else 0.0
        
        # Optional: Engagement signals
        engagement_bonus = 0.0
        if 'engagement_signals' in interaction_data:
            signals = interaction_data['engagement_signals']
            scroll_depth = signals.get('scroll_depth', 0.5)
            click_count = signals.get('click_count', 5)
            engagement_bonus = (scroll_depth * 0.05) + min(click_count / 50, 0.05)
        
        # Weighted combination
        reward = (
            completion * 0.35 +
            performance * 0.35 +
            time_efficiency * 0.20 -
            revisit_penalty +
            engagement_bonus
        )
        
        return max(0.0, min(1.0, reward))


# Example usage and testing
if __name__ == "__main__":
    print("=" * 60)
    print("EDUTURE Contextual Bandit - Test Run")
    print("=" * 60)
    
    # Initialize RL engine
    engine = AdaptiveEngine(mode='rl', alpha=1.0)
    
    # Simulate interactions
    test_learners = [
        {'id': 'learner_1', 'style': 'activist'},
        {'id': 'learner_2', 'style': 'reflector'},
        {'id': 'learner_3', 'style': 'theorist'},
    ]
    
    print("\n--- Simulating 50 interactions per learner ---\n")
    
    for learner in test_learners:
        print(f"\nLearner: {learner['id']} (Style: {learner['style']})")
        
        for i in range(50):
            # Create random learner state
            state = LearnerState(
                learner_id=learner['id'],
                time_on_task=random.random(),
                error_rate=random.random() * 0.5,
                revisit_count=random.random() * 0.3,
                completion_rate=i / 50,
                engagement_score=0.5 + random.random() * 0.5,
                learning_style=learner['style'],
                topic_difficulty=0.5
            )
            
            # Get recommendation
            content = engine.get_next_content(state)
            
            # Simulate reward (higher for preferred content types)
            preferred = {
                'activist': ['activity', 'exercise'],
                'reflector': ['theory', 'example'],
                'theorist': ['theory', 'exercise'],
                'pragmatist': ['example', 'activity']
            }
            
            if content in preferred[learner['style']]:
                reward = 0.7 + random.random() * 0.3
            else:
                reward = 0.3 + random.random() * 0.4
            
            # Record interaction
            engine.record_interaction(state, content, reward)
        
        # Show final context for this learner
        test_state = LearnerState(
            learner_id=learner['id'],
            time_on_task=0.5,
            error_rate=0.2,
            revisit_count=0.1,
            completion_rate=0.8,
            engagement_score=0.7,
            learning_style=learner['style'],
            topic_difficulty=0.5
        )
        
        weights = engine.rl_engine.get_arm_weights(test_state.to_vector())
        print(f"  Learned preferences: {weights}")
    
    # Show engine statistics
    print("\n" + "=" * 60)
    print("Engine Statistics")
    print("=" * 60)
    stats = engine.get_engine_stats()
    print(f"Total selections: {stats['total_selections']}")
    print(f"Selection distribution: {stats['selection_distribution']}")
    
    print("\n✅ Test completed successfully!")
