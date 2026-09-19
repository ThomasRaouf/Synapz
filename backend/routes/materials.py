from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from services.material_service import (
    validate_file_material,
    validate_text_material,
)


router = APIRouter(
    prefix="/api/materials",
    tags=["materials"],
)


@router.post(
    "",
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

        return {
            "success": True,
            "material": {
                "title": material_title,
                "type": detected_type,
                "status": "received",
            },
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

    return {
        "success": True,
        "material": {
            "title": title.strip(),
            "type": "TEXT",
            "status": "received",
        },
    }