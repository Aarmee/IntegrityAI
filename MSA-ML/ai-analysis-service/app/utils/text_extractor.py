"""
Text extraction utilities.

Extracts structured plain text from various file types for analysis and in-browser preview.
Supports: .docx (with python-docx + XML fallback, preserving paragraphs and formatting),
          .doc (legacy binary Word 97-2003 with pure-python stream parsing),
          .pdf (with pypdf page-by-page extraction with page break markers, strict=False,
                encryption bypass, and resilient error recovery per-page),
          .txt, .py, .java, .js, .ts, .c, .cpp, .h, .cs, .json, .md,
          .zip (recurse).
"""

import zipfile
import re
import os
import urllib.parse
from pathlib import Path


def extract_text(file_path: str) -> str:
    """
    Extract text content from a file at the given path.
    Preserves paragraph breaks (\\n\\n) and page boundaries (<!-- PAGE_BREAK -->).
    Returns empty string on failure.
    """
    if not file_path:
        return ""

    # Clean quotes, whitespace, and file:// URL prefixes
    cleaned_path = file_path.strip().strip('"').strip("'")
    if cleaned_path.startswith("file:///"):
        cleaned_path = cleaned_path[8:]
    elif cleaned_path.startswith("file://"):
        cleaned_path = cleaned_path[7:]

    cleaned_path = urllib.parse.unquote(cleaned_path)
    path = Path(cleaned_path)

    if not path.exists():
        # Check if this is an S3 URL or if the file exists in the shared uploads directory
        upload_dir = Path("/tmp/integrityai_uploads")
        if cleaned_path.startswith("s3://"):
            raw_s3 = cleaned_path[5:]
            _, s3_key = raw_s3.split("/", 1) if "/" in raw_s3 else ("", raw_s3)
            fname = Path(s3_key).name
            s3_candidates = [
                upload_dir / s3_key,
                upload_dir / s3_key.replace("submissions/", ""),
                upload_dir / fname,
            ]
            if upload_dir.exists() and fname:
                try:
                    s3_candidates.extend(list(upload_dir.rglob(fname)))
                except Exception:
                    pass
            for cand in s3_candidates:
                if cand and cand.is_file() and cand.stat().st_size > 0:
                    path = cand
                    break

        if not path.exists() and upload_dir.exists():
            fname = Path(cleaned_path).name
            try:
                for match in upload_dir.rglob(fname):
                    if match.is_file() and match.stat().st_size > 0:
                        path = match
                        break
            except Exception:
                pass

        if not path.exists():
            # Try alternate path separators for Windows / Linux cross-compatibility
            alt_win = Path(cleaned_path.replace("/", "\\"))
            if alt_win.exists():
                path = alt_win
            else:
                alt_posix = Path(cleaned_path.replace("\\", "/"))
                if alt_posix.exists():
                    path = alt_posix
                else:
                    print(f"[text_extractor] File not found: {file_path}")
                    return ""

    suffix = path.suffix.lower()

    try:
        if suffix in {".txt", ".py", ".java", ".js", ".ts", ".c", ".cpp", ".h", ".cs", ".json", ".md"}:
            return _read_text_file(path)

        elif suffix == ".docx":
            return _extract_docx(path)

        elif suffix in {".doc", ".dot"}:
            return _extract_doc(path)

        elif suffix == ".zip":
            return _extract_zip(path)

        elif suffix == ".pdf":
            return _extract_pdf(path)

        else:
            # Fallback attempts for untyped or unrecognized files
            try:
                docx_text = _extract_docx(path)
                if docx_text and len(docx_text.strip()) > 20:
                    return docx_text
            except Exception:
                pass

            try:
                pdf_text = _extract_pdf(path)
                if pdf_text and len(pdf_text.strip()) > 20:
                    return pdf_text
            except Exception:
                pass

            return _read_text_file(path)

    except Exception as e:
        print(f"[text_extractor] Error extracting {file_path}: {e}")
        return ""


def _read_text_file(path: Path) -> str:
    for encoding in ("utf-8", "latin-1", "cp1252"):
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue
    return ""


