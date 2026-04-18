from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from ..audit import log_audit_event
from ..database import get_db
from ..dependencies import require_admin
from ..models import ABTestAssignment, Assessment, Learner, LearningStyle
from ..schemas import ResponseEnvelope
from ..utils.ab_testing import StatisticalAnalyzer
from .assessment import ab_manager

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=ResponseEnvelope)
def stats(request: Request, admin=Depends(require_admin), db: Session = Depends(get_db)):
    assignment_rows = db.query(ABTestAssignment).all()
    metrics = list(ab_manager.metrics.values())
    stats_payload = ab_manager.get_summary_stats()
    stats_payload["comparisons"] = StatisticalAnalyzer.compare_groups(metrics)
    stats_payload["assignments"] = {"rule_based": sum(1 for row in assignment_rows if row.group_assignment == "rule_based"), "rl_based": sum(1 for row in assignment_rows if row.group_assignment == "rl_based")}
    log_audit_event("admin.stats.view", "success", request=request, actor_id=admin.id)
    return ResponseEnvelope(data=stats_payload)


@router.get("/learners", response_model=ResponseEnvelope)
def learners(request: Request, admin=Depends(require_admin), db: Session = Depends(get_db)):
    rows = db.query(Learner).all()
    data = []
    for row in rows:
        style = db.query(LearningStyle).filter(LearningStyle.learner_id == row.id).first()
        assignment = db.query(ABTestAssignment).filter(ABTestAssignment.learner_id == row.id).first()
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
    log_audit_event("admin.learners.view", "success", request=request, actor_id=admin.id, details={"count": len(data)})
    return ResponseEnvelope(data=data)


@router.get("/export", response_model=ResponseEnvelope)
def export(request: Request, admin=Depends(require_admin), db: Session = Depends(get_db)):
    learners = db.query(Learner).count()
    styles = db.query(LearningStyle).count()
    assignments = db.query(ABTestAssignment).count()
    assessments = db.query(Assessment).count()
    log_audit_event("admin.export.summary", "success", request=request, actor_id=admin.id)
    return ResponseEnvelope(data={"summary": {"learners": learners, "learning_styles": styles, "assignments": assignments, "assessments": assessments}})
