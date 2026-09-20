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

materials: list[dict] = []
material_files: dict[int, bytes] = {}

_next_material_id = 1

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

def create_material_record(
        title: str,
        material_type: str,
        file_data: bytes | None = None,
        content: str | None = None,
) -> dict:
    """Create and store a new material"""

    global _next_material_id

    material = {
        "id": _next_material_id,
        "title": title,
        "type": material_type,
        "status": "received",
    }

    materials.append(material)

    if file_data is not None:
        material_files[_next_material_id] = file_data

    if content is not None:
        material["content"] = content

    _next_material_id +=1

    return material

def get_all_materials() -> list[dict]:
    """Return all stored materials"""

    return materials

def get_material_by_id(material_id: int) -> dict | None:
    """Find a material by ID"""

    for material in materials:
        if material["id"] == material_id:
            return material

    return None

def get_material_file(material_id: int) -> bytes | None:
    """Return the original uploaded file"""

    return material_files.get(material_id)

def save_processed_text(
        material_id: int,
        text: str,
) -> dict | None:
    """Store processed text for material"""

    material = get_material_by_id(material_id)

    if material is None:
        return None

    material["processed_text"] = text

    return material

def get_processed_text(material_id: int) -> str | None:
    material = get_material_by_id(material_id)

    if material is None:
        return None

    return material.get("processed_text")