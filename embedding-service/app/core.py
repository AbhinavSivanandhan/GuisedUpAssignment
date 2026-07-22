from __future__ import annotations

import hashlib
import math
import re
from dataclasses import dataclass

DIMENSIONS = 384
MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"
FALLBACK_ID = "deterministic-hash-v1"


class EmbeddingError(Exception):
    pass


@dataclass(frozen=True)
class AuthenticityResult:
    text_score: float
    image_score: float | None
    combined_score: float
    signals: dict[str, float]


def normalize_text(text: str) -> str:
    return " ".join(text.strip().lower().split())


def deterministic_embedding(text: str, dimensions: int = DIMENSIONS) -> list[float]:
    normalized = normalize_text(text)
    if not normalized:
        raise EmbeddingError("Text must not be empty.")

    vector = [0.0] * dimensions
    tokens = re.findall(r"[a-z0-9']+", normalized)
    for token in tokens or [normalized]:
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        index = int.from_bytes(digest[:4], "big") % dimensions
        sign = 1.0 if digest[4] % 2 == 0 else -1.0
        magnitude = 0.5 + (digest[5] / 255.0)
        vector[index] += sign * magnitude

    norm = math.sqrt(sum(value * value for value in vector))
    if norm == 0:
        raise EmbeddingError("Fallback embedding norm is zero.")

    return [value / norm for value in vector]


def validate_embedding(values: list[float], dimensions: int = DIMENSIONS) -> list[float]:
    if len(values) != dimensions:
        raise EmbeddingError(f"Expected {dimensions} embedding values.")
    output = []
    for value in values:
        number = float(value)
        if not math.isfinite(number):
            raise EmbeddingError("Embedding values must be finite.")
        output.append(number)
    return output


def text_authenticity(text: str, image_url: str | None = None) -> AuthenticityResult:
    normalized = normalize_text(text)
    if not normalized:
        raise EmbeddingError("Text must not be empty.")

    words = re.findall(r"[a-z0-9']+", normalized)
    word_count = len(words)
    unique_ratio = len(set(words)) / max(word_count, 1)
    punctuation_count = sum(1 for char in text if char in "!?")
    uppercase_chars = sum(1 for char in text if char.isupper())
    alpha_chars = sum(1 for char in text if char.isalpha())

    length_score = min(word_count / 40.0, 1.0)
    uniqueness_score = min(unique_ratio, 1.0)
    punctuation_score = max(0.0, 1.0 - punctuation_count / 8.0)
    casing_score = 1.0 if alpha_chars == 0 else max(0.0, 1.0 - uppercase_chars / alpha_chars)

    text_score = clamp(
        0.35 * length_score
        + 0.25 * uniqueness_score
        + 0.20 * punctuation_score
        + 0.20 * casing_score
    )

    # No image model is implemented in this step; URL presence is not an authenticity signal.
    image_score = None
    combined_score = text_score

    return AuthenticityResult(
        text_score=text_score,
        image_score=image_score,
        combined_score=combined_score,
        signals={
            "length_score": length_score,
            "uniqueness_score": uniqueness_score,
            "punctuation_score": punctuation_score,
            "casing_score": casing_score,
            "image_url_present": 1.0 if image_url else 0.0,
        },
    )


def clamp(value: float) -> float:
    return max(0.0, min(1.0, value))
