from pydantic import BaseModel, Field, field_validator

from app.core.config import settings


class TextInput(BaseModel):
    text: str = Field(min_length=1, max_length=settings.MAX_INPUT_CHARS)

    @field_validator("text")
    @classmethod
    def strip_text(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Text cannot be empty")
        return v


class HumanizeRequest(TextInput):
    tone: str = Field(default="balanced", pattern="^(balanced|formal|casual|academic|creative)$")
    strength: str = Field(default="medium", pattern="^(light|medium|aggressive)$")


class MetricBreakdown(BaseModel):
    name: str
    label: str
    score: float
    description: str


class DetectionResponse(BaseModel):
    ai_probability: float
    verdict: str
    confidence: str
    metrics: list[MetricBreakdown]
    word_count: int
    sentence_count: int


class HumanizeResponse(BaseModel):
    original_text: str
    humanized_text: str
    humanization_score: float
    detection_before: DetectionResponse
    detection_after: DetectionResponse
    changes_made: list[str]
