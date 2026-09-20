from pydantic import BaseModel

class ProcessingResult(BaseModel):
    success: bool
    text: str
    character_count: int
    word_count: int
    page_count: int | None = None
    source_type: str