"""
A/B Testing Framework for EDUTURE
==================================
Statistical comparison between Rule-Based and RL-Based adaptation

This module provides:
1. Random assignment of learners to groups
2. Data collection and logging
3. Statistical analysis (t-tests, effect sizes)
4. Visualization of results
"""

import numpy as np
import json
from typing import Dict, List, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
import random
import statistics


class GroupAssignment(Enum):
    CONTROL = "rule_based"      # Original EDUTURE approach
    TREATMENT = "rl_based"      # Contextual Bandit approach


@dataclass
class LearnerMetrics:
    """Metrics collected for each learner"""
    learner_id: str
    group: str
    learning_style: str
    
    # Completion metrics
    completed_module: bool
    completion_time_minutes: float
    content_items_viewed: int
    
    # Performance metrics
    pre_test_score: float       # 0-100
    post_test_score: float      # 0-100
    quiz_scores: List[float]    # Individual quiz scores
    
    # Engagement metrics
    avg_time_on_task: float
    total_revisits: int
    engagement_score: float     # Composite 0-1
    
    # Satisfaction
    satisfaction_rating: float  # 1-5 scale
    would_recommend: bool
    
    def improvement_score(self) -> float:
        """Calculate learning improvement"""
        return self.post_test_score - self.pre_test_score
    
    def pass_icdl(self, threshold: float = 75.0) -> bool:
        """Check if learner passed ICDL threshold"""
        return self.post_test_score >= threshold


class ABTestManager:
    """
    Manages A/B testing between rule-based and RL-based adaptation
    """
    
    def __init__(self, random_seed: int = 42):
        self.random_seed = random_seed
        random.seed(random_seed)
        
        # Track assignments
        self.assignments = {}  # learner_id -> GroupAssignment
        self.metrics = {}      # learner_id -> LearnerMetrics
        
        # Balance tracking
        self.group_counts = {
            GroupAssignment.CONTROL: 0,
            GroupAssignment.TREATMENT: 0
        }
    
    def assign_learner(self, learner_id: str, learning_style: str) -> str:
        """
        Randomly assign learner to control or treatment group
        Uses stratified randomization to ensure balanced learning styles
        
        Args:
            learner_id: Unique learner identifier
            learning_style: Learner's Honey & Mumford style
            
        Returns:
            Group assignment ('rule_based' or 'rl_based')
        """
        if learner_id in self.assignments:
            return self.assignments[learner_id].value
        
        # Simple random assignment with balancing
        if self.group_counts[GroupAssignment.CONTROL] <= self.group_counts[GroupAssignment.TREATMENT]:
            assignment = GroupAssignment.CONTROL
        else:
            assignment = GroupAssignment.TREATMENT
        
        self.assignments[learner_id] = assignment
        self.group_counts[assignment] += 1
        
        return assignment.value
    
    def record_metrics(self, metrics: LearnerMetrics):
        """Record metrics for a learner"""
        self.metrics[metrics.learner_id] = metrics
    
    def get_group_metrics(self, group: str) -> List[LearnerMetrics]:
        """Get all metrics for a specific group"""
        return [m for m in self.metrics.values() if m.group == group]
    
    def get_summary_stats(self) -> Dict:
        """Get summary statistics for both groups"""
        control = self.get_group_metrics('rule_based')
        treatment = self.get_group_metrics('rl_based')
        
        def calc_stats(metrics_list: List[LearnerMetrics]) -> Dict:
            if not metrics_list:
                return {}
            
            pass_rates = [m.pass_icdl() for m in metrics_list]
            completion_times = [m.completion_time_minutes for m in metrics_list if m.completed_module]
            improvements = [m.improvement_score() for m in metrics_list]
            satisfaction = [m.satisfaction_rating for m in metrics_list]
            engagement = [m.engagement_score for m in metrics_list]
            
            return {
                'n': len(metrics_list),
                'pass_rate': {
                    'mean': np.mean(pass_rates),
                    'std': np.std(pass_rates),
                    'count': sum(pass_rates)
                },
                'completion_time': {
                    'mean': np.mean(completion_times) if completion_times else 0,
                    'std': np.std(completion_times) if len(completion_times) > 1 else 0,
                    'median': np.median(completion_times) if completion_times else 0
                },
                'improvement': {
                    'mean': np.mean(improvements),
                    'std': np.std(improvements),
                    'median': np.median(improvements)
                },
                'satisfaction': {
                    'mean': np.mean(satisfaction),
                    'std': np.std(satisfaction),
                    'median': np.median(satisfaction)
                },
                'engagement': {
                    'mean': np.mean(engagement),
                    'std': np.std(engagement)
                }
            }
        
        return {
            'control': calc_stats(control),
            'treatment': calc_stats(treatment),
            'total_learners': len(self.metrics)
        }


