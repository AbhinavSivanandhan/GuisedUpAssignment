# Feed Ranking Feature Specification

## Purpose

Return a personalized Real Connections Feed that prioritizes authentic, relationally meaningful, semantically relevant, and recent posts without using global engagement popularity.

## Included Roadmap Stories

US-01, US-04, US-06, US-14, US-18, US-21, US-22, US-23, US-24, US-27.

## User-Visible Behavior

An authenticated user receives a ranked feed page. A full page contains 20 posts. Ordering is stable across pagination and does not reward globally popular content.

## API Contract

`GET /api/feed?page={page}` requires Sanctum authentication.

Success: `200 OK` with post cards and pagination metadata or links.

Failures: `401` unauthenticated, `422` invalid pagination parameter.

## Data-Model Impact

Read-only. Uses `posts.embedding`, authenticity fields, `posts.created_at`, and raw `interactions` events.

## Implementation Rules

Candidate selection should use eligible recent posts with available embeddings and required display fields. Scoring uses four normalized `0..1` signals with the exact approved formula:

```text
final_score =
    0.30 × authenticity
  + 0.30 × relationship_depth
  + 0.25 × semantic_similarity
  + 0.15 × time_decay
```

Authenticity scoring must be explainable. Relationship depth uses only the authenticated user's interactions with each author. Replies weigh more than reactions, and reactions weigh more than views. Relationship events use recency decay. Semantic similarity uses cosine similarity between each post embedding and an interest vector derived from posts the authenticated user interacted with. Time decay uses an exponential half-life.

Global engagement ranking is prohibited. Global popularity, views, reactions, replies, comments, likes, shares, and follower totals must not contribute to ranking or to `final_score`.

Stable ordering is:

1. `final_score DESC`
2. `created_at DESC`
3. `id DESC`

Pagination is 20 posts per page when available. Explainability should be preserved by keeping component scores inspectable in tests and debuggable in service-level output without exposing misleading global popularity metrics.

## Responsibility Boundaries

Laravel owns ranking, pagination, orchestration, and API response resources. Python owns embedding and authenticity signals. PostgreSQL and pgvector own relational and vector persistence. React Native only displays the returned order.

## Replaceable Interfaces

Each feed score component should be an isolated service or strategy. API response resources must remain separate from ranking internals.

## Edge Cases

- Cold-start users with no interactions.
- Posts missing usable embeddings.
- Equal final scores.
- Sparse candidate pools.
- Old posts with high relevance.
- Multiple pagination requests.
- Attempted introduction of global popularity signals.

## Required Tests

Ranking tests for exact weights, normalized components, relationship depth rules, exclusion of global engagement, cold start, stable ordering, and 20-per-page pagination.

## Explicit Non-Goals

- Learned ranking.
- Global popularity ranking.
- Implementing semantic search or mobile UI.

## Definition of Done

The feature is done only when `GET /api/feed` returns authenticated, ranked, stable, paginated results according to the TSD and required tests pass.

## Current Implementation Status

- Specified/documented.
- Implemented for `GET /api/feed` in `api/`.
- Runtime-verified by Laravel feature tests covering authentication, 20-per-page pagination, authenticity, relationship depth, semantic similarity, time decay, and stable ordering.
- Ranking internals remain replaceable through explicit service boundaries.
