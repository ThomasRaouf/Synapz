import fitz

class PDFExtractionError(Exception):
    """Raised when PDF extraction fails"""

def extract_pdf_text(file_data: bytes) -> tuple[str, int]:
    """
    Extract text from a PDF.
    """

    if not file_data:
        raise PDFExtractionError("PDF file is empty")

    try:
        document = fitz.open(stream=file_data, filetype="pdf")
    except Exception as exc:
        raise PDFExtractionError(
            "unable to open PDF file"
        ) from exc

    try:
        page_count = len(document)

        if page_count == 0:
            raise PDFExtractionError("PDF contains no pages")

        pages = []

        for page in document:
            text = page.get_text("text")

            if text and text.strip():
                pages.append(text)

        extracted_text = "\n\n".join(pages)

        if not extracted_text.strip():
            raise PDFExtractionError(
                "PDF contains no extractable"
            )

        return extracted_text, page_count

    except PDFExtractionError:
        raise

    except Exception as exc:
        raise PDFExtractionError(
            "Failed to extract text from PDF"
        ) from exc

    finally:
        document.close()



