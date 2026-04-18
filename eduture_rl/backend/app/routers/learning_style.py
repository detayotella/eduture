from __future__ import annotations

from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import ABTestAssignment, Learner, LearningStyle
from ..sample_data import QUESTIONNAIRE_QUESTIONS
from ..schemas import QuestionnaireSubmitRequest, ResponseEnvelope
from ..utils.ab_testing import ABTestManager

router = APIRouter(prefix="/learning-style", tags=["learning-style"])

ab_manager = ABTestManager()


@router.get("/questionnaire", response_model=ResponseEnvelope)
def questionnaire():
    return ResponseEnvelope(data={"questions": QUESTIONNAIRE_QUESTIONS, "total": len(QUESTIONNAIRE_QUESTIONS)})


@router.post("/submit", response_model=ResponseEnvelope)
def submit(payload: QuestionnaireSubmitRequest, current_user: Learner = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.learner_id is not None and payload.learner_id != current_user.id:
        raise HTTPException(status_code=403, detail={"code": "AUTHORIZATION_ERROR", "message": "Cannot submit for another learner", "details": []})
    learner = db.query(Learner).filter(Learner.id == current_user.id).first()
    if learner is None:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Learner not found", "details": []})

    style_buckets = defaultdict(int)
    response_map = {item.question_id: item.answer for item in payload.responses}
    for question in QUESTIONNAIRE_QUESTIONS:
        if response_map.get(question["question_id"]):
            style_buckets[question["style"]] += 1

    dominant_style = max(["activist", "reflector", "theorist", "pragmatist"], key=lambda style: style_buckets[style])
    style_row = db.query(LearningStyle).filter(LearningStyle.learner_id == learner.id).first()
    if style_row is None:
        style_row = LearningStyle(learner_id=learner.id)
        db.add(style_row)

    style_row.activist_score = style_buckets["activist"]
    style_row.reflector_score = style_buckets["reflector"]
    style_row.theorist_score = style_buckets["theorist"]
    style_row.pragmatist_score = style_buckets["pragmatist"]
    style_row.dominant_style = dominant_style
    style_row.questionnaire_responses = response_map
    db.commit()

    assignment = db.query(ABTestAssignment).filter(ABTestAssignment.learner_id == learner.id).first()
    if assignment is None:
        assigned_group = ab_manager.assign_learner(str(learner.id), dominant_style)
        assignment = ABTestAssignment(learner_id=learner.id, group_assignment=assigned_group, stratified_by_style=dominant_style)
        db.add(assignment)
        db.commit()

    return ResponseEnvelope(data={"learner_id": learner.id, "dominant_style": dominant_style, "scores": style_buckets, "group_assignment": assignment.group_assignment})


@router.get("/result", response_model=ResponseEnvelope)
def result(current_user: Learner = Depends(get_current_user), db: Session = Depends(get_db)):
    style_row = db.query(LearningStyle).filter(LearningStyle.learner_id == current_user.id).first()
    if style_row is None:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Learning style not found", "details": []})
    return ResponseEnvelope(
        data={
            "learner_id": current_user.id,
            "activist_score": style_row.activist_score,
            "reflector_score": style_row.reflector_score,
            "theorist_score": style_row.theorist_score,
            "pragmatist_score": style_row.pragmatist_score,
            "dominant_style": style_row.dominant_style,
            "responses": style_row.questionnaire_responses,
            "assessed_at": style_row.assessed_at,
        }
    )
