from pathlib import Path
from services import supabase_service


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


ALLOWED_FILE_TYPES: dict[str, str] = {
    ".pdf": "PDF",
    ".docx": "DOCX",
    ".jpg": "IMAGE",
    ".jpeg": "IMAGE",
    ".png": "IMAGE",
    ".gif": "IMAGE",
    ".webp": "IMAGE",
}

# Validation helpers

def validate_text_material(
    title: str | None,
    content: str | None,
    material_type: str | None,
) -> tuple[bool, str | None]:

    if not title or not title.strip():
        return False, "Title is required"

    if not material_type or material_type.upper() != "TEXT":
        return False, "Text materials must have type='TEXT'"

    if not content or not content.strip():
        return False, "Text content cannot be empty"

    return True, None


def validate_file_material(
    filename: str | None,
    file_size: int,
) -> tuple[bool, str | None, str | None]:

    if not filename:
        return False, None, "Filename is required"

    if file_size > MAX_FILE_SIZE:
        return False, None, "File size exceeds the 10 MB limit"

    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_FILE_TYPES:
        return False, None, "Unsupported file type"

    material_type = ALLOWED_FILE_TYPES[extension]

    return True, material_type, None

# Processing pipeline helpers

def get_material_by_id(material_id: int, user_id: str) -> dict | None:
    return supabase_service.get_material(material_id, user_id=uesr_id)

def get_material_file(material_id: int, user_id: str) -> bytes | None:
    material = supabase_service.get_material(material_id, user_id=user_id)
    if not material:
        return None

    storage_path: str | None = material.get("storage_path")
    if not storage_path:
        return None
    
    return supabase_service.download_file(storage_path)

def save_processed_text(
        material_id: int,
        text: str,
        processed_at: str,
) -> None:
    supabase_service.save_processed_text(
        material_id=material_id,
        processed_text=text,
        processed_at=processed_at,
    )

def get_processed_text(material_id: int) -> str | None:
    client = supabase_service.get_supabase_client()
    response = (
        client.table("materials")
        .select("processed_text")
        .eq("id", material_id)
        .execute()
    )
    if response.data and response.data[0].get("processed_text"):
        return response.data[0]["processed_text"]
    return None