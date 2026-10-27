# AI Analysis Service — Utilities Layer

## 🎯 Purpose of this Package
Provides helper modules for document text extraction and text normalization.

---

## 📄 Files in this Package

### 1. `text_extractor.py`
- **Why it is used**: Extracts raw plain text from binary document formats uploaded by students.
- **Supported Formats**:
  - **PDF**: Uses `pypdf` to extract text streams across all pages.
  - **DOCX**: Uses `python-docx` to extract paragraph text, tables, and headers.
  - **Source Code**: Reads plain text for programming assignments (`.py`, `.java`, `.cpp`, `.c`, `.js`).

### 2. `text_normalizer.py`
- **Why it is used**: Prepares raw text for NLP analysis.
- **Operations**: Removes non-printable control characters, standardizes whitespace, strips quotation blocks (to avoid falsely penalizing academic citations), and handles unicode normalization.
