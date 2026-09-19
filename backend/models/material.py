from pydantic import BaseModel

class MaterialResponse(BaseModel):
    title: str
    type: str
    status: str

class MaterialResult(BaseModel):
    success: bool
    material: MaterialResponse | None = None
    error: str | None = None

    