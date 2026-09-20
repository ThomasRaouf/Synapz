from pydantic import BaseModel

class MaterialResponse(BaseModel):
    id: int
    title: str
    type: str
    status: str

class MaterialResult(BaseModel):
    success: bool
    material: MaterialResponse | None = None
    error: str | None = None

class MaterialsResult(BaseModel):
    success: bool
    materials: list[MaterialResponse]

    