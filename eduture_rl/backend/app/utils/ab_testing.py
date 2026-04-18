from __future__ import annotations

from dataclasses import dataclass, asdict
from enum import Enum
from typing import Dict, List
from collections import defaultdict
import random

import numpy as np


class GroupAssignment(Enum):
    CONTROL = "rule_based"
    TREATMENT = "rl_based"


@dataclass
class LearnerMetrics:
    learner_id: str
    group: str
    learning_style: str
    completed_module: bool
    completion_time_minutes: float
    content_items_viewed: int
    pre_test_score: float
    post_test_score: float
    quiz_scores: List[float]
    avg_time_on_task: float
    total_revisits: int
    engagement_score: float
    satisfaction_rating: float
    would_recommend: bool

    def improvement_score(self) -> float:
        return self.post_test_score - self.pre_test_score

    def pass_icdl(self, threshold: float = 75.0) -> bool:
        return self.post_test_score >= threshold


class ABTestManager:
    def __init__(self, random_seed: int = 42):
        self.random_seed = random_seed
        random.seed(random_seed)
        self.assignments: dict[str, GroupAssignment] = {}
        self.metrics: dict[str, LearnerMetrics] = {}
        self.group_counts = {GroupAssignment.CONTROL: 0, GroupAssignment.TREATMENT: 0}

    def assign_learner(self, learner_id: str, learning_style: str) -> str:
        if learner_id in self.assignments:
            return self.assignments[learner_id].value
        assignment = GroupAssignment.CONTROL if self.group_counts[GroupAssignment.CONTROL] <= self.group_counts[GroupAssignment.TREATMENT] else GroupAssignment.TREATMENT
        self.assignments[learner_id] = assignment
        self.group_counts[assignment] += 1
        return assignment.value

    def record_metrics(self, metrics: LearnerMetrics) -> None:
        self.metrics[metrics.learner_id] = metrics

    def get_group_metrics(self, group: str) -> List[LearnerMetrics]:
        return [metric for metric in self.metrics.values() if metric.group == group]

    def get_summary_stats(self) -> Dict:
        control = self.get_group_metrics("rule_based")
        treatment = self.get_group_metrics("rl_based")

        def calc_stats(metrics_list: List[LearnerMetrics]) -> Dict:
            if not metrics_list:
                return {"n": 0}
            pass_rates = [metric.pass_icdl() for metric in metrics_list]
            completion_times = [metric.completion_time_minutes for metric in metrics_list if metric.completed_module]
            improvements = [metric.improvement_score() for metric in metrics_list]
            return {
                "n": len(metrics_list),
                "pass_rate": float(np.mean(pass_rates)),
                "completion_time": float(np.mean(completion_times)) if completion_times else 0.0,
                "improvement": float(np.mean(improvements)),
                "satisfaction": float(np.mean([metric.satisfaction_rating for metric in metrics_list])),
                "engagement": float(np.mean([metric.engagement_score for metric in metrics_list])),
            }

        return {"control": calc_stats(control), "treatment": calc_stats(treatment), "total_learners": len(self.metrics)}


class StatisticalAnalyzer:
    @staticmethod
    def two_sample_t_test(group1: List[float], group2: List[float]) -> Dict:
        from scipy import stats

        if len(group1) < 2 or len(group2) < 2:
            return {"error": "Insufficient data", "n1": len(group1), "n2": len(group2)}
        t_stat, p_value = stats.ttest_ind(group1, group2)
        pooled_std = np.sqrt((np.std(group1, ddof=1) ** 2 + np.std(group2, ddof=1) ** 2) / 2)
        cohens_d = (np.mean(group1) - np.mean(group2)) / pooled_std if pooled_std > 0 else 0.0
        return {"t_statistic": float(t_stat), "p_value": float(p_value), "cohens_d": float(cohens_d), "mean_diff": float(np.mean(group1) - np.mean(group2))}

    @staticmethod
    def chi_square_test(counts1: int, total1: int, counts2: int, total2: int) -> Dict:
        from scipy.stats import chi2_contingency

        table = [[counts1, total1 - counts1], [counts2, total2 - counts2]]
        chi2, p_value, _, _ = chi2_contingency(table)
        return {"chi2": float(chi2), "p_value": float(p_value), "proportion1": counts1 / total1 if total1 else 0.0, "proportion2": counts2 / total2 if total2 else 0.0}

    @staticmethod
    def compare_groups(metrics: List[LearnerMetrics]) -> Dict:
        control = [metric for metric in metrics if metric.group == "rule_based"]
        treatment = [metric for metric in metrics if metric.group == "rl_based"]
        return {
            "pass_rate": StatisticalAnalyzer.chi_square_test(sum(metric.pass_icdl() for metric in control), len(control), sum(metric.pass_icdl() for metric in treatment), len(treatment)) if control and treatment else {},
            "post_test_score": StatisticalAnalyzer.two_sample_t_test([metric.post_test_score for metric in control], [metric.post_test_score for metric in treatment]) if control and treatment else {},
            "improvement": StatisticalAnalyzer.two_sample_t_test([metric.improvement_score() for metric in control], [metric.improvement_score() for metric in treatment]) if control and treatment else {},
        }
