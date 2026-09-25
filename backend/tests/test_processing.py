import io
import pytest
from unittest.mock import MagicMock, patch

# Helpers used by multiple tests

def _make_minimal_pdf() -> bytes:
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), "Hello World")
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes

def _make_minimal_docx() -> bytes:
    from docx import Document
    doc = Document()
    doc.add_paragraph("Test Paragraph one")
    doc.add_paragraph("Test Paragraph two")
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
            self.extract_docx_text(b"")

    def test_raises_on_corrupt_bytes(self):
        with pytest.raises(self.DOCXExtractionError):
            self.extract_docx_text(b"not a docx")

    def test_valid_docx_returns_text(self):
        docx_bytes = _make_minimal_docx()
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

        # PDF

        def test_pdf_material(self):
            pdf_bytes = _make_minimal_pdf()
            result = self.process_document(source_type="PDF", file_data=pdf_bytes)
            assert result["success"] is True
            assert isinstance(result["text"], str)
            assert result["page_count"] >= 1

        def test_pdf_requires_bytes(self):
            with pytest.raises(self.DocumentProcessingError):
                self.process_document(source_type="PDF", file_data="string not allowed")

        def test_pdf_corrupt_raises(self):
            with pytest.raises(self.DocumentProcessingError):
                self.process_document(source_type="PDF", file_data=b"garbage")

        # DOCX

        def test_docx_material(self):
                    docx_bytes = _make_minimal_docx()
                    result = self.process_document(source_type="DOCX", file_data=docx_bytes)
                    assert result["success"] is True
                    assert "Test Paragraph" in result["text"]
        
        def test_docx_requires_bytes(self):
            with pytest.raises(self.DocumentProcessingError):
                self.process_document(source_type="DOCX", file_data="string not allowed")

        # Unsupported types

        def test_image_raises(self):
            with pytest.raises(self.DocumentProcessingError, match="Unsupported"):
                self.process_document(source_type="IMAGE", file_data=b"\xff\xd8\xff")

        def test_unknown_type_raises(self):
            with pytest.raises(self.DocumentProcessingError, match="Unsupported"):
                self.process_document(source_type="SPREADSHEET", file_data=b"data")

class TestMaterialService:

    def _mock_client(self):
        client = MagicMock()
        return client

    def test_get_material_by_id_returns_none_when_not_found(self):
        with patch("services.supabase_service.get_supabase_client") as mock_get:
            client = self._mock_client()
            client.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = []
            mock_get.return_value = client

            from services.material_service import get_material_by_id
            result = get_material_by_id(9999, user_id="user-abc")
            assert result is None

    def test_get_material_by_id_returns_row_when_found(self):
        row = {"id": 1, "title": "Bio Notes", "type": "TEXT", "status": "New"}
        with patch("services.supabase_service.get_supabase_client") as mock_get:
            client = self._mock_client()
            client.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = [row]
            mock_get.return_value = client
            
            from services.material_service import get_material_by_id
            result = get_material_by_id(1, user_id="user-abc")
            assert result == row

    def test_get_processed_returns_none_when_empty(self):
        with patch("services.supabase_service.get_supabase_client") as mock_get:
            client = self._mock_client()
            client.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
                {"processed_text": None}
            ]
            mock_get.return_value = client
           
            from services.material_service import get_processed_text
            result = get_processed_text(1)
            assert result is None

    def test_get_processed_returns_text_when_present(self):
        with patch("services.supabase_service.get_supabase_client") as mock_get:
            client = self._mock_client()
            client.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
                {"processed_text": "Extracted content heeeere..."}
            ]
            mock_get.return_value = client

            from services.material_service import get_processed_text
            result = get_processed_text(1)
            assert result == "Extracted content heeeere..."


class TestValidationHelpers:
    def setup_method(self):
        from services.material_service import validate_file_material, validate_text_material
        self.validate_file = validate_file_material
        self.validate_text = validate_text_material


    def test_text_valid(self):
        ok, err = self.validate_text("My Notes", "some contet", "TEXT")
        assert ok is True
        assert err is None

    def test_text_missing_title(self):
        ok, err = self.validate_text("", "contennnt", "TEXT")
        assert ok is False

    def test_text_missing_content(self):
        ok, err = self.validate_text("Tilte", "   ", "TEXT")
        assert ok is False

    def test_text_wrong_type(self):
        ok, err = self.validate_text("Tilte", "content", "PDF")
        assert ok is False


    def test_file_valid_pdf(self):
        ok, detected, err = self.validate_file("lecture.pdf", 1024)
        assert ok is True
        assert detected == "PDF"
        assert err is None

    def test_file_valid_docx(self):
        ok, detected, err = self.validate_file("lecture.docx", 2048)
        assert ok is True
        assert detected == "DOCX"

    def test_file_too_large(self):
        ok, detected, err = self.validate_file("big.pdf", 11 * 1024 * 1024)
        assert ok is False
        assert "10 MB" in err

    def test_file_unsupported_type(self):
        ok, detected, err = self.validate_file("lecture.xlsx", 1024)
        assert ok is False

    def test_file_no_filename(self):
        ok, detected, err = self.validate_file(None, 1024)
        assert ok is False