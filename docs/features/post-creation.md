# Post Creation Feature Specification

## Purpose

Allow an authenticated user to create a post with text and an optional image URL, automatically generate a vector embedding, and persist authenticity metadata needed by feed ranking and semantic search.

## Included Roadmap Stories

US-04, US-05, US-09, US-10, US-13, US-16, US-17, US-21, US-22, US-23.

## User-Visible Behavior

Authenticated users submit post text and may include an image URL. On success, the API returns the created post with embedding status and timestamps. Invalid text, invalid image URLs, authentication failures, and embedding failures return explicit errors.

## API Contract

`POST /api/posts` requires Sanctum authentication.

Request:

```json
{
  "text": "A grounded post about the day",
  "image_url": "https://example.com/photo.jpg"
}
```

Validation rules:

- `text`: required, string, trimmed, non-empty, length-limited.
- `image_url`: optional, nullable, valid URL when present.

Success: `201 Created` with post id, author summary, text, image URL, authenticity scores, `embedding_status`, `created_at`, and `updated_at`.

Failures: `401` unauthenticated, `422` validation error, `503` embedding unavailable when fallback is disabled or fails.

## Data-Model Impact

Creates one `posts` row containing `user_id`, `text`, nullable `image_url`, `embedding vector(384)`, `text_authenticity_score`, nullable `image_authenticity_score`, `authenticity_score`, `embedding_status`, and timestamps.

## Implementation Rules

- Use Laravel Sanctum for authentication.
- Generate embeddings automatically during post creation.
- Store embeddings as 384-dimensional vectors.
- Track `embedding_status` as `ready`, `fallback`, or `failed`.
- Use `sentence-transformers/all-MiniLM-L6-v2` through the Python FastAPI service when available.
- Use deterministic fallback only for tests or unavailable model downloads.
- Do not infer image authenticity from an image URL.
- Keep `image_authenticity_score` nullable unless genuine image analysis provides a signal.
- Wrap validation, embedding call, authenticity scoring, and persistence in a transaction boundary that avoids invalid partial writes.

## Responsibility Boundaries

Laravel owns request validation, authentication, transaction orchestration, persistence, and API responses. Python owns embedding generation and explainable authenticity analysis. PostgreSQL with pgvector owns vector storage.

## Replaceable Interfaces

Laravel should call an embedding interface, not FastAPI details. Real model-backed embedding and deterministic fallback implementations share one contract.

## Edge Cases

- Missing bearer token.
- Empty or whitespace-only text.
- Text exceeding the accepted length.
- Malformed image URL.
- Embedding service timeout.
- Model unavailable with fallback enabled.
- Fallback disabled or failed.
- Database transaction failure.

## Required Tests

Laravel feature tests: authentication required, validation failures, successful post creation, embedding persistence, fallback status, and transaction behavior. Python tests: 384-dimensional model response, fallback determinism, authenticity response shape, and unavailable-model handling.

## Explicit Non-Goals

- Implementing feed ranking or semantic search.
- Claiming transformer model execution before the model dependency is installed and run.
- Inferring image authenticity from URL presence.
- Implementing keyword search.

## Definition of Done

The feature is done only when the endpoint is implemented, embeddings are stored, fallback behavior is verified, authenticity fields are persisted, documented responses match implementation, and required tests pass.

## Current Implementation Status

- Specified/documented.
- Implemented for `POST /api/posts` in `api/`.
- Runtime-verified by Laravel feature tests as part of the current backend test suite recorded in `docs/testing.md`.
- Transformer model execution remains not runtime-verified; fallback and mocked transformer response shape are tested.
