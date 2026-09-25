from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

class MaterialResponse(BaseModel):
    id: int
    user_id: UUID | None = None
    title: str
    subject: str
    type: str
    status: str
    storage_path: str | None = None
    original_filename: str | None = None
    source: str | None = None
    source_text: str | None = None
    processed_text: str | None = None
    processed_at: datetime | None = None
    processing_error: str | None = None
    created_at: datetime
    updated_at: datetime


class MaterialResult(BaseModel):
    success: bool
    material: MaterialResponse | None = None
    error: str | None = None

class MaterialsResult(BaseModel):
    success: bool
    materials: list[MaterialResponse]