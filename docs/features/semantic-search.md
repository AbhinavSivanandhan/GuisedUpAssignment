# Semantic Search Feature Specification

## Purpose

Allow authenticated users to search posts with natural language using vector similarity rather than keyword matching.

## Included Roadmap Stories

US-01, US-04, US-05, US-17, US-19, US-22, US-23, US-28, US-29.

## User-Visible Behavior

The user enters a natural-language query in the feed screen search bar and sees up to 10 inline search results. A query such as `funny travel stories from last week` should match semantically relevant posts and apply a documented last-week date range.

## API Contract

`GET /api/search?q={query}` requires Sanctum authentication.

Validation: `q` is required, string, trimmed, and non-empty.

Success: `200 OK` with at most 10 results, stable ordering, author information, post text, optional image URL, creation time, similarity score, embedding mode, and metadata for applied temporal filters when present.

Failures: `401` unauthenticated, `422` invalid query, `503` embedding service unavailable when no fallback can be used.

## Data-Model Impact

Read-only. Uses query embeddings compared with `posts.embedding vector(384)`, optional `created_at` date filters, and post display fields.

## Implementation Rules

- Embed the query with the Python embedding service.
- Use cosine similarity against post embeddings.
- Return a maximum of 10 results.
- Match semantic meaning rather than SQL keywords.
- Extract temporal intent and apply it as a structured date filter.
- For `funny travel stories from last week`, embed the semantic topic and apply a trailing seven-day `created_at` range for `last week`.
- Use stable result ordering, such as similarity descending, `created_at DESC`, `id DESC`.
- Do not degrade silently into keyword search.
- Deterministic fallback results must be labeled as approximate and not genuine semantic search.

## Responsibility Boundaries

Laravel owns authentication, validation, temporal parsing, query orchestration, limits, and API responses. Python owns query embedding. PostgreSQL and pgvector own cosine vector retrieval. React Native owns input state and inline display.

## Replaceable Interfaces

The mobile screen uses a mobile API client interface. Laravel uses an embedding client interface. Temporal parsing should remain replaceable behind a small parser service.

## Edge Cases

- Missing query.
- Whitespace-only query.
- Very long query.
- Query with only temporal language.
- Query with ambiguous date language.
- Embedding service timeout.
- Fallback active.
- No matching posts.

## Required Tests

Laravel tests for validation, maximum 10 results, vector-search path, no keyword fallback, temporal filter extraction, documented date-range handling, and stable ordering. Python tests for query embedding dimensions and fallback determinism.

## Explicit Non-Goals

- Full natural-language date parser beyond the documented `last week` rule.
- Keyword-only search.
- React Native search UI implementation.

## Definition of Done

The feature is done only when authenticated semantic search returns up to 10 vector-ranked results, temporal filters are applied and documented, fallback behavior is explicit, and required tests pass.

## Current Implementation Status

- Specified/documented.
- Implemented for `GET /api/search` in `api/`.
- Runtime-verified by Laravel feature tests covering authentication, validation, semantic ranking order, maximum 10 results, empty results, embedding-service failure behavior, and `last week` temporal filtering.
- PostgreSQL pgvector execution was verified with a rolled-back `posts.embedding <=> query_vector` query.
