from pathlib import Path


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


ALLOWED_FILE_TYPES = {
    ".pdf": "PDF",
    ".docx": "DOCX",
    ".jpg": "IMAGE",
    ".jpeg": "IMAGE",
    ".png": "IMAGE",
    ".gif": "IMAGE",
    ".webp": "IMAGE",
}


def validate_text_material(
    title: str | None,
    content: str | None,
    material_type: str | None,
) -> tuple[bool, str | None]:

    if not title or not title.strip():
        return False, "Title is required"

    if material_type != "text":
        return False, "Text materials must have type='text'"

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