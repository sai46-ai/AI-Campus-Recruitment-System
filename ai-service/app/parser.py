"""
AI Resume Analysis Service - Document Parser
Python 3.14 Compatible - Pure Python PDF parsing (NO C extensions)

PDF Engines (in order of preference):
1. pdfplumber - Best text extraction, pure Python
2. pypdf - Fallback, pure Python

CRITICAL: Do NOT use PyMuPDF (fitz) - requires C compilation
"""

import io
import re
import sys
import logging
from pathlib import Path
from typing import Optional, Tuple

# Configure logging for visibility
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Track which PDF engine is available
PDF_ENGINE = "none"
PDF_ENGINE_ERROR = None


def _detect_pdf_engine() -> str:
    """
    Detect which PDF engine is available.
    Returns: engine name or "none"
    """
    global PDF_ENGINE, PDF_ENGINE_ERROR
    
    # Try pdfplumber first (best extraction quality)
    try:
        import pdfplumber
        PDF_ENGINE = "pdfplumber"
        logger.info(f"[PDF] Using pdfplumber v{pdfplumber.__version__}")
        return PDF_ENGINE
    except ImportError as e:
        logger.warning(f"[PDF] pdfplumber not available: {e}")
    
    # Try pypdf as fallback
    try:
        import pypdf
        PDF_ENGINE = "pypdf"
        logger.info(f"[PDF] Using pypdf v{pypdf.__version__}")
        return PDF_ENGINE
    except ImportError as e:
        logger.warning(f"[PDF] pypdf not available: {e}")
    
    # No PDF engine available
    PDF_ENGINE = "none"
    PDF_ENGINE_ERROR = "No PDF parsing library available. Install: pip install pdfplumber pypdf"
    logger.error(f"[PDF] {PDF_ENGINE_ERROR}")
    return PDF_ENGINE


# Detect engine on module load
_detect_pdf_engine()


def get_pdf_engine_info() -> dict:
    """Return information about the PDF engine being used."""
    return {
        "engine": PDF_ENGINE,
        "available": PDF_ENGINE != "none",
        "error": PDF_ENGINE_ERROR
    }


def extract_text_from_pdf_pdfplumber(file_bytes: bytes) -> Tuple[str, Optional[str]]:
    """
    Extract text using pdfplumber (preferred engine).
    Pure Python, excellent text extraction.
    """
    try:
        import pdfplumber
        
        text_parts = []
        
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            if len(pdf.pages) == 0:
                return "", "PDF has no pages"
            
            for page_num, page in enumerate(pdf.pages):
                try:
                    text = page.extract_text()
                    if text and text.strip():
                        text_parts.append(text)
                except Exception as e:
                    logger.warning(f"[PDF] Failed to extract page {page_num}: {e}")
                    continue
        
        full_text = "\n\n".join(text_parts).strip()
        
        if not full_text:
            return "", "Could not extract text from PDF (may be scanned/image-based)"
        
        logger.info(f"[PDF] Extracted {len(full_text)} chars using pdfplumber")
        return full_text, None
        
    except Exception as e:
        logger.error(f"[PDF] pdfplumber error: {e}")
        return "", f"PDF parsing error (pdfplumber): {str(e)}"


def extract_text_from_pdf_pypdf(file_bytes: bytes) -> Tuple[str, Optional[str]]:
    """
    Extract text using pypdf (fallback engine).
    Pure Python, reliable but simpler extraction.
    """
    try:
        from pypdf import PdfReader
        
        reader = PdfReader(io.BytesIO(file_bytes))
        
        if len(reader.pages) == 0:
            return "", "PDF has no pages"
        
        text_parts = []
        
        for page_num, page in enumerate(reader.pages):
            try:
                text = page.extract_text()
                if text and text.strip():
                    text_parts.append(text)
            except Exception as e:
                logger.warning(f"[PDF] Failed to extract page {page_num}: {e}")
                continue
        
        full_text = "\n\n".join(text_parts).strip()
        
        if not full_text:
            return "", "Could not extract text from PDF (may be scanned/image-based)"
        
        logger.info(f"[PDF] Extracted {len(full_text)} chars using pypdf")
        return full_text, None
        
    except Exception as e:
        logger.error(f"[PDF] pypdf error: {e}")
        return "", f"PDF parsing error (pypdf): {str(e)}"


def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, Optional[str]]:
    """
    Extract text from PDF file bytes.
    Automatically uses the best available engine.
    Returns: (text, error_message)
    """
    if PDF_ENGINE == "pdfplumber":
        return extract_text_from_pdf_pdfplumber(file_bytes)
    elif PDF_ENGINE == "pypdf":
        return extract_text_from_pdf_pypdf(file_bytes)
    else:
        return "", PDF_ENGINE_ERROR or "No PDF engine available"


def extract_text_from_docx(file_bytes: bytes) -> Tuple[str, Optional[str]]:
    """
    Extract text from DOCX file bytes.
    Returns: (text, error_message)
    """
    try:
        from docx import Document
        
        doc = Document(io.BytesIO(file_bytes))
        
        text_parts = []
        
        # Extract paragraphs
        for para in doc.paragraphs:
            if para.text.strip():
                text_parts.append(para.text)
        
        # Extract text from tables
        for table in doc.tables:
            for row in table.rows:
                row_text = []
                for cell in row.cells:
                    if cell.text.strip():
                        row_text.append(cell.text.strip())
                if row_text:
                    text_parts.append(" | ".join(row_text))
        
        full_text = "\n".join(text_parts).strip()
        
        if not full_text:
            return "", "Could not extract text from DOCX (empty document)"
        
        return full_text, None
        
    except Exception as e:
        return "", f"DOCX parsing error: {str(e)}"


def parse_document(file_bytes: bytes, filename: str) -> Tuple[str, Optional[str]]:
    """
    Parse document based on file extension.
    Returns: (extracted_text, error_message)
    """
    if not file_bytes:
        return "", "Empty file"
    
    ext = Path(filename).suffix.lower()
    
    if ext == ".pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext in (".docx", ".doc"):
        if ext == ".doc":
            return "", "Legacy .doc format not supported. Please convert to .docx or .pdf"
        return extract_text_from_docx(file_bytes)
    else:
        return "", f"Unsupported file format: {ext}"


def clean_text(text: str) -> str:
    """Clean and normalize extracted text."""
    if not text:
        return ""
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove non-printable characters (except newlines)
    text = ''.join(char for char in text if char.isprintable() or char in '\n\t')
    
    # Normalize line breaks
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()


def get_word_count(text: str) -> int:
    """Get word count from text."""
    if not text:
        return 0
    return len(text.split())


def validate_file(file_bytes: bytes, filename: str, max_size_mb: int = 5) -> Optional[str]:
    """
    Validate file before processing.
    Returns error message if invalid, None if valid.
    """
    if not file_bytes:
        return "File is empty"
    
    # Check size
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > max_size_mb:
        return f"File too large ({size_mb:.1f}MB). Maximum allowed: {max_size_mb}MB"
    
    # Check extension
    ext = Path(filename).suffix.lower()
    if ext not in {".pdf", ".docx"}:
        return f"Unsupported format: {ext}. Only PDF and DOCX allowed."
    
    # Basic magic number validation for PDF
    if ext == ".pdf" and not file_bytes[:4] == b'%PDF':
        return "Invalid PDF file (corrupted or wrong format)"
    
    # Basic validation for DOCX (ZIP format)
    if ext == ".docx" and not file_bytes[:2] == b'PK':
        return "Invalid DOCX file (corrupted or wrong format)"
    
    return None