def _extract_docx(path: Path) -> str:
    """
    Extract text from a .docx file while preserving distinct paragraphs, tables, and page flow.
    First attempts python-docx; falls back to XML parsing if needed.
    """
    # 1. Try python-docx
    try:
        import docx
        doc = docx.Document(path)
        blocks: list[str] = []

        # Traverse all paragraphs in document body
        for p in doc.paragraphs:
            text = p.text.strip()
            if text:
                blocks.append(text)

        # Also extract all tables
        for tbl in doc.tables:
            for row in tbl.rows:
                row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_cells:
                    blocks.append(" | ".join(row_cells))

        # Check if SDT (Content Controls) contain paragraphs not caught by doc.paragraphs
        if not blocks:
            for elem in doc.element.body.iter():
                tag = elem.tag.split("}")[-1] if "}" in elem.tag else elem.tag
                if tag == "p":
                    p = docx.text.paragraph.Paragraph(elem, doc)
                    t = p.text.strip()
                    if t:
                        blocks.append(t)

        if blocks:
            return "\n\n".join(blocks)
    except Exception as e:
        print(f"[text_extractor] python-docx extraction failed ({e}), using XML fallback")

    # 2. Fallback to XML parsing with paragraph preservation
    try:
        with zipfile.ZipFile(path, "r") as z:
            if "word/document.xml" not in z.namelist():
                return ""
            xml_content = z.read("word/document.xml").decode("utf-8", errors="replace")

            # Check for page breaks
            xml_content = re.sub(r'<w:br[^>]*w:type="page"[^>]*>', "\n\n<!-- PAGE_BREAK -->\n\n", xml_content)
            xml_content = re.sub(r'<w:lastRenderedPageBreak[^>]*>', "\n\n<!-- PAGE_BREAK -->\n\n", xml_content)

            # Preserve paragraph breaks </w:p> and line breaks <w:br/>
            xml_content = re.sub(r"</w:p>", "\n\n", xml_content)
            xml_content = re.sub(r"<w:br[^>]*>", "\n", xml_content)
            xml_content = re.sub(r"<w:cr[^>]*>", "\n", xml_content)

            # Strip all remaining XML tags
            text = re.sub(r"<[^>]+>", "", xml_content)

            # Normalize horizontal whitespace per line while preserving paragraphs (\n\n)
            cleaned_paras: list[str] = []
            for para in text.split("\n\n"):
                para_clean = " ".join(para.split()).strip()
                if para_clean:
                    cleaned_paras.append(para_clean)

            return "\n\n".join(cleaned_paras)
    except Exception as e:
        print(f"[text_extractor] XML fallback failed: {e}")
        return ""


def _extract_doc(path: Path) -> str:
    """
    Extract readable text from legacy binary .doc (Word 97-2003) files.
    """
    try:
        raw_bytes = path.read_bytes()
        text_parts: list[str] = []

        # Try extracting UTF-16LE text chunks (common in Word 97-2003)
        utf16_matches = re.findall(rb'(?:[\x20-\x7e]\x00){4,}', raw_bytes)
        for m in utf16_matches:
            try:
                decoded = m.decode('utf-16le', errors='ignore').strip()
                if len(decoded) > 3 and not decoded.startswith('Microsoft'):
                    text_parts.append(decoded)
            except Exception:
                pass

        # If UTF-16LE didn't find much text, extract ASCII/Latin-1 strings
        if len(" ".join(text_parts)) < 50:
            ascii_matches = re.findall(rb'[\x20-\x7e\t\r\n]{4,}', raw_bytes)
            for m in ascii_matches:
                try:
                    decoded = m.decode('latin-1', errors='ignore').strip()
                    if len(decoded) > 3 and not any(k in decoded for k in ['WordDocument', 'CompObj', 'SummaryInformation', 'DocumentSummaryInformation']):
                        text_parts.append(decoded)
                except Exception:
                    pass

        return "\n\n".join(text_parts)
    except Exception as e:
        print(f"[text_extractor] .doc extraction failed: {e}")
        return ""


