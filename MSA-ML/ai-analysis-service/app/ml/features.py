"""
Stylometric and Natural Language Feature Extractor for AI vs Human text classification.
Implements a Scikit-Learn compatible TransformerMixin for seamless pipeline integration.
"""

import re
import math
import statistics
from collections import Counter
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import FeatureUnion


# High-frequency English function words (closed-class words)
FUNCTION_WORDS = frozenset({
    "the", "a", "an", "in", "on", "at", "to", "for", "of", "and", "or", "but",
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "will", "would", "could", "should", "may", "might",
    "that", "which", "who", "this", "these", "those", "it", "its", "they", "their",
    "with", "from", "by", "as", "if", "so", "not", "no", "nor", "than", "into",
    "about", "against", "between", "through", "during", "before", "after", "above"
})

PRESCRIPTIVE_WORDS = frozenset({
    "crucial", "pivotal", "vital", "essential", "paramount", "imperative",
    "tapestry", "multifaceted", "holistic", "seamless", "delve", "testament",
    "furthermore", "moreover", "consequently", "undeniably", "notably", "significantly"
})


def tokenize_words(text: str) -> list[str]:
    """Tokenize words ignoring numbers and punctuation."""
    return [w.lower() for w in re.findall(r"\b[a-zA-Z]+\b", text)]


def split_sentences(text: str) -> list[str]:
    """Split text into sentences preserving meaningful clauses."""
    raw = [s.strip() for s in re.split(r"(?<=[.!?])\s+|\r?\n+", text) if s.strip()]
    if not raw:
        raw = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
    return [s for s in raw if len(tokenize_words(s)) >= 2]


class StylometricFeatureExtractor(BaseEstimator, TransformerMixin):
    """
    Extracts high-dimensional stylometric, syntactic, and structural features
    from text to distinguish human variation from generative LLM output.
    """

    FEATURE_NAMES = [
        "mean_sentence_length",
        "std_sentence_length",
        "burstiness_cv",
        "lexical_diversity_ttr",
        "root_ttr",
        "hapax_legomena_ratio",
        "mean_word_length",
        "std_word_length",
        "function_word_ratio",
        "prescriptive_word_ratio",
        "comma_density",
        "semicolon_colon_density",
        "hyphen_dash_density",
        "bigram_repetition_ratio",
    ]

    def fit(self, X, y=None):
        return self

    def extract_feature_dict(self, text: str) -> dict[str, float]:
        """
        Extract stylometric features as a dictionary with human-readable keys.
        Used directly in API responses and diagnostics.
        """
        if not text or not text.strip():
            return {name: 0.0 for name in self.FEATURE_NAMES}

        words = tokenize_words(text)
        sentences = split_sentences(text)
        n_words = len(words)
        n_sentences = max(1, len(sentences))

        if n_words == 0:
            return {name: 0.0 for name in self.FEATURE_NAMES}

        # 1. Sentence length distribution & Burstiness
        sent_lengths = [len(tokenize_words(s)) for s in sentences]
        if sent_lengths:
            mean_sent_len = float(statistics.mean(sent_lengths))
            std_sent_len = float(statistics.stdev(sent_lengths)) if len(sent_lengths) > 1 else 0.0
            burstiness_cv = (std_sent_len / mean_sent_len) if mean_sent_len > 0 else 0.0
        else:
            mean_sent_len = float(n_words)
            std_sent_len = 0.0
            burstiness_cv = 0.0

        # 2. Lexical diversity (Type-Token Ratio)
        vocab = Counter(words)
        unique_words = len(vocab)
        ttr = float(unique_words / n_words)
        root_ttr = float(unique_words / math.sqrt(n_words)) if n_words > 0 else 0.0
        hapax_count = sum(1 for count in vocab.values() if count == 1)
        hapax_ratio = float(hapax_count / n_words)

        # 3. Word length distribution
        word_lengths = [len(w) for w in words]
        mean_word_len = float(statistics.mean(word_lengths))
        std_word_len = float(statistics.stdev(word_lengths)) if len(word_lengths) > 1 else 0.0

        # 4. Syntactic word distributions
        function_word_count = sum(1 for w in words if w in FUNCTION_WORDS)
        function_ratio = float(function_word_count / n_words)

        prescriptive_count = sum(1 for w in words if w in PRESCRIPTIVE_WORDS)
        prescriptive_ratio = float(prescriptive_count / n_words)

        # 5. Punctuation densities (normalized per 100 words)
        scale = 100.0 / n_words
        comma_density = float(text.count(",") * scale)
        sc_density = float((text.count(";") + text.count(":")) * scale)
        hyphen_density = float((text.count("-") + text.count("—") + text.count("–")) * scale)

        # 6. Bigram repetition proxy
        if n_words >= 2:
            bigrams = [f"{words[i]}_{words[i+1]}" for i in range(n_words - 1)]
            unique_bigrams = len(set(bigrams))
            bigram_ratio = float(unique_bigrams / len(bigrams))
        else:
            bigram_ratio = 1.0

        return {
            "mean_sentence_length": round(mean_sent_len, 3),
            "std_sentence_length": round(std_sent_len, 3),
            "burstiness_cv": round(burstiness_cv, 4),
            "lexical_diversity_ttr": round(ttr, 4),
            "root_ttr": round(root_ttr, 4),
            "hapax_legomena_ratio": round(hapax_ratio, 4),
            "mean_word_length": round(mean_word_len, 3),
            "std_word_length": round(std_word_len, 3),
            "function_word_ratio": round(function_ratio, 4),
            "prescriptive_word_ratio": round(prescriptive_ratio, 4),
            "comma_density": round(comma_density, 3),
            "semicolon_colon_density": round(sc_density, 3),
            "hyphen_dash_density": round(hyphen_density, 3),
            "bigram_repetition_ratio": round(bigram_ratio, 4),
        }

    def transform(self, X):
        """Transform an iterable of raw text strings into a 2D numpy feature matrix."""
        features_list = []
        for text in X:
            fdict = self.extract_feature_dict(text if isinstance(text, str) else "")
            row = [fdict[k] for k in self.FEATURE_NAMES]
            features_list.append(row)
        return np.nan_to_num(np.array(features_list, dtype=np.float64), nan=0.0, posinf=1.0, neginf=0.0)

    def get_feature_names_out(self, input_features=None):
        return np.array([f"stylometry__{name}" for name in self.FEATURE_NAMES])


def create_feature_pipeline():
    """
    Constructs a FeatureUnion combining:
      1. Character and Word TF-IDF n-grams (syntactic phrases, transition words)
      2. Dense Stylometric & Statistical feature matrix (sentence dynamics, lexical entropy)
    """
    return FeatureUnion([
        ("tfidf", TfidfVectorizer(
            analyzer="word",
            ngram_range=(1, 2),
            max_features=4000,
            sublinear_tf=True,
            min_df=1,
            token_pattern=r"(?u)\b[a-zA-Z]{2,}\b"
        )),
        ("stylometry", StylometricFeatureExtractor())
    ])
