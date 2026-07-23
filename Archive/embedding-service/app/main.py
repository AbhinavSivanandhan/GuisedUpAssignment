from __future__ import annotations

import os
from functools import lru_cache
from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from app.core import (
    DIMENSIONS,
    FALLBACK_ID,
    MODEL_ID,
    EmbeddingError,
    deterministic_embedding,
    text_authenticity,
    validate_embedding,
)

app = FastAPI(title="Guised Up Embedding Service")


class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=1)
    image_url: str | None = None
    mode: Literal["transformer", "fallback", "auto"] = "auto"


class AnalyzeResponse(BaseModel):
    embedding: list[float]
    dimensions: int
    mode: Literal["transformer", "fallback"]
    model: str
    fallback_reason: str | None = None
    authenticity: dict


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "model": MODEL_ID,
        "fallback": FALLBACK_ID,
        "dimensions": DIMENSIONS,
    }


@app.post("/embed", response_model=AnalyzeResponse)
def embed(request: AnalyzeRequest) -> AnalyzeResponse:
    return analyze(request)


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="Text must not be empty.")

    mode = request.mode if request.mode != "auto" else os.getenv("EMBEDDING_MODE", "fallback")
    fallback_reason = None

    try:
        if mode == "transformer":
            embedding = transformer_embedding(text)
            response_mode: Literal["transformer", "fallback"] = "transformer"
            model = MODEL_ID
        else:
            embedding = deterministic_embedding(text)
            response_mode = "fallback"
            model = FALLBACK_ID
            fallback_reason = "configured fallback mode"
    except Exception as exc:
        if os.getenv("EMBEDDING_ALLOW_FALLBACK_ON_FAILURE", "true").lower() != "true":
            raise HTTPException(status_code=503, detail="Embedding model unavailable.") from exc
        embedding = deterministic_embedding(text)
        response_mode = "fallback"
        model = FALLBACK_ID
        fallback_reason = f"model unavailable: {type(exc).__name__}"

    try:
        embedding = validate_embedding(embedding)
        authenticity = text_authenticity(text, request.image_url)
    except EmbeddingError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return AnalyzeResponse(
        embedding=embedding,
        dimensions=DIMENSIONS,
        mode=response_mode,
        model=model,
        fallback_reason=fallback_reason,
        authenticity={
            "text_score": authenticity.text_score,
            "image_score": authenticity.image_score,
            "combined_score": authenticity.combined_score,
            "signals": authenticity.signals,
        },
    )


@lru_cache(maxsize=1)
def model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(MODEL_ID)


def transformer_embedding(text: str) -> list[float]:
    values = model().encode(text, normalize_embeddings=True).tolist()
    return validate_embedding(values)
