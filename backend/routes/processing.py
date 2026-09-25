from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException

from models.processing import ProcessingResult, TextResponse
from services.document_processor import DocumentProcessingError, process_document
from services.material_service import (
    get_material_by_id,
    get_material_file,
    get_processed_text,
    save_processed_text, 
)
from services import supabase_service
from dependencies.auth import get_current_user


router = APIRouter(
    prefix="/api/materials",
    tags=["processing"],
)

# Helpers

def _now_iso() -> str:
    return datetime.now(tz=timezone.utc).isoformat()


def _set_status(material_id: int, status: str) -> None:
    try:
        supabase_service.set_material_status(material_id, status)
    except Exception as e:
        print(f"[processing] Warning: could not set status={status} for material {material_id}: {e}")


def _save_error(material_id: int, reason: str) -> None:
    try:
        supabase_service.save_processing_error(material_id, reason)
    except Exception as e:
        print(f"[processing] Warning: could not save error for material {material_id}: {e}")





@router.post(
    "/{material_id}/process",
    response_model=ProcessingResult,
)


def process_material(
    material_id: int,
    current_user=Depends(get_current_user),
):
    material = get_material_by_id(material_id, user_id=current_user.id)
    if material is None:
        raise HTTPException(
            status_code=404,
            detail=f"Material with id {material_id} not found",
        )

    material_type: str = (material.get("type") or "").upper()
    title: str = material.get("title", "")

    if material_type == "IMAGE":
        _set_status(material_id, "Failed")
        _save_error(material_id, "OCR / image processing is not yet implemented")
        raise HTTPException(
            status_code=422,
            detail=(
                "Image processing OCR is not uet implemented."
                "Please Upload a PDF, DOCX, or paste text instead"
            ),
        )

    if material_type not in ("TEXT", "PDF", "DOCX"):
        _set_status(material_id, "Failed")
        _save_error(material_id, f"Unsupported material type: {material_type}")
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported material type: {material_type}"
        )

    
    if material_type == "TEXT":
        raw_content: str | bytes | None = material.get("source_text") or material.get("content")
        if not raw_content or (isinstance(raw_content, str) and not raw_content.strip()):
            _set_status(material_id, "Failed")
            _save_error(material_id, "Text materila has no stored content")
            raise HTTPException(
                status_code=422,
                detail="Text material has no stored content",
            )
        file_data = raw_content
    else:
        try:
            file_data = get_material_file(material_id, user_id=current_user.id)
        except Exception as exc:
            err = f"Could not download material file: {exc}"
            _set_status(material_id, "Failed")
            _save_error(material_id, err)
            raise HTTPException(status_code=500, detail=err) from exc

        if file_data is None:
            err = "Original material file could not be retrived from storage"
            _set_status(material_id, "Failed")
            _save_error(material_id, err)
            raise HTTPException(status_code=404, detail=err)


    _set_status(material_id, "Processing")


    try:
        result = process_document(
            source_type=material_type,
            file_data=file_data,
        )
    except DocumentProcessingError as exc:
        err = str(exc)
        _save_error(material_id, err)
        raise HTTPException(status_code=422, detail=err) from exc
    
    except Exception as exc:
        err = f"Unexpected processing error: {exc}"
        _save_error(material_id, err)
        raise HTTPException(
            status_code=500,
            detail="Document processing failed due to an internal error",
        ) from exc

    processed_at = _now_iso()
    try:
        save_processed_text(
            material_id=material_id,
            text=result["text"],
            processed_at=processed_at
        )
    except Exception as exc:
        err = f"could not persist processed text: {exc}"
        _save_error(material_id, err)
        raise HTTPException(status_code=500, detail=err) from exc

    return ProcessingResult(
        success=True,
        material_id=material_id,
        title=title,
        source_type=result["source_type"],
        text=result["text"],
        character_count=result["character_count"],
        word_count=result["word_count"],
        page_count=result.get("page_count")
        processed_at=processed_at,
    )

@router.get(
    "/{material_id}/text",
    response_model=TextResponse,
)
def get_processed_material_text(
    material_id: int,
    current_user = Depends(get_current_user),
    ):
    material = supabase_service.get_material(material_id, user_id=current_user.id)

    if material is None:
        raise HTTPException(
            status_code=404,
            detail=f"Material with id {material_id} not found",
        )

    processed_text = get_processed_text(material_id)

    if not processed_text:
        status = material.get("status", "New")
        if status == "Processing":
            detail = "Material is currently being processed, try again shortly"
        elif status == "Failed":
            error = material.get("processing_error", "Unknown error")
            detail = f"Material processing failed: {error}"
        else:
            detail = (
                "Material has not been processed yet. "
                "Call POST / api/materials/{id}/process first"
            )
        raise HTTPException(status_code=409, detail=detail)
    return TextResponse(
        success=True,
        material_id=material_id,
        title=material.get("title", ""),
        source_type=material.get("type", ""),
        text=processed_text,
        character_count=len(processed_text),
        word_count=len(processed_text.split()),
    )
