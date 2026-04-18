"""Initial schema

Revision ID: 20260417_0001
Revises:
Create Date: 2026-04-17
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260417_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "learners",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=100), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("is_admin", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("last_login", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_learners_email", "learners", ["email"], unique=True)

    op.create_table(
        "content_fragments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("module_id", sa.String(length=50), nullable=False),
        sa.Column("topic_id", sa.String(length=50), nullable=False),
        sa.Column("content_type", sa.String(length=20), nullable=False),
        sa.Column("sequence_order", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content_data", sa.Text(), nullable=False),
        sa.Column("difficulty", sa.Float(), nullable=False),
        sa.Column("estimated_time_minutes", sa.Integer(), nullable=False),
        sa.Column("prerequisites", sa.JSON(), nullable=False),
        sa.Column("tags", sa.JSON(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_content_fragments_content_type", "content_fragments", ["content_type"], unique=False)
    op.create_index("ix_content_fragments_difficulty", "content_fragments", ["difficulty"], unique=False)
    op.create_index("ix_content_fragments_module_id", "content_fragments", ["module_id"], unique=False)
    op.create_index("ix_content_fragments_topic_id", "content_fragments", ["topic_id"], unique=False)

    op.create_table(
        "learning_styles",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("learner_id", sa.Integer(), nullable=False),
        sa.Column("activist_score", sa.Integer(), nullable=False),
        sa.Column("reflector_score", sa.Integer(), nullable=False),
        sa.Column("theorist_score", sa.Integer(), nullable=False),
        sa.Column("pragmatist_score", sa.Integer(), nullable=False),
        sa.Column("dominant_style", sa.String(length=20), nullable=False),
        sa.Column("questionnaire_responses", sa.JSON(), nullable=False),
        sa.Column("assessed_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["learner_id"], ["learners.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("learner_id"),
    )
    op.create_index("ix_learning_styles_dominant_style", "learning_styles", ["dominant_style"], unique=False)
    op.create_index("ix_learning_styles_learner_id", "learning_styles", ["learner_id"], unique=True)

    op.create_table(
        "ab_test_assignments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("learner_id", sa.Integer(), nullable=False),
        sa.Column("group_assignment", sa.String(length=20), nullable=False),
        sa.Column("assigned_at", sa.DateTime(), nullable=False),
        sa.Column("stratified_by_style", sa.String(length=20), nullable=True),
        sa.ForeignKeyConstraint(["learner_id"], ["learners.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("learner_id"),
    )
    op.create_index("ix_ab_test_assignments_group_assignment", "ab_test_assignments", ["group_assignment"], unique=False)
    op.create_index("ix_ab_test_assignments_learner_id", "ab_test_assignments", ["learner_id"], unique=True)
    op.create_index("ix_ab_test_assignments_stratified_by_style", "ab_test_assignments", ["stratified_by_style"], unique=False)

    op.create_table(
        "assessments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("learner_id", sa.Integer(), nullable=False),
        sa.Column("content_id", sa.Integer(), nullable=True),
        sa.Column("assessment_type", sa.String(length=20), nullable=False),
        sa.Column("module_id", sa.String(length=50), nullable=True),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("max_score", sa.Float(), nullable=False),
        sa.Column("correct_answers", sa.Integer(), nullable=True),
        sa.Column("total_questions", sa.Integer(), nullable=True),
        sa.Column("completion_time_minutes", sa.Integer(), nullable=True),
        sa.Column("passed", sa.Boolean(), nullable=True),
        sa.Column("responses", sa.JSON(), nullable=False),
        sa.Column("satisfaction_rating", sa.Integer(), nullable=True),
        sa.Column("taken_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["content_id"], ["content_fragments.id"]),
        sa.ForeignKeyConstraint(["learner_id"], ["learners.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_assessments_assessment_type", "assessments", ["assessment_type"], unique=False)
    op.create_index("ix_assessments_learner_id", "assessments", ["learner_id"], unique=False)
    op.create_index("ix_assessments_module_id", "assessments", ["module_id"], unique=False)

    op.create_table(
        "interactions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("learner_id", sa.Integer(), nullable=False),
        sa.Column("content_id", sa.Integer(), nullable=False),
        sa.Column("group_assigned", sa.String(length=20), nullable=False),
        sa.Column("context_time_on_task", sa.Float(), nullable=False),
        sa.Column("context_error_rate", sa.Float(), nullable=False),
        sa.Column("context_revisit_count", sa.Float(), nullable=False),
        sa.Column("context_completion_rate", sa.Float(), nullable=False),
        sa.Column("context_engagement_score", sa.Float(), nullable=False),
        sa.Column("context_learning_style", sa.String(length=20), nullable=False),
        sa.Column("context_topic_difficulty", sa.Float(), nullable=False),
        sa.Column("recommended_content_type", sa.String(length=20), nullable=False),
        sa.Column("completed", sa.Boolean(), nullable=False),
        sa.Column("quiz_score", sa.Float(), nullable=True),
        sa.Column("actual_time_minutes", sa.Integer(), nullable=True),
        sa.Column("is_revisit", sa.Boolean(), nullable=False),
        sa.Column("reward", sa.Float(), nullable=False),
        sa.Column("scroll_depth", sa.Float(), nullable=True),
        sa.Column("click_count", sa.Integer(), nullable=True),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.Column("ip_address", sa.String(length=50), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["content_id"], ["content_fragments.id"]),
        sa.ForeignKeyConstraint(["learner_id"], ["learners.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_interactions_content_id", "interactions", ["content_id"], unique=False)
    op.create_index("ix_interactions_group_assigned", "interactions", ["group_assigned"], unique=False)
    op.create_index("ix_interactions_learner_id", "interactions", ["learner_id"], unique=False)

    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("learner_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("revoked_at", sa.DateTime(), nullable=True),
        sa.Column("ip_address", sa.String(length=50), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["learner_id"], ["learners.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash", name="uq_refresh_token_hash"),
    )
    op.create_index("ix_refresh_tokens_learner_id", "refresh_tokens", ["learner_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_refresh_tokens_learner_id", table_name="refresh_tokens")
    op.drop_table("refresh_tokens")

    op.drop_index("ix_interactions_learner_id", table_name="interactions")
    op.drop_index("ix_interactions_group_assigned", table_name="interactions")
    op.drop_index("ix_interactions_content_id", table_name="interactions")
    op.drop_table("interactions")

    op.drop_index("ix_assessments_module_id", table_name="assessments")
    op.drop_index("ix_assessments_learner_id", table_name="assessments")
    op.drop_index("ix_assessments_assessment_type", table_name="assessments")
    op.drop_table("assessments")

    op.drop_index("ix_ab_test_assignments_stratified_by_style", table_name="ab_test_assignments")
    op.drop_index("ix_ab_test_assignments_learner_id", table_name="ab_test_assignments")
    op.drop_index("ix_ab_test_assignments_group_assignment", table_name="ab_test_assignments")
    op.drop_table("ab_test_assignments")

    op.drop_index("ix_learning_styles_learner_id", table_name="learning_styles")
    op.drop_index("ix_learning_styles_dominant_style", table_name="learning_styles")
    op.drop_table("learning_styles")

    op.drop_index("ix_content_fragments_topic_id", table_name="content_fragments")
    op.drop_index("ix_content_fragments_module_id", table_name="content_fragments")
    op.drop_index("ix_content_fragments_difficulty", table_name="content_fragments")
    op.drop_index("ix_content_fragments_content_type", table_name="content_fragments")
    op.drop_table("content_fragments")

    op.drop_index("ix_learners_email", table_name="learners")
    op.drop_table("learners")
