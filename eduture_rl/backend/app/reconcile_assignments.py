from __future__ import annotations

from .assignment import ensure_ab_assignment
from .database import SessionLocal
from .models import ABTestAssignment, Learner, LearningStyle


def main() -> None:
    db = SessionLocal()
    try:
        learners = db.query(Learner).filter(Learner.is_admin.is_(False)).all()
        created = 0
        skipped = 0
        backfilled_style = 0

        for learner in learners:
            existing = (
                db.query(ABTestAssignment)
                .filter(ABTestAssignment.learner_id == learner.id)
                .first()
            )

            style_row = (
                db.query(LearningStyle)
                .filter(LearningStyle.learner_id == learner.id)
                .first()
            )
            dominant_style = style_row.dominant_style if style_row else None

            if existing is not None:
                if existing.stratified_by_style is None and dominant_style is not None:
                    existing.stratified_by_style = dominant_style
                    db.commit()
                    backfilled_style += 1
                else:
                    skipped += 1
                continue

            ensure_ab_assignment(db, learner.id, dominant_style=dominant_style)
            created += 1

        total = len(learners)
        rule_count = (
            db.query(ABTestAssignment)
            .join(Learner, Learner.id == ABTestAssignment.learner_id)
            .filter(Learner.is_admin.is_(False), ABTestAssignment.group_assignment == "rule_based")
            .count()
        )
        rl_count = (
            db.query(ABTestAssignment)
            .join(Learner, Learner.id == ABTestAssignment.learner_id)
            .filter(Learner.is_admin.is_(False), ABTestAssignment.group_assignment == "rl_based")
            .count()
        )

        print(f"Processed learners: {total}")
        print(f"Assignments created: {created}")
        print(f"Learners already assigned: {skipped}")
        print(f"Current split -> rule_based: {rule_count}, rl_based: {rl_count}")
        print(f"Style strata backfilled: {backfilled_style}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
