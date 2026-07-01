from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.document import Document
from app.models.user import User
from app.schemas.humanize import DetectionResponse, HumanizeRequest, HumanizeResponse, TextInput
from app.services.detector import detection_engine
from app.services.humanizer import humanizer_engine
from app.services.nlp_utils import tokenize_words

router = APIRouter(tags=["ai-engine"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/detect", response_model=DetectionResponse)
@limiter.limit(settings.RATE_LIMIT_HUMANIZE)
async def detect_text(
    request: Request,
    payload: TextInput,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    result = detection_engine.analyze(payload.text)

    doc = Document(
        owner_id=current_user.id,
        mode="detect",
        original_text=payload.text[:20000],
        ai_probability=result["ai_probability"],
        metrics=result,
        word_count=result["word_count"],
    )
    db.add(doc)
    await db.commit()

    return DetectionResponse(**result)


@router.post("/humanize", response_model=HumanizeResponse)
@limiter.limit(settings.RATE_LIMIT_HUMANIZE)
async def humanize_text(
    request: Request,
    payload: HumanizeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    word_count = len(tokenize_words(payload.text))

    if current_user.words_used_this_period + word_count > current_user.words_quota:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Word quota exceeded for this billing period. Please upgrade your plan.",
        )

    result = humanizer_engine.humanize(payload.text, tone=payload.tone, strength=payload.strength)

    current_user.words_used_this_period += word_count
    db.add(current_user)

    doc = Document(
        owner_id=current_user.id,
        mode="humanize",
        original_text=payload.text[:20000],
        result_text=result["humanized_text"][:20000],
        humanization_score=result["humanization_score"],
        ai_probability=result["detection_after"]["ai_probability"],
        metrics={
            "before": result["detection_before"],
            "after": result["detection_after"],
        },
        word_count=word_count,
    )
    db.add(doc)
    await db.commit()

    return HumanizeResponse(
        original_text=result["original_text"],
        humanized_text=result["humanized_text"],
        humanization_score=result["humanization_score"],
        detection_before=DetectionResponse(**result["detection_before"]),
        detection_after=DetectionResponse(**result["detection_after"]),
        changes_made=result["changes_made"],
    )