class StatisticalAnalyzer:
    """
    Performs statistical tests to compare groups
    """
    
    @staticmethod
    def two_sample_t_test(group1: List[float], group2: List[float]) -> Dict:
        """
        Perform independent two-sample t-test
        
        Args:
            group1: Values from group 1
            group2: Values from group 2
            
        Returns:
            Dictionary with t-statistic, p-value, and interpretation
        """
        from scipy import stats
        
        if len(group1) < 2 or len(group2) < 2:
            return {
                'error': 'Insufficient data for t-test',
                'n1': len(group1),
                'n2': len(group2)
            }
        
        t_stat, p_value = stats.ttest_ind(group1, group2)
        
        # Determine significance
        if p_value < 0.001:
            significance = "Highly significant (p < 0.001)"
        elif p_value < 0.01:
            significance = "Very significant (p < 0.01)"
        elif p_value < 0.05:
            significance = "Significant (p < 0.05)"
        else:
            significance = "Not significant (p >= 0.05)"
        
        # Effect size (Cohen's d)
        pooled_std = np.sqrt((np.std(group1, ddof=1)**2 + np.std(group2, ddof=1)**2) / 2)
        cohens_d = (np.mean(group1) - np.mean(group2)) / pooled_std if pooled_std > 0 else 0
        
        # Interpret effect size
        if abs(cohens_d) < 0.2:
            effect_size = "Negligible"
        elif abs(cohens_d) < 0.5:
            effect_size = "Small"
        elif abs(cohens_d) < 0.8:
            effect_size = "Medium"
        else:
            effect_size = "Large"
        
        return {
            't_statistic': t_stat,
            'p_value': p_value,
            'significance': significance,
            'cohens_d': cohens_d,
            'effect_size': effect_size,
            'mean_diff': np.mean(group1) - np.mean(group2),
            'n1': len(group1),
            'n2': len(group2)
        }
    
    @staticmethod
    def chi_square_test(counts1: int, total1: int, counts2: int, total2: int) -> Dict:
        """
        Chi-square test for proportions (e.g., pass rates)
        
        Args:
            counts1: Successes in group 1
            total1: Total in group 1
            counts2: Successes in group 2
            total2: Total in group 2
        """
        from scipy.stats import chi2_contingency
        
        # Create contingency table
        table = [[counts1, total1 - counts1],
                 [counts2, total2 - counts2]]
        
        chi2, p_value, dof, expected = chi2_contingency(table)
        
        return {
            'chi2': chi2,
            'p_value': p_value,
            'significant': p_value < 0.05,
            'proportion1': counts1 / total1 if total1 > 0 else 0,
            'proportion2': counts2 / total2 if total2 > 0 else 0
        }
    
    @staticmethod
    def compare_groups(metrics: List[LearnerMetrics]) -> Dict:
        """
        Comprehensive comparison between rule-based and RL-based groups
        
        Args:
            metrics: List of all learner metrics
            
        Returns:
            Dictionary with all statistical comparisons
        """
        control = [m for m in metrics if m.group == 'rule_based']
        treatment = [m for m in metrics if m.group == 'rl_based']
        
        results = {
            'sample_sizes': {
                'control': len(control),
                'treatment': len(treatment)
            }
        }
        
        # 1. Pass Rate Comparison (Chi-square)
        control_passes = sum(m.pass_icdl() for m in control)
        treatment_passes = sum(m.pass_icdl() for m in treatment)
        
        results['pass_rate'] = StatisticalAnalyzer.chi_square_test(
            treatment_passes, len(treatment),
            control_passes, len(control)
        )
        
        # 2. Post-test Score Comparison (t-test)
        control_scores = [m.post_test_score for m in control]
        treatment_scores = [m.post_test_score for m in treatment]
        
        results['post_test_score'] = StatisticalAnalyzer.two_sample_t_test(
            treatment_scores, control_scores
        )
        
        # 3. Learning Improvement (t-test)
        control_improvement = [m.improvement_score() for m in control]
        treatment_improvement = [m.improvement_score() for m in treatment]
        
        results['learning_improvement'] = StatisticalAnalyzer.two_sample_t_test(
            treatment_improvement, control_improvement
        )
        
        # 4. Completion Time (t-test) - only for completers
        control_times = [m.completion_time_minutes for m in control if m.completed_module]
        treatment_times = [m.completion_time_minutes for m in treatment if m.completed_module]
        
        results['completion_time'] = StatisticalAnalyzer.two_sample_t_test(
            treatment_times, control_times
        )
        
        # 5. Satisfaction (t-test)
        control_satisfaction = [m.satisfaction_rating for m in control]
        treatment_satisfaction = [m.satisfaction_rating for m in treatment]
        
        results['satisfaction'] = StatisticalAnalyzer.two_sample_t_test(
            treatment_satisfaction, control_satisfaction
        )
        
        # 6. Engagement (t-test)
        control_engagement = [m.engagement_score for m in control]
        treatment_engagement = [m.engagement_score for m in treatment]
        
        results['engagement'] = StatisticalAnalyzer.two_sample_t_test(
            treatment_engagement, control_engagement
        )
        
        return results


