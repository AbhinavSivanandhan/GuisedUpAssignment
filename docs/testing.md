# Testing Strategy

Backend tests now exist for implemented post creation, feed ranking, semantic search, and interaction behavior. Laravel feature tests and Python embedding-service tests have been run in Docker. Authenticated HTTP smoke tests have been run against the Docker PostgreSQL/pgvector stack. SQL challenge queries have been executed against PostgreSQL with rolled-back fixtures. The Expo React Native feed screen has TypeScript and focused state tests. Deployment and video verification remain future work. The strategy prioritizes critical flows and does not require exhaustive TDD.

## Sanctum Authentication

- Feature tests should reject unauthenticated requests to `POST /api/posts`, `GET /api/feed`, `GET /api/search`, and `POST /api/interactions`.
- Feature tests should accept valid Sanctum bearer tokens and scope user-specific behavior to the authenticated user.
- Current evidence: implemented tests cover unauthenticated `POST /api/posts`, `GET /api/feed`, `GET /api/search`, and `POST /api/interactions`.

## Post Creation

- Validate required text and optional image URL.
- Confirm successful creation persists author, text, image URL, timestamps, authenticity scores, embedding status, and a 384-dimensional embedding.
- Confirm failures return documented validation or service errors without partial invalid persistence.
- Current evidence: implemented Laravel tests cover validation, successful persistence, malformed embedding responses, and service failure without partial post persistence.

## Embedding Generation and Persistence

- Confirm the Python service returns 384 dimensions for `sentence-transformers/all-MiniLM-L6-v2`.
- Confirm Laravel stores embeddings in `posts.embedding` as pgvector-compatible `vector(384)`.
- Current evidence: Python tests cover 384-dimensional fallback and mocked transformer response shapes; Laravel migrations were run against PostgreSQL with pgvector enabled.

## Deterministic Embedding Fallback

- Confirm identical input returns identical vectors.
- Confirm vectors have 384 dimensions.
- Confirm fallback use is surfaced through `embedding_status`.
- Confirm tests do not treat fallback as genuine semantic retrieval.
- Current evidence: Python tests cover deterministic repeatability, finite unit-normalized output, and fallback mode identification.

## Personalized Ranking

- Verify the exact formula:

```text
final_score =
    0.30 × authenticity
  + 0.30 × relationship_depth
  + 0.25 × semantic_similarity
  + 0.15 × time_decay
```

- Verify all component scores are normalized to `0..1`.
- Verify replies weigh more than reactions and reactions weigh more than views.
- Verify relationship events use recency decay.
- Current evidence: implemented Laravel tests cover authenticity, authenticated-user relationship depth, semantic similarity, and time decay ordering.

## Ranking Exclusions

- Verify global engagement ranking is prohibited.
- Verify global views, reactions, replies, comments, likes, shares, and follower totals do not contribute to `final_score`.
- Verify relationship depth uses only the authenticated user's interactions with each author.

## Stable Ordering and Pagination

- Verify ordering by `final_score DESC`, `created_at DESC`, and `id DESC`.
- Verify `GET /api/feed` returns 20 posts per page when available.
- Verify pagination metadata or links are present.
- Verify stable behavior across pages.
- Current evidence: implemented Laravel tests cover 20-per-page pagination metadata and stable ordering by `final_score DESC`, `created_at DESC`, and `id DESC`.

## Semantic Search

- Verify query validation for missing and empty `q`.
- Verify query embedding and cosine similarity are used.
- Verify search returns at most 10 results.
- Verify search does not silently degrade to keyword search.
- Current evidence: implemented Laravel tests cover unauthenticated rejection, query validation, semantic ranking order through vector cosine similarity, 10-result limiting, empty results, and embedding-service failure behavior.

## Temporal-Intent Filtering

