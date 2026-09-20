from pydantic import BaseModel
from typing import List, Optional

class SummaryRequest(BaseModel):
    """Request model for creating a summary from text."""
    text: str

class Definition(BaseModel):
    """A specific term and its definition."""
    term: str
    definition: str

class SummaryResponse(BaseModel):
    """The structured summary output expected from the AI."""
    title: str
    overview: str
    key_concepts: List[str]
    important_points: List[str]
    definitions: List[Definition]
    quick_review: List[str]