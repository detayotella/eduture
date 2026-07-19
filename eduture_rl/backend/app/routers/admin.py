from __future__ import annotations

from collections import defaultdict

from fastapi import APIRouter, Depends, Request
from sqlalchemy import and_
from sqlalchemy.orm import Session

from ..audit import log_audit_event
from ..database import get_db
from ..dependencies import require_admin
from ..models import ABTestAssignment, Assessment, Interaction, Learner, LearningStyle
from ..schemas import ResponseEnvelope
from ..utils.ab_testing import StatisticalAnalyzer
from .assessment import ab_manager

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=ResponseEnvelope)
def stats(
    request: Request, admin=Depends(require_admin), db: Session = Depends(get_db)
):
    stats_payload = ab_manager.get_summary_stats()

    learners = db.query(Learner).filter(Learner.is_admin.is_(False)).all()
    total_learners = len(learners)
    learner_ids = {row.id for row in learners}

    assignments = (
        db.query(ABTestAssignment)
        .filter(ABTestAssignment.learner_id.in_(learner_ids) if learner_ids else False)
        .all()
    )
    assignment_by_learner = {row.learner_id: row.group_assignment for row in assignments}
    rule_based_count = sum(1 for row in assignments if row.group_assignment == "rule_based")
    rl_based_count = sum(1 for row in assignments if row.group_assignment == "rl_based")
    assigned_count = rule_based_count + rl_based_count

    assessed_learners = (
        db.query(LearningStyle)
        .filter(LearningStyle.learner_id.in_(learner_ids) if learner_ids else False)
        .count()
    )

    post_tests = (
        db.query(Assessment)
        .filter(
            and_(
                Assessment.learner_id.in_(learner_ids) if learner_ids else False,
                Assessment.assessment_type == "post_test",
            )
        )
        .all()
    )
    passed_post_tests = sum(
        1
        for row in post_tests
        if (row.passed is True) or (row.passed is None and row.score >= 75.0)
    )
    pass_rate = (passed_post_tests / len(post_tests)) if post_tests else 0.0

    interactions = (
        db.query(Interaction)
        .filter(Interaction.learner_id.in_(learner_ids) if learner_ids else False)
        .all()
    )
    completed_interactions = sum(1 for row in interactions if row.completed)
    completion_rate = (
        (completed_interactions / len(interactions)) if interactions else 0.0
    )

    # Group-level performance using persisted DB data
    group_interactions: dict[str, list[Interaction]] = defaultdict(list)
    group_post_scores: dict[str, list[float]] = defaultdict(list)
    group_satisfaction: dict[str, list[float]] = defaultdict(list)
    group_pass_counts: dict[str, int] = defaultdict(int)
    group_post_counts: dict[str, int] = defaultdict(int)

    for row in interactions:
        group = row.group_assigned or assignment_by_learner.get(row.learner_id)
        if group in {"rule_based", "rl_based"}:
            group_interactions[group].append(row)

    for row in post_tests:
        group = assignment_by_learner.get(row.learner_id)
        if group in {"rule_based", "rl_based"}:
            group_post_scores[group].append(float(row.score))
            group_post_counts[group] += 1
            if (row.passed is True) or (row.passed is None and row.score >= 75.0):
                group_pass_counts[group] += 1
            if row.satisfaction_rating is not None:
                group_satisfaction[group].append(float(row.satisfaction_rating))

    def _group_summary(group_key: str) -> dict:
        rows = group_interactions[group_key]
        completions = sum(1 for row in rows if row.completed)
        engagement_values = [float(row.context_engagement_score) for row in rows if row.context_engagement_score is not None]
        return {
            "n": len(rows),
            "pass_rate": (group_pass_counts[group_key] / group_post_counts[group_key]) if group_post_counts[group_key] else 0.0,
            "completion_rate": (completions / len(rows)) if rows else 0.0,
            "engagement": (sum(engagement_values) / len(engagement_values)) if engagement_values else 0.0,
            "satisfaction": (sum(group_satisfaction[group_key]) / len(group_satisfaction[group_key])) if group_satisfaction[group_key] else 0.0,
            "post_test_count": group_post_counts[group_key],
        }

    stats_payload["control"] = _group_summary("rule_based")
    stats_payload["treatment"] = _group_summary("rl_based")

    # Statistical comparisons using DB-derived samples
    control_pass = group_pass_counts["rule_based"]
    control_total = group_post_counts["rule_based"]
    treatment_pass = group_pass_counts["rl_based"]
    treatment_total = group_post_counts["rl_based"]

    comparisons = {
        "pass_rate": StatisticalAnalyzer.chi_square_test(control_pass, control_total, treatment_pass, treatment_total)
        if control_total > 0 and treatment_total > 0
        else {},
        "post_test_score": StatisticalAnalyzer.two_sample_t_test(group_post_scores["rule_based"], group_post_scores["rl_based"])
        if len(group_post_scores["rule_based"]) > 1 and len(group_post_scores["rl_based"]) > 1
        else {},
        "completion_rate": StatisticalAnalyzer.chi_square_test(
            sum(1 for row in group_interactions["rule_based"] if row.completed),
            len(group_interactions["rule_based"]),
            sum(1 for row in group_interactions["rl_based"] if row.completed),
            len(group_interactions["rl_based"]),
        )
        if group_interactions["rule_based"] and group_interactions["rl_based"]
        else {},
        "satisfaction": StatisticalAnalyzer.two_sample_t_test(group_satisfaction["rule_based"], group_satisfaction["rl_based"])
        if len(group_satisfaction["rule_based"]) > 1 and len(group_satisfaction["rl_based"]) > 1
        else {},
    }
    stats_payload["comparisons"] = comparisons

    # Exercise question-level analytics
    exercise_rows = (
        db.query(Assessment)
        .filter(
            and_(
                Assessment.learner_id.in_(learner_ids) if learner_ids else False,
                Assessment.assessment_type == "exercise",
            )
        )
        .all()
    )
    question_stats: dict[str, dict] = defaultdict(lambda: {
        "question_id": None,
        "question": None,
        "attempts": 0,
        "correct": 0,
        "accuracy": 0.0,
        "by_group": {
            "rule_based": {"attempts": 0, "correct": 0, "accuracy": 0.0},
            "rl_based": {"attempts": 0, "correct": 0, "accuracy": 0.0},
        },
    })

    for row in exercise_rows:
        if not isinstance(row.responses, dict):
            continue
        group = assignment_by_learner.get(row.learner_id)
        for qid, details in row.responses.items():
            if not isinstance(details, dict):
                continue
            bucket = question_stats[qid]
            bucket["question_id"] = qid
            bucket["question"] = details.get("question")
            bucket["attempts"] += 1
            is_correct = bool(details.get("is_correct"))
            if is_correct:
                bucket["correct"] += 1
            if group in {"rule_based", "rl_based"}:
                bucket["by_group"][group]["attempts"] += 1
                if is_correct:
                    bucket["by_group"][group]["correct"] += 1

    exercise_question_stats = []
    for payload in question_stats.values():
        payload["accuracy"] = (payload["correct"] / payload["attempts"]) if payload["attempts"] else 0.0
        for group_key in ("rule_based", "rl_based"):
            grp = payload["by_group"][group_key]
            grp["accuracy"] = (grp["correct"] / grp["attempts"]) if grp["attempts"] else 0.0
        exercise_question_stats.append(payload)

    exercise_question_stats.sort(key=lambda item: item["attempts"], reverse=True)
    stats_payload["exercise_analytics"] = {
        "assessment_count": len(exercise_rows),
        "question_stats": exercise_question_stats,
    }

    stats_payload["total_learners"] = total_learners
    stats_payload["assessed_learners"] = assessed_learners
    stats_payload["unassessed_learners"] = max(0, total_learners - assessed_learners)
    stats_payload["assignments"] = {
        "rule_based": rule_based_count,
        "rl_based": rl_based_count,
    }
    stats_payload["assigned_learners"] = assigned_count
    stats_payload["unassigned_learners"] = max(0, total_learners - assigned_count)
    stats_payload["post_test_count"] = len(post_tests)
    stats_payload["passed_post_test_count"] = passed_post_tests
    stats_payload["pass_rate"] = pass_rate
    stats_payload["interaction_count"] = len(interactions)
    stats_payload["completed_interaction_count"] = completed_interactions
    stats_payload["completion_rate"] = completion_rate

    log_audit_event("admin.stats.view", "success", request=request, actor_id=admin.id)
    return ResponseEnvelope(data=stats_payload)