- Verify a natural-language query with temporal intent applies semantic retrieval and the documented date range.
- Verify the response exposes or documents the applied temporal filter.
- Current evidence: implemented Laravel tests cover `funny travel stories from last week` with a trailing seven-day `created_at` filter and response metadata for the parsed temporal filter.

## Interaction Validation and Persistence

- Verify `POST /api/interactions` accepts only `view`, `reply`, or `reaction`.
- Verify invalid `post_id` and invalid `type` fail.
- Verify raw events are persisted for relationship-depth and SQL reporting.
- Current evidence: implemented Laravel tests cover invalid type, missing post, valid persistence, and repeated raw event preservation.
- Current reaction-state evidence: implemented Laravel tests cover activation of current reaction state from `POST /api/interactions`, reaction-kind defaulting, all supported reaction kinds, invalid reaction-kind validation, switching current reaction kind while preserving raw events, authenticated undo with `DELETE /api/posts/{post}/reaction`, idempotent undo, viewer-scoped current-state deletion, and `viewer_has_reacted` / `viewer_reaction_kind` hydration in feed and search responses.

## Python Embedding Service

- Unit tests should cover model-backed embeddings, fallback embeddings, authenticity response shape, unavailable model handling, and invalid input handling.
- Current evidence: Python tests cover health, fallback response shape, mocked transformer response shape, 384 dimensions, fallback determinism, finite normalized output, fallback mode identification, authenticity score bounds, nullable image authenticity, and empty input rejection.

## React Native Component and Integration Behavior

- Component or integration tests should cover feed loading, post card fields, relative time, reaction button states, infinite scrolling, inline search results, empty state, error state, and retry behavior.
- Current evidence: the mobile app under `mobile/` separates the API client, feed/search state hook, reducer, reusable `PostCard`, screen composition, and theme tokens. `npm run typecheck` passed. `npm test` passed 20 tests covering API error mapping, request timeout, typed reaction API calls, reaction undo API calls, pagination deduplication, search-mode switching, stale search-response rejection, stale search-error rejection, recoverable error handling, pagination metadata, duplicate filtering, page-aligned feed retention, bidirectional page-window loading, partial final page retention, refresh reset, reaction success/failure rollback, and consistent reaction updates across feed and search state.

## Mobile Feed Memory Policy

- The mobile reducer retains at most five complete feed pages, equal to 100 posts at the API's 20-post page size.
- Earlier complete pages are released only after a later page has appended successfully.
- Later complete pages are released only after an earlier page has prepended successfully.
- The next server page cursor remains independent from retained rows.
- Search results remain independent and limited to the API's top 10 results.
- A subtle notice is shown when earlier or later pages have been released.

## SQL Challenge Verification

- D1 should count raw `view`, `reply`, and `reaction` events from `interactions` during the trailing seven days and order deterministic ties.
- D2 should use an obvious supplied `user_id`, count that user's interactions with post authors, return posts from the trailing 30 days, and order by interaction frequency without join multiplication.
- D3 should return only posts with more than 100 views and zero reactions, excluding exactly 100 views and any reacted post.
- D4 should return users with more than 20 posts during the trailing 24 hours, excluding exactly 20 posts and posts outside the window.
- Current evidence: `sql/queries.sql` was executed against Docker PostgreSQL with representative fixture data inserted inside transactions and rolled back. `EXPLAIN` was run for D1 through D4. D2 used `interactions_user_id_post_id_type_index`, `posts_pkey`, `posts_user_id_created_at_index`, and `users_pkey`; D4 used `posts_created_at_index`. D1 and D3 planned sequential scans on the tiny verification fixture, which is an observed plan, not a performance benchmark.

## Optional Expo Web Smoke Verification

- If Expo Web is used for smoke verification, verify the feed screen renders, loading/empty/error states are visible, search can be entered, and repeated pagination does not duplicate rows.

## Clean-Start Reproducibility

- Future README instructions should support install, environment configuration, database startup, migrations, seeds, backend API, Python embedding service, mobile app, and tests from a clean checkout.
