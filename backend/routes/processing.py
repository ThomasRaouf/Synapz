from fastapi import APIRouter, HTTPException, Depends
from models.processing import ProcessingResult
from services.document_processor import (
    DocumentProcessingError,
    process_document
)
from services.material_service import (
    get_material_by_id,
    get_material_file,
    save_processed_text,
    get_processed_text,
)
from dependencies.auth import get_current_user
from services import supabase_service

router = APIRouter(
    prefix="/api/materials",
    tags=["processing"],
)

@router.post(
    "/{material_id}/process",
    response_model=ProcessingResult,
)

def process_material(material_id: int, current_user = Depends(get_current_user)):

    material = get_material_by_id(material_id, user_id=current_user.id)

    if material is None:
        raise HTTPException(
            status_code=404,
            detail=f"Material with id {material_id} not found",
        )

    material_type = material["type"]

    if material_type == "TEXT":
        raw_content = material.get("content")

        if not raw_content:
            material["status"] = "failed"

            raise HTTPException(
                status_code=422,
                detail="Text material has no stored content"
            )

        material["status"] = "processing"

        try:
            result = process_document(
                source_type="TEXT",
                file_data=raw_content,
            )

            save_processed_text(
                material_id=material_id,
                text=result["text"],
            )

        except DocumentProcessingError as exc:
            material["status"] = "failed"

            raise HTTPException(
                status_code=422,
                detail=str(exc),
            ) from exc

        material["status"] = "processed"

        return result
    file_data = get_material_file(material_id)

    if file_data is None:
        raise HTTPException(
            status_code=404,
            detail="Original material file couldn't be retrived",
        )

    material["status"] = "processing"

    try:
        result = process_document(
            source_type=material_type,
            file_data=file_data,
        )

        save_processed_text(
            material_id=material_id,
            text=result["text"]
        )

    except DocumentProcessingError as exc:
        material["status"] = "failed"

        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        material["status"] = "failed"

        raise HTTPException(
            status_code=500,
            detail="Document processing failed",
        ) from exc

    material["status"] = "processed"

    return result

@router.get(
    "/{material_id}/text",
)
def get_processed_material_text(material_id: int, current_user = Depends(get_current_user)):
    material = supabase_service.get_material(material_id, user_id=current_user.id)

    if material is None:
        raise HTTPException(
            status_code=404,
            detail=f"Material with id {material_id} not found",
        )

    processed_text = get_processed_text(material_id)

    if not processed_text:
        raise HTTPException(
            status_code=409,
            detail="Material has not been processed yet",
        )

    return {
        "success": True,
        "material_id": material_id,
        "title": material["title"],
        "source_type": material["type"],
        "text": processed_text,
        "character_count": len(processed_text),
        "word_count": len(processed_text.split()),
    }