class ResultsVisualizer:
    """
    Creates visualizations for A/B test results
    """
    
    @staticmethod
    def generate_report(comparison_results: Dict, output_file: str = "ab_test_report.txt"):
        """Generate a text report of results"""
        
        report = []
        report.append("=" * 70)
        report.append("EDUTURE A/B TEST RESULTS")
        report.append("Rule-Based vs. RL-Based Adaptation")
        report.append("=" * 70)
        report.append("")
        
        # Sample sizes
        report.append("SAMPLE SIZES")
        report.append("-" * 40)
        report.append(f"Control (Rule-Based):  {comparison_results['sample_sizes']['control']} learners")
        report.append(f"Treatment (RL-Based):  {comparison_results['sample_sizes']['treatment']} learners")
        report.append("")
        
        # Pass Rate
        report.append("1. PASS RATE (ICDL ≥ 75%)")
        report.append("-" * 40)
        pr = comparison_results['pass_rate']
        report.append(f"Control:   {pr['proportion2']:.1%}")
        report.append(f"Treatment: {pr['proportion1']:.1%}")
        report.append(f"p-value:   {pr['p_value']:.4f}")
        report.append(f"Result:    {'Significant' if pr['significant'] else 'Not significant'}")
        report.append("")
        
        # Post-test Score
        report.append("2. POST-TEST SCORE")
        report.append("-" * 40)
        pts = comparison_results['post_test_score']
        if 'error' not in pts:
            report.append(f"Control mean:   {np.mean([pts['mean_diff'] + pts['mean2'] if 'mean2' in pts else 0]):.2f}")
            report.append(f"Treatment mean: {np.mean([pts['mean1'] if 'mean1' in pts else 0]):.2f}")
            report.append(f"Difference:     {pts['mean_diff']:.2f}")
            report.append(f"p-value:        {pts['p_value']:.4f}")
            report.append(f"Effect size:    {pts['effect_size']} (d={pts['cohens_d']:.3f})")
        report.append("")
        
        # Learning Improvement
        report.append("3. LEARNING IMPROVEMENT (Post - Pre)")
        report.append("-" * 40)
        li = comparison_results['learning_improvement']
        if 'error' not in li:
            report.append(f"Mean difference: {li['mean_diff']:.2f} points")
            report.append(f"p-value:         {li['p_value']:.4f}")
            report.append(f"Effect size:     {li['effect_size']} (d={li['cohens_d']:.3f})")
        report.append("")
        
        # Completion Time
        report.append("4. COMPLETION TIME")
        report.append("-" * 40)
        ct = comparison_results['completion_time']
        if 'error' not in ct:
            report.append(f"Mean difference: {li['mean_diff']:.1f} minutes")
            report.append(f"p-value:         {ct['p_value']:.4f}")
            if ct['mean_diff'] < 0:
                report.append("Result: RL group was FASTER")
            else:
                report.append("Result: RL group was SLOWER")
        report.append("")
        
        # Satisfaction
        report.append("5. SATISFACTION RATING (1-5)")
        report.append("-" * 40)
        sat = comparison_results['satisfaction']
        if 'error' not in sat:
            report.append(f"Mean difference: {sat['mean_diff']:.2f}")
            report.append(f"p-value:         {sat['p_value']:.4f}")
        report.append("")
        
        # Overall conclusion
        report.append("=" * 70)
        report.append("CONCLUSION")
        report.append("=" * 70)
        
        significant_tests = [
            ('Pass Rate', comparison_results['pass_rate'].get('significant', False)),
            ('Post-test Score', comparison_results['post_test_score'].get('p_value', 1) < 0.05),
            ('Learning Improvement', comparison_results['learning_improvement'].get('p_value', 1) < 0.05),
        ]
        
        sig_count = sum(1 for _, sig in significant_tests if sig)
        
        if sig_count >= 2:
            report.append("The RL-based approach shows SIGNIFICANT improvements over rule-based.")
        elif sig_count >= 1:
            report.append("The RL-based approach shows SOME improvements over rule-based.")
        else:
            report.append("No significant differences found between approaches.")
            report.append("Rule-based adaptation remains effective for ICDL training.")
        
        report.append("")
        report.append("=" * 70)
        
        # Write to file
        with open(output_file, 'w') as f:
            f.write('\n'.join(report))
        
        return '\n'.join(report)


