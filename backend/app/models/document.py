import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    mode: Mapped[str] = mapped_column(String(20))  # "humanize" | "detect"
    original_text: Mapped[str] = mapped_column(Text, nullable=False)
    result_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    ai_probability: Mapped[float | None] = mapped_column(Float, nullable=True)
    humanization_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    metrics: Mapped[dict] = mapped_column(JSONB, default=dict)

    word_count: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="documents")
