from fastapi import HTTPException
from pydantic import ValidationError
from models.summary import SummaryResponse
from services.ai_service import generate_summary
def create_summary(text: str) -> dict:
    """
    Orchestrates the generation of a summary from text.
    Validates input and ensures the AI output matches the expected structure.
    """
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Text for summary can't be empty.")

    if len(text) > 100000:
        raise HTTPException(status_code=400, detail=f"Text is too large, please Profide a shorter text.")

    try:
        raw_summary_dict = generate_summary(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary from AI provider: {str(e)}")

    try:
        validated_summary = SummaryResponse(**raw_summary_dict)
        return validated_summary.model_dump()
    except ValidationError as e:
        raise HTTPException(
            status_code=500,
            detail="AI generated malformed content that failed validation."
        )