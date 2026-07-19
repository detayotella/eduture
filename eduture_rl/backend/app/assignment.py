from __future__ import annotations

from sqlalchemy.orm import Session

from .models import ABTestAssignment


def _normalize_style(dominant_style: str | None) -> str | None:
    if dominant_style is None:
        return None
    style = dominant_style.strip().lower()
    return style or None


def _next_group_assignment(db: Session, learner_id: int, dominant_style: str | None = None) -> str:
    style = _normalize_style(dominant_style)

    # Primary strategy: keep groups balanced within each dominant style stratum.
    # Fallback: if style is unavailable, balance globally.
    scoped_query = db.query(ABTestAssignment)
    if style is not None:
        scoped_query = scoped_query.filter(ABTestAssignment.stratified_by_style == style)

    rule_count = scoped_query.filter(ABTestAssignment.group_assignment == "rule_based").count()
    rl_count = scoped_query.filter(ABTestAssignment.group_assignment == "rl_based").count()

    if rule_count < rl_count:
        return "rule_based"
    if rl_count < rule_count:
        return "rl_based"

    # Tie-breaker: deterministic by learner id so restarts don't bias to one group.
    return "rl_based" if learner_id % 2 == 0 else "rule_based"


def ensure_ab_assignment(db: Session, learner_id: int, dominant_style: str | None = None) -> ABTestAssignment:
    style = _normalize_style(dominant_style)
    assignment = (
        db.query(ABTestAssignment)
        .filter(ABTestAssignment.learner_id == learner_id)
        .first()
    )
    if assignment is not None:
        # Backfill style stratum for already-assigned learners when style is known.
        if assignment.stratified_by_style is None and style is not None:
            assignment.stratified_by_style = style
            db.commit()
            db.refresh(assignment)
        return assignment

    assigned_group = _next_group_assignment(db, learner_id, dominant_style=style)
    assignment = ABTestAssignment(
        learner_id=learner_id,
        group_assignment=assigned_group,
        stratified_by_style=style,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment
