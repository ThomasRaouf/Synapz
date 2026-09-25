from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status, Depends
import mimetypes

from models.material import MaterialResult, MaterialsResult
from services.material_service import get_material_file, validate_file_material, validate_text_material
from services import supabase_service
from dependencies.auth import get_current_user


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
    current_user=Depends(get_current_user),
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


        content_type, _ = mimetypes.guess_type(file.filename or "")
        if not content_type:
            content_type = "application/octet-stream"


        try:
            storage_path = supabase_service.upload_file(
                filename=file.filename,
                file_data=file_data,
                user_id=current_user.id,
                content_type=content_type,
            )
        except Exception as e:

            print(f"[materials] Storage upload error: {e}")
            raise HTTPException(
                status_code=500,
                detail="We couldn't save your file. Please try again.",
            )


        material_data = {
            "title": material_title,
            "subject": "General",
            "type": detected_type,
            "status": "New",
            "storage_path": storage_path,
            "original_filename": file.filename,
            "source": "file",
        }

        try:
            material = supabase_service.insert_material(material_data, user_id=current_user.id)
        except Exception as e:
            print(f"[materials]Database insert error: {e}")

            supabase_service.delete_file(storage_path)
            raise HTTPException(
                status_code=500,
                detail="We couldn't save your material. Please try again.",
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

    material_data = {
        "title": title.strip(),
        "subject": "General",
        "type": "TEXT",
        "status": "New",
        "source_text": content.strip(),
        "storage_path": None,
        "original_filename": None,
        "source": "notes",
    }

    try:
        material = supabase_service.insert_material(material_data, user_id=current_user.id)
    except Exception as e:
        print(f"[materials]Database insert error: {e}")
        raise HTTPException(
            status_code=500,
            detail="We couldn't save your material. Please try again.",
        )

    return {
        "success": True,
        "material": material
    }

@router.get(
    "",
    response_model=MaterialsResult,
)
def list_materials(current_user=Depends(get_current_user)):
    """Return stored materials"""

    try:
        materials = supabase_service.get_materials(user_id=current_user.id)
    except Exception as e:
        print(f"[materials] Failed to fetch materials: {e}")
        raise HTTPException(
            status_code=500,
            detail="The server is unavailable right now. Please try again.",
        )
    
    return {
        "success": True,
        "materials": materials,
    }

@router.get(
    "/{material_id}",
    response_model=MaterialResult,
)
def get_material(material_id: int, current_user=Depends(get_current_user)):
    """Return a material by id"""

    try:
        material = supabase_service.get_material(material_id, user_id=current_user.id)
    except Exception as e:
        print(f"[materials] Failed to fetch materials: {e}")
        raise HTTPException(
            status_code=500,
            detail="The server is unavailable right now. Please try again.",
        )
    
    if material is None:
        raise HTTPException(
            status_code=404,
            detail=f"Material with id {material_id} not found",
        )

    return {
        "success": True,
        "material": material,
    }