def _extract_pdf(path: Path) -> str:
    """
    Extract text page-by-page from PDF.
    Inserts <!-- PAGE_BREAK --> between pages so frontend can render distinct authentic pages.
    Handles multi-page documents, password encryption, and resilient per-page extraction.
    """
    pages_text: list[str] = []

    # 1. Primary: Try pypdf with robust per-page isolation
    try:
        import pypdf
        reader = pypdf.PdfReader(str(path), strict=False)

        # Handle password encrypted PDFs with blank password
        if reader.is_encrypted:
            try:
                reader.decrypt("")
            except Exception:
                pass

        for idx, page in enumerate(reader.pages):
            page_text = ""
            try:
                page_text = page.extract_text() or ""
            except Exception as e1:
                print(f"[text_extractor] pypdf page {idx+1} extract warning: {e1}")

            # Sanitize control characters and null bytes while preserving real text
            page_text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", " ", page_text)
            page_text = "\n".join(line.rstrip() for line in page_text.splitlines()).strip()

            if page_text:
                pages_text.append(page_text)

        if pages_text:
            return "\n\n<!-- PAGE_BREAK -->\n\n".join(pages_text)
    except Exception as e:
        print(f"[text_extractor] pypdf extraction failed: {e}")

    # 2. Secondary: Try PyMuPDF (fitz) if installed
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(str(path))
        fitz_pages: list[str] = []
        for page in doc:
            try:
                t = page.get_text() or ""
                t = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", " ", t).strip()
                if t:
                    fitz_pages.append(t)
            except Exception:
                continue
        if fitz_pages:
            return "\n\n<!-- PAGE_BREAK -->\n\n".join(fitz_pages)
    except Exception:
        pass

    # 3. Tertiary: Try pdfplumber if installed
    try:
        import pdfplumber
        with pdfplumber.open(str(path)) as pdf:
            plumber_pages = []
            for p in pdf.pages:
                try:
                    t = p.extract_text() or ""
                    t = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", " ", t).strip()
                    if t:
                        plumber_pages.append(t)
                except Exception:
                    continue
            if plumber_pages:
                return "\n\n<!-- PAGE_BREAK -->\n\n".join(plumber_pages)
    except Exception:
        pass

    # 4. Fallback: FlateDecode stream parser (pure Python standard library)
    try:
        import zlib
        raw_bytes = path.read_bytes()
        fallback_snippets: list[str] = []
        current_snippets: list[str] = []

        stream_regex = re.compile(rb"stream[\r\n]+(.*?)[\r\n]+endstream", re.DOTALL)
        for match in stream_regex.finditer(raw_bytes):
            stream_data = match.group(1)
            decompressed: bytes = b""
            try:
                decompressed = zlib.decompress(stream_data)
            except Exception:
                try:
                    decompressed = zlib.decompress(stream_data, -zlib.MAX_WBITS)
                except Exception:
                    continue

            text_content = decompressed.decode("latin-1", errors="ignore")
            # Find Tj operators: (string) Tj
            tj_matches = re.findall(r"\(([^\\\)]{2,}?)\)\s*Tj", text_content)
            for snippet in tj_matches:
                clean = _sanitize_snippet(snippet)
                if clean:
                    current_snippets.append(clean)

            # Find TJ array operators: [(str) 20 (str)] TJ
            tj_array_matches = re.findall(r"\[(.*?)\]\s*TJ", text_content)
            for arr in tj_array_matches:
                parts = re.findall(r"\(([^\\\)]{2,}?)\)", arr)
                for part in parts:
                    clean = _sanitize_snippet(part)
                    if clean:
                        current_snippets.append(clean)

            if len(current_snippets) > 5:
                page_str = " ".join(current_snippets).strip()
                if _is_clean_readable_text(page_str):
                    fallback_snippets.append(page_str)
                current_snippets = []

        if current_snippets:
            page_str = " ".join(current_snippets).strip()
            if _is_clean_readable_text(page_str):
                fallback_snippets.append(page_str)

        if fallback_snippets:
            return "\n\n<!-- PAGE_BREAK -->\n\n".join(fallback_snippets)
    except Exception as e:
        print(f"[text_extractor] Fallback stream extraction failed: {e}")

    return ""


def _sanitize_snippet(snippet: str) -> str:
    snippet = snippet.replace("\\n", "\n").replace("\\r", " ").replace("\\t", " ")
    snippet = snippet.replace("\\(", "(").replace("\\)", ")").replace("\\\\", "\\")
    snippet = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]", "", snippet)
    snippet = " ".join(snippet.split()).strip()
    return snippet


def _is_clean_readable_text(text: str) -> bool:
    """Verifies that the extracted text is genuinely human-readable and not compressed/binary noise."""
    if not text or len(text.strip()) < 10:
        return False
    clean = text.strip()
    # Check ASCII printable character ratio (reject high-byte / Latin-1 glyph bytecode)
    ascii_printable = sum(1 for c in clean if 32 <= ord(c) <= 126 or c in "\n\r\t")
    if (ascii_printable / len(clean)) < 0.82:
        return False
    # Check that there are actual words with normal letters
    words = re.findall(r"\b[a-zA-Z]{2,}\b", clean)
    if len(words) < 3:
        return False
    # Total alphabetical character ratio
    alpha_chars = sum(1 for c in clean if c.isalpha())
    if (alpha_chars / len(clean)) < 0.35:
        return False
    return True


def _extract_zip(path: Path) -> str:
    """Recursively extract text from supported files inside a ZIP archive."""
    texts: list[str] = []
    try:
        with zipfile.ZipFile(path, "r") as z:
            for name in z.namelist():
                if name.endswith("/"):
                    continue
                suffix = Path(name).suffix.lower()
                if suffix in {".txt", ".py", ".java", ".js", ".ts", ".c", ".cpp", ".h"}:
                    try:
                        content = z.read(name).decode("utf-8", errors="replace")
                        texts.append(f"# --- {name} ---\n{content}")
                    except Exception:
                        pass
    except Exception:
        return ""
    return "\n\n".join(texts)
