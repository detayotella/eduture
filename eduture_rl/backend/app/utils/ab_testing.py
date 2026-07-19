from __future__ import annotations

from dataclasses import dataclass, asdict
from enum import Enum
from typing import Dict, List
from collections import defaultdict
import random
import math

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
    def _two_tailed_normal_p_value(z_score: float) -> float:
        return float(math.erfc(abs(z_score) / math.sqrt(2.0)))

    @staticmethod
    def two_sample_t_test(group1: List[float], group2: List[float]) -> Dict:
        if len(group1) < 2 or len(group2) < 2:
            return {"error": "Insufficient data", "n1": len(group1), "n2": len(group2)}

        g1 = np.array(group1, dtype=float)
        g2 = np.array(group2, dtype=float)
        n1, n2 = len(g1), len(g2)
        mean1, mean2 = float(np.mean(g1)), float(np.mean(g2))
        var1, var2 = float(np.var(g1, ddof=1)), float(np.var(g2, ddof=1))
        denom = math.sqrt((var1 / n1) + (var2 / n2))
        if denom == 0:
            t_stat = 0.0
            p_value = 1.0
        else:
            # Welch t-statistic with a normal approximation for p-value.
            t_stat = (mean1 - mean2) / denom
            p_value = StatisticalAnalyzer._two_tailed_normal_p_value(t_stat)

        pooled_std = np.sqrt((var1 + var2) / 2)
        cohens_d = (np.mean(group1) - np.mean(group2)) / pooled_std if pooled_std > 0 else 0.0
        return {"t_statistic": float(t_stat), "p_value": float(p_value), "cohens_d": float(cohens_d), "mean_diff": float(np.mean(group1) - np.mean(group2))}

    @staticmethod
    def _fisher_exact_2x2(a: int, b: int, c: int, d: int) -> dict[str, float]:
        n = a + b + c + d
        row1 = a + b
        row2 = c + d
        col1 = a + c

        if n <= 0:
            return {"p_value": 1.0, "odds_ratio": 0.0}

        def hypergeom_prob(x: int) -> float:
            return (
                math.comb(row1, x) * math.comb(row2, col1 - x) / math.comb(n, col1)
            )

        min_x = max(0, col1 - row2)
        max_x = min(row1, col1)
        observed_p = hypergeom_prob(a)

        two_sided_p = 0.0
        eps = 1e-12
        for x in range(min_x, max_x + 1):
            p = hypergeom_prob(x)
            if p <= observed_p + eps:
                two_sided_p += p

        odds_ratio = float("inf") if (b * c) == 0 and (a * d) > 0 else ((a * d) / (b * c) if (b * c) != 0 else 0.0)
        return {"p_value": float(min(1.0, two_sided_p)), "odds_ratio": float(odds_ratio) if math.isfinite(odds_ratio) else float("inf")}

    @staticmethod
    def chi_square_test(counts1: int, total1: int, counts2: int, total2: int) -> Dict:
        if total1 <= 0 or total2 <= 0:
            return {"error": "Insufficient data", "total1": total1, "total2": total2}

        a = int(counts1)
        b = int(total1 - counts1)
        c = int(counts2)
        d = int(total2 - counts2)

        grand_total = float(total1 + total2)
        row_totals = [float(total1), float(total2)]
        col_totals = [float(counts1 + counts2), float((total1 - counts1) + (total2 - counts2))]

        expected = []
        for row_idx in range(2):
            for col_idx in range(2):
                exp = (row_totals[row_idx] * col_totals[col_idx]) / grand_total if grand_total else 0.0
                expected.append(exp)

        use_fisher = any(exp < 5.0 for exp in expected)

        if use_fisher:
            fisher = StatisticalAnalyzer._fisher_exact_2x2(a, b, c, d)
            return {
                "method": "fisher_exact",
                "chi2": None,
                "p_value": fisher["p_value"],
                "odds_ratio": fisher["odds_ratio"],
                "proportion1": counts1 / total1 if total1 else 0.0,
                "proportion2": counts2 / total2 if total2 else 0.0,
                "absolute_lift": (counts2 / total2) - (counts1 / total1) if total1 and total2 else 0.0,
            }

        table = [[a, b], [c, d]]
        chi2 = 0.0
        for row_idx in range(2):
            for col_idx in range(2):
                exp = (row_totals[row_idx] * col_totals[col_idx]) / grand_total if grand_total else 0.0
                obs = float(table[row_idx][col_idx])
                if exp > 0:
                    chi2 += ((obs - exp) ** 2) / exp

        # For a 2x2 contingency table, degrees of freedom is 1.
        p_value = float(math.erfc(math.sqrt(max(chi2, 0.0) / 2.0)))
        return {
            "method": "chi_square",
            "chi2": float(chi2),
            "p_value": float(p_value),
            "proportion1": counts1 / total1 if total1 else 0.0,
            "proportion2": counts2 / total2 if total2 else 0.0,
            "absolute_lift": (counts2 / total2) - (counts1 / total1) if total1 and total2 else 0.0,
        }

    @staticmethod
    def compare_groups(metrics: List[LearnerMetrics]) -> Dict:
        control = [metric for metric in metrics if metric.group == "rule_based"]
        treatment = [metric for metric in metrics if metric.group == "rl_based"]
        return {
            "pass_rate": StatisticalAnalyzer.chi_square_test(sum(metric.pass_icdl() for metric in control), len(control), sum(metric.pass_icdl() for metric in treatment), len(treatment)) if control and treatment else {},
            "post_test_score": StatisticalAnalyzer.two_sample_t_test([metric.post_test_score for metric in control], [metric.post_test_score for metric in treatment]) if control and treatment else {},
            "improvement": StatisticalAnalyzer.two_sample_t_test([metric.improvement_score() for metric in control], [metric.improvement_score() for metric in treatment]) if control and treatment else {},
        }
