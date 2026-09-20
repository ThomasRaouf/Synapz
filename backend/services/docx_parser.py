from io import BytesIO
from docx import Document

class DOCXExtractionError(Exception):
    """Raised when DOCX text extraction fails"""

def extract_docx_text(file_data: bytes) -> tuple[str, int | None]:
    """
    Extract paragraph text from a DOCX document
    """

    if not file_data:
        raise DOCXExtractionError("DOCX file is empty")

    try:
        document = Document(BytesIO(file_data))
    except Exception as exc:
        raise DOCXExtractionError(
            "Unable to open DOCX file"
        ) from exc

    paragraphs = []

    for paragraph in document.paragraphs:
        text = paragraph.text.strip()

        if text:
            paragraphs.append(text)

    extracted_text = "\n\n".join(paragraphs)

    if not extracted_text.strip():
        raise DOCXExtractionError(
            "DOCX contains no extractable text"
        )

    return extracted_text, None