from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import ABTestAssignment, ContentFragment, Learner, LearningStyle
from ..sample_data import MODULE_SUMMARIES
from ..schemas import RecommendationRequest, ResponseEnvelope
from ..engines.contextual_bandit import AdaptiveEngine, LearnerState

router = APIRouter(prefix="/content", tags=["content"])
rule_engine = AdaptiveEngine(mode="rule")
rl_engine = AdaptiveEngine(mode="rl", alpha=1.0)


@router.get("/modules", response_model=ResponseEnvelope)
def modules():
    return ResponseEnvelope(data=list(MODULE_SUMMARIES.values()))


@router.get("/recommend", response_model=ResponseEnvelope)
def recommend(payload: RecommendationRequest = Depends(), current_user: Learner = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.learner_id is not None and payload.learner_id != current_user.id:
        raise HTTPException(status_code=403, detail={"code": "AUTHORIZATION_ERROR", "message": "Cannot request recommendation for another learner", "details": []})

    style_row = db.query(LearningStyle).filter(LearningStyle.learner_id == current_user.id).first()
    dominant_style = style_row.dominant_style if style_row else "activist"
    assignment = db.query(ABTestAssignment).filter(ABTestAssignment.learner_id == current_user.id).first()
    if assignment is None and style_row is not None:
        assignment = ABTestAssignment(learner_id=current_user.id, group_assignment="rule_based", stratified_by_style=dominant_style)
        db.add(assignment)
        db.commit()
        db.refresh(assignment)

    learner_state = LearnerState(
        learner_id=str(current_user.id),
        time_on_task=payload.time_on_task,
        error_rate=payload.error_rate,
        revisit_count=payload.revisit_count,
        completion_rate=payload.completion_rate,
        engagement_score=payload.engagement_score,
        learning_style=dominant_style,
        topic_difficulty=payload.topic_difficulty,
    )
    engine = rl_engine if assignment and assignment.group_assignment == "rl_based" else rule_engine
    content_type = engine.get_next_content(learner_state)
    query = db.query(ContentFragment).filter(ContentFragment.content_type == content_type, ContentFragment.is_active.is_(True)).order_by(ContentFragment.sequence_order.asc())
    fragment = query.first() or db.query(ContentFragment).filter(ContentFragment.is_active.is_(True)).order_by(ContentFragment.sequence_order.asc()).first()
    if fragment is None:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "No content available", "details": []})
    return ResponseEnvelope(
        data={
            "group": assignment.group_assignment if assignment else "rule_based",
            "recommended_content_type": content_type,
            "content": {
                "id": fragment.id,
                "module_id": fragment.module_id,
                "topic_id": fragment.topic_id,
                "content_type": fragment.content_type,
                "sequence_order": fragment.sequence_order,
                "title": fragment.title,
                "content_data": fragment.content_data,
                "difficulty": fragment.difficulty,
                "estimated_time_minutes": fragment.estimated_time_minutes,
            },
        }
    )


@router.get("/{content_id}", response_model=ResponseEnvelope)
def content(content_id: int, db: Session = Depends(get_db)):
    fragment = db.query(ContentFragment).filter(ContentFragment.id == content_id, ContentFragment.is_active.is_(True)).first()
    if fragment is None:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Content not found", "details": []})
    return ResponseEnvelope(
        data={
            "id": fragment.id,
            "module_id": fragment.module_id,
            "topic_id": fragment.topic_id,
            "content_type": fragment.content_type,
            "sequence_order": fragment.sequence_order,
            "title": fragment.title,
            "content_data": fragment.content_data,
            "difficulty": fragment.difficulty,
            "estimated_time_minutes": fragment.estimated_time_minutes,
        }
    )