@router.get("/learners", response_model=ResponseEnvelope)
def learners(
    request: Request, admin=Depends(require_admin), db: Session = Depends(get_db)
):
    rows = db.query(Learner).all()
    data = []
    for row in rows:
        style = (
            db.query(LearningStyle).filter(LearningStyle.learner_id == row.id).first()
        )
        assignment = (
            db.query(ABTestAssignment)
            .filter(ABTestAssignment.learner_id == row.id)
            .first()
        )
        data.append(
            {
                "learner_id": row.id,
                "email": row.email,
                "full_name": row.full_name,
                "is_active": row.is_active,
                "is_admin": row.is_admin,
                "dominant_style": style.dominant_style if style else None,
                "group_assignment": assignment.group_assignment if assignment else None,
                "created_at": row.created_at,
            }
        )
    log_audit_event(
        "admin.learners.view",
        "success",
        request=request,
        actor_id=admin.id,
        details={"count": len(data)},
    )
    return ResponseEnvelope(data=data)


@router.get("/export", response_model=ResponseEnvelope)
def export(
    request: Request, admin=Depends(require_admin), db: Session = Depends(get_db)
):
    learners = db.query(Learner).count()
    styles = db.query(LearningStyle).count()
    assignments = db.query(ABTestAssignment).count()
    assessments = db.query(Assessment).count()
    log_audit_event(
        "admin.export.summary", "success", request=request, actor_id=admin.id
    )
    return ResponseEnvelope(
        data={
            "summary": {
                "learners": learners,
                "learning_styles": styles,
                "assignments": assignments,
                "assessments": assessments,
            }
        }
    )
