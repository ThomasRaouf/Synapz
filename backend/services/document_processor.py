import re
from services.docx_parser import (
    DOCXExtractionError,
    extract_docx_text
)
from services.pdf_parser import(
    PDFExtractionError,
    extract_pdf_text
)

class DocumentProcessingError(Exception):
    """Raised when document processing fails"""

def normalize_text(text: str) -> str:
    """Normalize extracted text while preserving meaningful formatting."""

    if not text or not text.strip():
        raise DocumentProcessingError(
            "Document contains no usable text"
        )

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")
    text = text.replace("\x00", "")

    text = re.sub(r"[ \t]+", " ", text)

    lines = [
        line.rstrip()
        for line in text.split("\n")
    ]

    text = "\n".join(lines)

    text = re.sub(r"\n{3,}", "\n\n", text)

    text = text.strip()

    if not text:
        raise DocumentProcessingError(
            "Document contains no usable text"
        )

    return text

def process_document(
        source_type: str,
        file_data: bytes | str,
) -> dict:
    """Process a supported document and return text"""

    normalized_source_type = source_type.upper()

    try:
        if normalized_source_type == "TEXT":
            if not isinstance(file_data, str):
                raise DocumentProcessingError(
                    "Text content must be string"
                )

            raw_text = file_data
            page_count = None

        elif normalized_source_type == "PDF":
            if not isinstance(file_data, bytes):
                raise DocumentProcessingError(
                    "PDF content must be bytes"
                )

            raw_text, page_count = extract_pdf_text(file_data)

        elif normalized_source_type == "DOCX":
            if not isinstance(file_data, bytes):
                raise DocumentProcessingError(
                    "DOCX content must be bytes"
                )

            raw_text, page_count = extract_docx_text(file_data)

        else:
            raise DocumentProcessingError(
                f"Unsupported source type: {source_type}"
            )

        text = normalize_text(raw_text)

        words = text.split()
        return {
            "success": True,
            "text": text,
            "character_count": len(text),
            "word_count": len(words),
            "page_count": page_count,
            "source_type": normalized_source_type,
        }

    except(
        DocumentProcessingError,
        PDFExtractionError,
        DOCXExtractionError,
    ):
        raise

    except Exception as exc:
        raise DocumentProcessingError("Document processing failed") from exc