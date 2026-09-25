import io
import pytest
from unittest.mock import MagicMock, patch

# Helpers used by multiple tests

def _make_minimal_pdf() -> bytes:
    return (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type  /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type  /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"1 0 obj\n<< /Type  /Pages /Parent 2 0 R /Mediabox [0 0 612 792]\n>>\nendobj\n"
        b"   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
        b"4 0 obj\n<< /Length 44 >>\nstream\n"
        b"BT /F1 12 Tf 100 700 Td (Hello World) Tj ET\n"
        b"endstream\nendobj\n"
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
        b"xref\n0 6\n"
        b"0000000000 65535 f \n"
        b"0000000009 00000 n \n"
        b"0000000058 00000 n \n"
        b"0000000115 00000 n \n"
        b"0000000274 00000 n \n"
        b"0000000370 00000 n \n"
        b"trailer\n<< /Size 6 /Root 1 0 R >>\n"
        b"startxref\n450\n%%EOF\n"
    )

def _make_minimal_docx() -> bytes:
    from docx import Document
    doc = Document()
    doc.add_paragraph("Test paragraph one")
    doc.add_paragraph("Test patagraph two")
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()

# normalize text
 
class TestNormalizeText:
    def setup_method(self):
        from services.document_processor import normalize_text, DocumentProcessingError
        self.normalize_text = normalize_text
        self.DocumentProcessingError = DocumentProcessingError

    def test_strip_null_characters(self):
        result = self.normalize_text("hello\x00world")
        assert "\x00" not in result

    def test_collapses_excessive_blank_lines(self):
        result = self.normalize_text("a\n\n\n\n\nb")
        assert "\n\n\n" not in result


    def test_normalises_crlf(self):
        result = self.normalize_text("line1\r\nline2\r\nline3")
        assert "\r" not in result
        assert "line1" in result and "line2" in result

    def test_collapses_repeated_spaces(self):
        result = self.normalize_text("too    many           spaces")
        assert "  " not in result

    def test_raises_on_empty_string(self):
        with pytest.raises(self.DocumentProcessingError):
            self.normalize_text("")

    def test_raises_on_whitespaces_only(self):
        with pytest.raises(self.DocumentProcessingError):
            self.normalize_text("   \n\n\t   ")

    def test_preserves_meaningful_content(self):
        result = self.normalize_text("  Introduction\n\nBody text here.\n\nConclusion  ")
        assert "Introduction" in result
        assert "Body text here." in result
        assert "Conclusion" in result

# PDF parser

class TestPDFParser:
    def setup_method(self):
        from services.pdf_parser import extract_pdf_text, PDFExtractionError
        self.extract_pdf_text = extract_pdf_text
        self.PDFExtractionError = PDFExtractionError

    def test_raises_on_empty_bytes(self):
        with pytest.raises(self.PDFExtractionError):
            self.extract_pdf_text(b"not a PDF at all \x00\xff")

    def test_valid_pdf_returns_text_and_page_count(self):
        pdf_bytes = _make_minimal_pdf()
        text, page_count = self.extract_pdf_text(pdf_bytes)
        assert isinstance(text, str)
        assert page_count >= 1
        assert "Hello" in text or len(text) > 0


# DOCX parser

class TestDOCXParser:
    def setup_method(self):
        from services.docx_parser import extract_docx_text, DOCXExtractionError
        self.extract_docx_text = extract_docx_text
        self.DOCXExtractionError = DOCXExtractionError

    def test_raises_on_empty_bytes(self):
        with pytest.raises(self.DOCXExtractionError, match="empty"):
            self.extract_pdf_text(b"")

    def test_raises_on_corrupt_bytes(self):
        with pytest.raises(self.DOCXExtractionError):
            self.extract_pdf_text(b"not a docx")

    def test_valid_docx_returns_text(self):
        docx_bytes = _make_minimal_docx
        text, page_count = self.extract_docx_text(docx_bytes)
        assert isinstance(text, str)
        assert "Test Paragraph one" in text
        assert "Test Paragraph two" in text
        assert page_count is None

# Process document

class TestProcessDocument:
    def setup_method(self):
        from services.document_processor import process_document, DocumentProcessingError
        self.process_document = process_document
        self.DocumentProcessingError = DocumentProcessingError

        # TEXT

        def test_text_material(self):
            result = self.process_document(
                source_type="TEXT",
                file_data="This is a test note about biology. \n\nCell division is important.",
            )
            assert result["success"] is True
            assert "biology" in result ["text"]
            assert result["word_count"] > 0
            assert result["character_count"] > 0
            assert result["source_type"] == "TEXT"
            assert result["page_count"] is None

        def test_text_material_case_insensitive_type(self):
            result = self.process_document(source_type="text", file_data="Some content bla bla here.")
            assert result["success"] is True

        def test_text_requires_string(self):
            with pytest.raises(self.DocumentProcessingError):
                self.process_document(source_type="TEXT", file_data=b"bytes not allowed")

        def test_text_empty_raises(self):
            with pytest.raises(self.DocumentProcessingError):
                self.process_document(source_type="TEXT", file_data="   ")
