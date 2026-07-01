"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-01-01 00:00:00

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_superuser", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("plan", sa.String(50), nullable=False, server_default="free"),
        sa.Column("words_used_this_period", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("words_quota", sa.Integer(), nullable=False, server_default="1000"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "refresh_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("jti", sa.String(64), nullable=False, unique=True),
        sa.Column("revoked", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("user_agent", sa.String(512), server_default=""),
        sa.Column("ip_address", sa.String(64), server_default=""),
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])
    op.create_index("ix_refresh_tokens_jti", "refresh_tokens", ["jti"], unique=True)

    op.create_table(
        "documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("mode", sa.String(20), nullable=False),
        sa.Column("original_text", sa.Text(), nullable=False),
        sa.Column("result_text", sa.Text(), nullable=True),
        sa.Column("ai_probability", sa.Float(), nullable=True),
        sa.Column("humanization_score", sa.Float(), nullable=True),
        sa.Column("metrics", postgresql.JSONB(), server_default="{}"),
        sa.Column("word_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_documents_owner_id", "documents", ["owner_id"])


def downgrade() -> None:
    op.drop_table("documents")
    op.drop_table("refresh_tokens")
    op.drop_table("users")
