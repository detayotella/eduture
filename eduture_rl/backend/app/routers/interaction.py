from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..engines.contextual_bandit import LearnerState, RewardCalculator, adaptive_engine
from ..models import ABTestAssignment, ContentFragment, Interaction, Learner, LearningStyle
from ..schemas import InteractionRequest, ResponseEnvelope

router = APIRouter(prefix="/interaction", tags=["interaction"])


def _bucket_activity(count: int) -> str:
    if count <= 0:
        return "0"
    if count == 1:
        return "20"
    if count == 2:
        return "40"
    if count == 3:
        return "60"
    if count == 4:
        return "80"
    return "100"


@router.post("/record", response_model=ResponseEnvelope)
def record_interaction(payload: InteractionRequest, request: Request, current_user: Learner = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.learner_id is not None and payload.learner_id != current_user.id:
        raise HTTPException(status_code=403, detail={"code": "AUTHORIZATION_ERROR", "message": "Cannot record interaction for another learner", "details": []})

    style_row = db.query(LearningStyle).filter(LearningStyle.learner_id == current_user.id).first()
    assignment = db.query(ABTestAssignment).filter(ABTestAssignment.learner_id == current_user.id).first()
    fragment = db.query(ContentFragment).filter(ContentFragment.id == payload.content_id).first()
    if fragment is None:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Content not found", "details": []})

    dominant_style = style_row.dominant_style if style_row else "activist"
    state = LearnerState(
        learner_id=str(current_user.id),
        time_on_task=min(1.0, payload.actual_time / max(payload.expected_time, 1.0)),
        error_rate=max(0.0, 1.0 - payload.quiz_score / 100.0),
        revisit_count=1.0 if payload.is_revisit else 0.0,
        completion_rate=1.0 if payload.completed else 0.0,
        engagement_score=max(0.0, min(1.0, payload.scroll_depth if payload.scroll_depth else 0.5)),
        learning_style=dominant_style,
        topic_difficulty=fragment.difficulty,
    )
    reward = RewardCalculator.calculate(
        {
            "completed": payload.completed,
            "quiz_score": payload.quiz_score,
            "expected_time": payload.expected_time,
            "actual_time": payload.actual_time,
            "is_revisit": payload.is_revisit,
        }
    )
    adaptive_engine.record_interaction(state, fragment.content_type, reward)
    row = Interaction(
        learner_id=current_user.id,
        content_id=fragment.id,
        group_assigned=assignment.group_assignment if assignment else "rule_based",
        context_time_on_task=state.time_on_task,
        context_error_rate=state.error_rate,
        context_revisit_count=state.revisit_count,
        context_completion_rate=state.completion_rate,
        context_engagement_score=state.engagement_score,
        context_learning_style=state.learning_style,
        context_topic_difficulty=state.topic_difficulty,
        recommended_content_type=fragment.content_type,
        completed=payload.completed,
        quiz_score=payload.quiz_score,
        actual_time_minutes=int(payload.actual_time),
        is_revisit=payload.is_revisit,
        reward=reward,
        scroll_depth=payload.scroll_depth,
        click_count=payload.click_count,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    db.add(row)
    db.commit()
    return ResponseEnvelope(data={"interaction_id": row.id, "reward": reward, "recommended_content_type": fragment.content_type, "last_route": adaptive_engine.get_learner_route(str(current_user.id))})


@router.get("/summary", response_model=ResponseEnvelope)
def interaction_summary(current_user: Learner = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    start_date = (now - timedelta(days=13)).date()

    rows = (
        db.query(Interaction)
        .filter(Interaction.learner_id == current_user.id)
        .order_by(Interaction.timestamp.desc())
        .all()
    )

    counts_by_day: dict = {}
    for row in rows:
        day = row.timestamp.date()
        if day < start_date:
            continue
        counts_by_day[day] = counts_by_day.get(day, 0) + 1

    activity_density = []
    for idx in range(14):
        day = start_date + timedelta(days=idx)
        if idx == 13:
            activity_density.append("today")
            continue
        activity_density.append(_bucket_activity(counts_by_day.get(day, 0)))

    streak_days = 0
    probe_day = now.date()
    while counts_by_day.get(probe_day, 0) > 0:
        streak_days += 1
        probe_day -= timedelta(days=1)

    recent_entries = rows[:20]
    avg_minutes = 0
    if recent_entries:
        valid_minutes = [entry.actual_time_minutes for entry in recent_entries if entry.actual_time_minutes is not None and entry.actual_time_minutes > 0]
        if valid_minutes:
            avg_minutes = int(sum(valid_minutes) / len(valid_minutes))

    estimated_hours = max(4, int(round(max(avg_minutes, 30) * 24 / 60)))
    recommended_read_minutes = max(10, min(90, max(avg_minutes, 45)))

    tomorrow_10 = (now + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
    friday_14 = (now + timedelta(days=((4 - now.weekday()) % 7 or 7))).replace(hour=14, minute=0, second=0, microsecond=0)

    checkpoints = [
        {"title": "Architecture Quiz", "scheduled_at": tomorrow_10.isoformat() + "Z"},
        {"title": "Peer Code Review", "scheduled_at": friday_14.isoformat() + "Z"},
    ]

    return ResponseEnvelope(
        data={
            "streak_days": streak_days,
            "activity_density": activity_density,
            "estimated_hours": estimated_hours,
            "recommended_read_minutes": recommended_read_minutes,
            "checkpoints": checkpoints,
        }
    )
