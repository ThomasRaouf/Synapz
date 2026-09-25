from pydantic import BaseModel
from datetime import datetime


class ProcessingResult(BaseModel):
    success: bool
    material_id: int
    title: str
    source_type: str
    text: str
    character_count: int
    word_count: int
    page_count: int | None = None
    processed_at: str


class TextResponse(BaseModel):
    success: bool
    material_id: int
    title: str
    source_type: str
    text: str
    character_count: int
    word_count: int