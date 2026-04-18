from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Assessment, ABTestAssignment, LearningStyle
from ..schemas import AssessmentRequest, ResponseEnvelope
from ..utils.ab_testing import ABTestManager, LearnerMetrics

router = APIRouter(prefix="/assessment", tags=["assessment"])
ab_manager = ABTestManager()


def _store_assessment(current_user, payload: AssessmentRequest, assessment_type: str, db: Session):
    result = Assessment(
        learner_id=current_user.id,
        content_id=payload.content_id,
        assessment_type=assessment_type,
        module_id=payload.module_id,
        score=payload.score,
        max_score=100.0,
        passed=payload.score >= 75.0,
        responses=payload.responses,
        completion_time_minutes=payload.completion_time_minutes,
        satisfaction_rating=payload.satisfaction_rating,
    )
    db.add(result)
    db.commit()
    db.refresh(result)

    assignment = db.query(ABTestAssignment).filter(ABTestAssignment.learner_id == current_user.id).first()
    style_row = db.query(LearningStyle).filter(LearningStyle.learner_id == current_user.id).first()
    pre_test = (
        db.query(Assessment)
        .filter(Assessment.learner_id == current_user.id, Assessment.assessment_type == "pre_test", Assessment.module_id == payload.module_id)
        .order_by(Assessment.taken_at.asc())
        .first()
    )
    post_test = (
        db.query(Assessment)
        .filter(Assessment.learner_id == current_user.id, Assessment.assessment_type == "post_test", Assessment.module_id == payload.module_id)
        .order_by(Assessment.taken_at.desc())
        .first()
    )
    if pre_test and post_test and assignment and style_row:
        metrics = LearnerMetrics(
            learner_id=str(current_user.id),
            group=assignment.group_assignment,
            learning_style=style_row.dominant_style,
            completed_module=True,
            completion_time_minutes=float(post_test.completion_time_minutes or 0),
            content_items_viewed=0,
            pre_test_score=pre_test.score,
            post_test_score=post_test.score,
            quiz_scores=[result.score],
            avg_time_on_task=0.5,
            total_revisits=0,
            engagement_score=0.5,
            satisfaction_rating=float(payload.satisfaction_rating or 4),
            would_recommend=True,
        )
        ab_manager.record_metrics(metrics)
    return result


@router.post("/pre-test", response_model=ResponseEnvelope)
def pre_test(payload: AssessmentRequest, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.learner_id != current_user.id:
        raise HTTPException(status_code=403, detail={"code": "AUTHORIZATION_ERROR", "message": "Cannot submit for another learner", "details": []})
    result = _store_assessment(current_user, payload, "pre_test", db)
    return ResponseEnvelope(data={"assessment_id": result.id, "assessment_type": result.assessment_type, "score": result.score, "passed": result.passed})


@router.post("/post-test", response_model=ResponseEnvelope)
def post_test(payload: AssessmentRequest, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.learner_id != current_user.id:
        raise HTTPException(status_code=403, detail={"code": "AUTHORIZATION_ERROR", "message": "Cannot submit for another learner", "details": []})
    result = _store_assessment(current_user, payload, "post_test", db)
    return ResponseEnvelope(data={"assessment_id": result.id, "assessment_type": result.assessment_type, "score": result.score, "passed": result.passed})
