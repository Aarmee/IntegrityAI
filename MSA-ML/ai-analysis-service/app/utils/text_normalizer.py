"""
Text normalisation utilities for consistent comparison.
"""

import re
import unicodedata


def normalize(text: str) -> str:
    """
    Normalize text for similarity comparison:
    1. Unicode NFC normalization
    2. Lowercase
    3. Remove URLs
    4. Remove excessive whitespace
    5. Strip common code noise (comments, docstrings, imports)
    """
    if not text:
        return ""

    # Unicode normalise
    text = unicodedata.normalize("NFC", text)

    # Lowercase
    text = text.lower()

    # Remove URLs
    text = re.sub(r"https?://\S+", " ", text)

    # Remove code comments (// ... , # ... , /* ... */)
    text = re.sub(r"//[^\n]*", " ", text)
    text = re.sub(r"#[^\n]*",  " ", text)
    text = re.sub(r"/\*.*?\*/", " ", text, flags=re.DOTALL)

    # Remove import/package/using statements
    text = re.sub(r"^\s*(import|from|package|using|include)\s+\S+.*$",
                  " ", text, flags=re.MULTILINE)

    # Remove punctuation and special chars (keep alphanumeric and spaces)
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Collapse whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text


def extract_ngrams(text: str, n: int = 3) -> list[str]:
    """Return character n-grams from normalized text."""
    words = text.split()
    if len(words) < n:
        return words
    return [" ".join(words[i : i + n]) for i in range(len(words) - n + 1)]