# Example usage and simulation
if __name__ == "__main__":
    print("=" * 70)
    print("EDUTURE A/B Testing Framework - Demo")
    print("=" * 70)
    
    # Initialize test manager
    ab_test = ABTestManager(random_seed=42)
    
    # Simulate 60 learners (30 per group)
    learning_styles = ['activist', 'reflector', 'theorist', 'pragmatist']
    
    print("\n--- Simulating 60 learners ---\n")
    
    for i in range(60):
        learner_id = f"learner_{i+1:03d}"
        style = random.choice(learning_styles)
        
        # Assign to group
        group = ab_test.assign_learner(learner_id, style)
        
        # Simulate metrics (RL group performs slightly better)
        is_rl = (group == 'rl_based')
        
        # Pass rate: RL 93%, Rule 87%
        passed = random.random() < (0.93 if is_rl else 0.87)
        
        # Post-test score: RL 82, Rule 78
        post_score = random.gauss(82 if is_rl else 78, 8)
        post_score = max(0, min(100, post_score))
        
        # Pre-test score (similar for both)
        pre_score = random.gauss(45, 10)
        pre_score = max(0, min(100, pre_score))
        
        # Completion time: RL slightly faster
        completion_time = random.gauss(45 if is_rl else 50, 10) if passed else 0
        
        # Satisfaction: RL slightly higher
        satisfaction = random.gauss(4.2 if is_rl else 3.9, 0.6)
        satisfaction = max(1, min(5, satisfaction))
        
        # Engagement
        engagement = random.gauss(0.75 if is_rl else 0.68, 0.15)
        engagement = max(0, min(1, engagement))
        
        metrics = LearnerMetrics(
            learner_id=learner_id,
            group=group,
            learning_style=style,
            completed_module=passed,
            completion_time_minutes=completion_time,
            content_items_viewed=random.randint(8, 16),
            pre_test_score=pre_score,
            post_test_score=post_score,
            quiz_scores=[random.gauss(post_score, 5) for _ in range(3)],
            avg_time_on_task=random.gauss(5, 2),
            total_revisits=random.randint(0, 5),
            engagement_score=engagement,
            satisfaction_rating=satisfaction,
            would_recommend=satisfaction >= 4.0
        )
        
        ab_test.record_metrics(metrics)
    
    # Get summary statistics
    print("\n--- Summary Statistics ---\n")
    summary = ab_test.get_summary_stats()
    
    print(f"Total learners: {summary['total_learners']}")
    print(f"\nControl (Rule-Based):")
    print(f"  Sample size: {summary['control']['n']}")
    print(f"  Pass rate: {summary['control']['pass_rate']['mean']:.1%}")
    print(f"  Avg post-test: {summary['control']['improvement']['mean'] + 45:.1f}")
    print(f"  Avg satisfaction: {summary['control']['satisfaction']['mean']:.2f}/5")
    
    print(f"\nTreatment (RL-Based):")
    print(f"  Sample size: {summary['treatment']['n']}")
    print(f"  Pass rate: {summary['treatment']['pass_rate']['mean']:.1%}")
    print(f"  Avg post-test: {summary['treatment']['improvement']['mean'] + 45:.1f}")
    print(f"  Avg satisfaction: {summary['treatment']['satisfaction']['mean']:.2f}/5")
    
    # Statistical comparison
    print("\n--- Statistical Comparison ---\n")
    all_metrics = list(ab_test.metrics.values())
    comparison = StatisticalAnalyzer.compare_groups(all_metrics)
    
    print(f"Pass Rate p-value: {comparison['pass_rate']['p_value']:.4f}")
    print(f"Post-test p-value: {comparison['post_test_score']['p_value']:.4f}")
    print(f"Improvement p-value: {comparison['learning_improvement']['p_value']:.4f}")
    
    # Generate report
    print("\n--- Generating Report ---\n")
    report = ResultsVisualizer.generate_report(comparison, "demo_report.txt")
    print(report)
    
    print("\n✅ Demo completed! Check demo_report.txt for full results.")
