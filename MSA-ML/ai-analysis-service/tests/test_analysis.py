"""
Tests for ai-analysis-service.
Uses an in-memory mock database (mongomock or unittest.mock) to avoid
requiring a live MongoDB connection during CI.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.plagiarism_service import compute_similarity
from app.services.ai_detection_service import compute_ai_score
from app.utils.text_normalizer import normalize
from app.utils.text_extractor import extract_text


# ---------------------------------------------------------------------------
# Text normalizer tests
# ---------------------------------------------------------------------------

def test_normalize_lowercase():
    assert normalize("Hello World") == "hello world"


def test_normalize_removes_urls():
    result = normalize("Visit https://example.com for details")
    assert "https" not in result


def test_normalize_removes_comments():
    result = normalize("# This is a comment\nprint('hello')")
    assert "comment" not in result


def test_normalize_empty():
    assert normalize("") == ""


def test_normalize_code():
    result = normalize("import java.util.List;\npublic class Main {}")
    assert "import" not in result


# ---------------------------------------------------------------------------
# Plagiarism service tests
# ---------------------------------------------------------------------------

def test_similarity_empty_corpus():
    result = compute_similarity("some text here", [])
    assert result["similarity_score"] == 0.0
    assert result["findings"] == []


def test_similarity_identical_text():
    text = "the quick brown fox jumps over the lazy dog and the cat sat on the mat"
    corpus = [{"submission_id": "sub-001", "text": text}]
    result = compute_similarity(text, corpus)
    # Should detect very high similarity
    assert result["similarity_score"] > 80.0


def test_similarity_unrelated_text():
    target = "machine learning algorithms process numerical data"
    corpus = [{"submission_id": "sub-002",
               "text": "the weather today is sunny and warm outside the building"}]
    result = compute_similarity(target, corpus)
    # Should be low similarity
    assert result["similarity_score"] < 30.0


def test_similarity_partial_overlap():
    target = "machine learning is a field of artificial intelligence that enables computers"
    corpus = [{"submission_id": "sub-003",
               "text": "machine learning enables computers to learn from data and improve"}]
    result = compute_similarity(target, corpus)
    # Should detect some similarity
    assert result["similarity_score"] > 0.0
    assert len(result["findings"]) > 0


def test_similarity_short_text():
    result = compute_similarity("hi", [{"submission_id": "sub-004", "text": "hello world"}])
    # Should not crash on very short text
    assert "similarity_score" in result


# ---------------------------------------------------------------------------
# AI detection tests
# ---------------------------------------------------------------------------

def test_ai_detection_empty():
    result = compute_ai_score("")
    assert result["ai_generated_score"] == 0.0


def test_ai_detection_short():
    result = compute_ai_score("Too short")
    assert result["ai_generated_score"] == 0.0


def test_ai_detection_returns_valid_range():
    text = (
        "Machine learning is a subset of artificial intelligence that provides systems "
        "the ability to automatically learn and improve from experience without being "
        "explicitly programmed. Machine learning focuses on the development of computer "
        "programs that can access data and use it to learn for themselves. The process "
        "begins with observations or data such as examples, direct experience, or instruction."
    )
    result = compute_ai_score(text)
    assert 0.0 <= result["ai_generated_score"] <= 100.0
    assert "features" in result
    assert "interpretation" in result


def test_ai_detection_features_present():
    text = "This is a longer piece of text with multiple sentences. " * 10
    result = compute_ai_score(text)
    features = result["features"]
    assert "burstiness" in features
    assert "lexical_diversity" in features


# ---------------------------------------------------------------------------
# Text extractor tests
# ---------------------------------------------------------------------------

def test_extract_nonexistent_file():
    result = extract_text("/nonexistent/path/file.txt")
    assert result == ""


def test_extract_temp_txt_file(tmp_path):
    f = tmp_path / "test.txt"
    f.write_text("Hello from test file", encoding="utf-8")
    result = extract_text(str(f))
    assert "Hello from test file" in result


def test_extract_temp_py_file(tmp_path):
    f = tmp_path / "code.py"
    f.write_text("def main():\n    print('hello')\n", encoding="utf-8")
    result = extract_text(str(f))
    assert "def main" in result
