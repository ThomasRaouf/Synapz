from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from models.material import MaterialResult, MaterialsResult
from services.material_service import (
    create_material_record,
    get_all_materials,
    get_material_by_id,
    validate_file_material,
    validate_text_material,
)


router = APIRouter(
    prefix="/api/materials",
    tags=["materials"],
)


@router.post(
    "",
    response_model=MaterialResult,
    status_code=status.HTTP_201_CREATED,
)
async def create_material(
    title: str | None = Form(default=None),
    material_type: str | None = Form(default=None, alias="type"),
    content: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
):
    """
    Receive a text material or an uploaded file.

    Supported files:
    - PDF
    - DOCX
    - Images

    Maximum file size:
    - 10 MB
    """

    # File upload
    if file is not None:
        if content and content.strip():
            raise HTTPException(
                status_code=400,
                detail="Provide either text content or a file, not both",
            )

        file_data = await file.read()
        file_size = len(file_data)

        is_valid, detected_type, error = validate_file_material(
            filename=file.filename,
            file_size=file_size,
        )

        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail=error,
            )

        material_title = (
            title.strip()
            if title and title.strip()
            else file.filename
        )

        material = create_material_record(
            title=material_title,
            material_type=detected_type,
        )

        return {
            "success": True,
            "material": material,
        }

    # Text material
    is_valid, error = validate_text_material(
        title=title,
        content=content,
        material_type=material_type,
    )

    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail=error,
        )

    material= create_material_record(
        title=title.strip(),
        material_type="TEXT",
    )

    return {
        "success": True,
        "material": material
    }

@router.get(
    "",
    response_model=MaterialsResult,
)
def list_materials():
    """Return stored materials"""

    return {
        "success": True,
        "materials": get_all_materials(),
    }

@router.get(
    "/{material_id}",
    response_model=MaterialResult,
)
def get_material(material_id: int):
    """Return a material by id"""

    material= get_material_by_id(material_id)

    if material is None:
        raise HTTPException(
            status_code=404,
            detail=f"Material with id {material_id} not found",
        )

    return {
        "success": True,
        "material": material,
    }