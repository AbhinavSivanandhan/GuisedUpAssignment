# Guised Up Real Connections Feed — User Story Roadmap

## 1. Verification status

Source of truth: `Assignment.md`, the frozen implementation contract and complete assessment transcription. The original assessment PDF remains the external requirement authority for audit traceability and includes additional product/evaluation phrasing preserved in this roadmap.

The current workspace contains `Assignment.md`, this roadmap, repository governance, workspace documentation, the TSD, architecture documentation, testing strategy, AI usage documentation, an ADR, feature specifications, a Laravel API foundation, a Python FastAPI embedding service, Docker Compose configuration, a README, environment examples, migrations, seeders, `GET /api/feed`, `GET /api/search`, `sql/queries.sql`, an Expo React Native feed screen, and focused tests. It does not contain deployment artifacts, final submission, or video. Therefore:

- This roadmap organizes and traces the requirements in `Assignment.md` and the original assessment PDF.
- A roadmap item may not weaken or contradict `Assignment.md` or the original assessment PDF.
- Application implementation compliance is verified only for the backend foundation evidence listed below.
- Documentation-only evidence may be recorded below when a document directly satisfies a documentation acceptance criterion.
- Application stories remain `Unverified / not evidenced` until their acceptance criteria can be demonstrated in the submission repository; partial backend stories below are documented separately from deferred mobile, deployment, and video work.
- Any roadmap item that is not directly traceable to `Assignment.md` is planning guidance only, unless later approved through a contract-compliant amendment.
- Verified assessment-weighted progress before US-18 implementation was approximately 52%, based only on audited evidence: TSD/documentation 25/25, backend foundation about 12/25, React Native 0/20, SQL 0/15, AI usage 15/15.
- Verified assessment-weighted progress after US-18 implementation is approximately 57%, based on the same evidence plus `GET /api/feed`, focused feed-ranking tests, route verification, and API image build verification.
- Verified assessment-weighted progress after US-19 implementation is approximately 62%, based on the same evidence plus `GET /api/search`, focused search tests, route verification, Docker image builds, and PostgreSQL pgvector operator verification.
- Verified assessment-weighted progress after the SQL challenge implementation is approximately 77%, based on the same evidence plus `sql/queries.sql`, PostgreSQL execution of D1 through D4 with rolled-back fixtures, `EXPLAIN` output, and rollback cleanup verification.
- Verified assessment-weighted progress after the React Native Feed Screen implementation is approximately 97%, based on the same evidence plus `mobile/`, TypeScript type-check, 5 mobile state tests, and Expo Metro startup verification. Deployment, final submission, and explanation video remain incomplete.

## 2. Definition of success

Deliver a private, reproducible full-stack assessment within one full day (8 hours) that demonstrates a personalized Real Connections Feed, natural-language semantic search, clean architecture, intentional mobile UI, correct raw SQL, documented technical reasoning, honest AI-assisted workflow, and an explanatory product video.

The solution must use React Native, Laravel PHP, Python where appropriate, SQL, and a vector database. It is not a generic CRUD exercise: decisions and product comprehension must be visible in both the TSD and implementation. The product framing is no curated highlight reels, no follower-count anxiety, and real people making real connections.

## 3. Deliverables register

| ID | Deliverable | Required form/location | Completed by |
|---|---|---|---|
| DEL-01 | Technical Solution Document | `/docs/TSD.pdf`, `/docs/TSD.md`, or a Notion link in README | US-01 through US-08, US-35 |
| DEL-02 | Backend API | Laravel main API layer; Python allowed for ML/embedding work | US-09 through US-23 |
| DEL-03 | React Native Feed Screen | One intentional, non-default-styled screen | US-24 through US-30 |
| DEL-04 | Raw SQL challenge | `/sql/queries.sql` | US-31 through US-34 |
| DEL-05 | Reproducible database | SQL migrations plus seed data | US-12 through US-15 |
| DEL-06 | Automated tests | At least three unit or feature tests for critical logic | US-22 |
| DEL-07 | Repository handoff | Private GitHub repo named `Guised Up-assessment-[yourname]` with full code | US-36 |
| DEL-08 | Setup package | Clear README with setup/run instructions and `.env.example` | US-37 |
| DEL-09 | Explanation video | Demonstration of the built app with feature explanations | US-38 |
| DEL-10 | Final submission message | Repository link plus TSD link sent to founder | US-39 |

## 4. Roadmap

### Phase 0 — Guardrails and delivery setup

#### US-00 — Preserve the assessment constraints

As the candidate, I want the work bounded by the assessment rules so that the submission remains eligible.

Acceptance criteria:

- Plan and execute within one full day / 8 hours.
- Use AI agentic tools; not using them is explicitly a red flag.
- Use AI agentic tools to move fast, with the original PDF setting an 80%+ efficiency expectation.
- Do not share the project with anyone else; treat it as confidential.
- Do not plagiarize; the work must demonstrate understanding rather than copied boilerplate.
- Use no more than one clarifying question to the founder.
- If a clarifying question is necessary, use only an assessment-authorized channel.
- If blocked, the original PDF permits DM to the founder on LinkedIn or WhatsApp at the number from which the assessment was received.
- Any libraries, frameworks, or normal development tools may be used.
- If incomplete, submit the partial work and identify in README what ran out of time.

Deliverable impact: protects DEL-01 through DEL-10 and prevents disqualification.

Status and evidence:

- Status: Active guardrail; documentation evidence recorded, submission behavior not complete.
- Evidence: `Assignment.md`, the original PDF, `AGENTS.md`, `docs/governance.md`, `docs/TSD.md`, and `docs/ai-usage.md` document the 8-hour constraint, AI-agentic usage requirement, 80%+ efficiency expectation, confidentiality, plagiarism prohibition, clarifying-question limit, allowed LinkedIn/WhatsApp blocker contact, normal-tool allowance, and partial-submission disclosure rule.
- Implementation status: Not implemented; not runtime-verified.

### Phase 1 — Technical Solution Document before code

#### US-01 — Explain the product and non-engagement ranking goal

As a reviewer, I want the TSD to show accurate product comprehension so that I can see the solution is designed for authentic connection rather than engagement maximization.

Acceptance criteria:

- State that the feature is a personalized `Real Connections` feed.
- State that the product avoids curated highlight reels and follower-count anxiety.
- State that likes, shares, and comments must not be used as engagement-ranking metrics.
- Describe the product goal from `Assignment.md`: personalized ranking based on authenticity signals, relationship depth, semantic similarity, and time decay.
- Explain that natural-language search must return semantic rather than keyword matches.

Completes part of DEL-01.

Status and evidence:

- Status: Documentation complete for this story.
- Evidence: `docs/TSD.md` sections 4, 6, 17, 22, and 32 document the Real Connections objective, non-engagement ranking, Assignment.md product goal, and semantic rather than keyword search. The original PDF additionally frames the product as no curated highlight reels and no follower-count anxiety.
- Implementation status: Not implemented; not runtime-verified.

#### US-02 — Document the system architecture

As a senior engineer, I want a system architecture diagram so that service responsibilities and data flow are clear.

Acceptance criteria:

- Include a system architecture diagram; ASCII or diagram.io quality is acceptable.
- Show React Native, Laravel PHP, Python where used, SQL, and the vector database.
- Show the paths for post creation/embedding, personalized feed retrieval, semantic search, and interaction logging.

Completes the architecture section of DEL-01.

Status and evidence:

- Status: Documentation complete for this story.
- Evidence: `docs/TSD.md` section 7 and `docs/architecture.md` document the system architecture and flows for post creation/embedding, feed retrieval, semantic search, and interaction logging.
- Implementation status: Not implemented; not runtime-verified.

#### US-03 — Document the database schema

As a backend engineer, I want the database design documented so that tables, relationships, and performance characteristics are reproducible.

Acceptance criteria:

- Identify all required tables.
- Define their relationships.
- Define indexes.
- Keep the design consistent with the migrations and all four SQL challenge queries.

Completes the database section of DEL-01 and supports DEL-05.

Status and evidence:

- Status: Documentation complete for this story.
- Evidence: `docs/TSD.md` sections 9 and 10 document tables, relationships, indexes, and SQL challenge support.
- Implementation status: Documentation complete. Migrations now exist and were runtime-verified in the backend foundation audit; SQL challenge queries now exist in `sql/queries.sql` and were PostgreSQL-verified.

#### US-04 — Document embeddings and vector storage

As a reviewer, I want the embedding strategy and vector database choice explained so that semantic feed and search behavior are credible.

Acceptance criteria:

- Explain how post embeddings are generated and stored.
- Name the selected vector database and explain why it was chosen.
- Choose from or otherwise satisfy the permitted vector approach: Pinecone, Weaviate, pgvector, Qdrant, or Chroma.
- Name the embedding approach: OpenAI, sentence-transformers, another open model, or a simple hash mock.
- If API credits prevent real integration, clearly describe the mock and the real implementation swap.

Completes the vector section of DEL-01 and defines DEL-02 behavior.

Status and evidence:

- Status: Documentation complete for this story.
- Evidence: `docs/TSD.md` sections 11 through 14 and `docs/decisions/ADR-001-pgvector.md` document embedding generation, pgvector selection, `sentence-transformers/all-MiniLM-L6-v2`, 384 dimensions, deterministic fallback, and limitations.
- Implementation status: Documentation complete. pgvector storage and deterministic fallback are implemented and tested; actual transformer model execution remains unverified.

#### US-05 — Document the API contract and authentication

As a mobile engineer, I want stable API contracts so that the Feed Screen can integrate predictably.

Acceptance criteria:

- Document all required endpoints.
- Document request and response shapes.
- Document the authentication strategy using Laravel Sanctum token-based authentication.
- Cover post creation, feed pagination, search, and interaction logging.

Completes the API section of DEL-01.

Status and evidence:

- Status: Documentation complete for this story.
- Evidence: `docs/TSD.md` sections 15 and 16 document all required endpoints, request/response shapes, Sanctum authentication, post creation, feed pagination, search, and interaction logging.
- Implementation status: Documentation complete. `POST /api/posts`, `GET /api/feed`, `GET /api/search`, and `POST /api/interactions` are implemented and tested.

#### US-06 — Specify the feed-ranking algorithm

As a user, I want feed ranking based on authentic relevance so that meaningful content surfaces without engagement anxiety.

Acceptance criteria:

- Explain the algorithm in plain English first.
- Follow it with pseudocode.
- Rank with all four required signals: authenticity, relationship depth, semantic similarity, and time decay.
- Authenticity favors fewer filters, less-polished images, and genuine text.
- Relationship depth favors people the user genuinely interacts with, not merely follows.
- Semantic similarity uses vector embeddings to understand topics the user cares about.
- Time decay prefers newer content without overriding relevance.
- Do not rank by likes, shares, or comments as engagement metrics.

Completes the ranking section of DEL-01 and defines US-18.

Status and evidence:

- Status: Documentation complete for this story.
- Evidence: `docs/TSD.md` sections 17 through 21 and `docs/features/feed-ranking.md` document plain-English ranking, pseudocode, all four signals, exact weights, normalization, exclusions, cold start, and stable ordering.
- Implementation status: Not implemented; not runtime-verified.

#### US-07 — Record AI-agentic tool usage honestly

As a reviewer, I want evidence of the AI-augmented workflow so that I can evaluate whether the candidate used tools intelligently and moved quickly.

Acceptance criteria:

- Name the AI agentic tools actually used, such as Cursor, GitHub Copilot, Claude, or equivalent.
- Explain truthfully how each tool helped.
- Preserve enough evidence to support the claimed workflow.
- Do not claim tools that were not used.

Completes the AI tooling section of DEL-01 and supports the 15% AI Tool Usage score.

Status and evidence:

- Status: Documentation complete for verified usage so far.
- Evidence: `docs/TSD.md` section 28 and `docs/ai-usage.md` record Codex usage for traceability, governance, architecture documentation, TSD drafting, feature-specification drafting, documentation consistency review, roadmap evidence synchronization, Laravel foundation implementation, PostgreSQL/pgvector schema implementation, Python embedding-service implementation, endpoint implementation, automated-test creation, and documentation synchronization.
- Implementation status: Backend foundation implementation and runtime testing are now claimed only where direct evidence is listed. Deployment and video generation are not claimed.

#### US-08 — Record trade-offs and assumptions

As a senior engineer, I want explicit trade-offs and assumptions so that open-ended decisions can be evaluated fairly.

Acceptance criteria:

- Identify all meaningful trade-offs.
- Identify all assumptions.
- Explain any mocked vector integration and intended production replacement.
- Keep the TSD as long as necessary and no longer.
- Finish the TSD before writing code, as explicitly required by the brief.
- Publish it as PDF, a Notion page, or Markdown in the repository.

Completes DEL-01.

Status and evidence:

- Status: Documentation complete for this story.
- Evidence: `docs/TSD.md` sections 13, 14, and 29 through 33 document fallback behavior, intended replacement, trade-offs, assumptions, known limitations, TSD placement, and deferred implementation.
- Implementation status: TSD was created before application code. Backend foundation implementation and runtime verification now exist where direct evidence is listed; deferred features remain unimplemented.

### Phase 2 — Data foundation, authentication, and backend

#### US-09 — Establish the prescribed backend responsibilities

As a developer, I want Laravel to own the main API and Python to handle optional ML/embedding work so that the implementation matches the prescribed stack.

Acceptance criteria:

- Laravel PHP is the main API layer.
- Python is used only as needed for ML/embedding tasks.
- The backend uses MySQL or PostgreSQL.
- A vector database is integrated or clearly mocked under the permitted fallback.

Contributes to DEL-02.

Status and evidence:

- Status: Backend foundation implemented and partially runtime-verified for this story.
- Evidence: `api/` implements Laravel as the main API layer; `embedding-service/` implements Python-only embedding/authenticity work; `docker-compose.yml` configures PostgreSQL 16 with `pgvector/pgvector:pg16`; `api/database/migrations/2026_07_22_000000_enable_pgvector_extension.php` enables pgvector; `embedding-service/app/core.py` implements deterministic fallback.
- Verification: Docker images built; Laravel feature tests passed; Python tests passed; PostgreSQL migrations ran with `vector` extension confirmed. No PostgreSQL-backed HTTP post/feed request has been end-to-end verified yet.

#### US-10 — Authenticate API clients with Sanctum

As an API client, I want token-based authentication so that user-specific operations are protected.

Acceptance criteria:

- Configure Laravel Sanctum token authentication.
- Protect endpoints that require an authenticated user, including the personalized feed.
- Return appropriate unauthenticated responses for invalid or absent tokens.

Contributes to DEL-02.

Status and evidence:

- Status: Implemented for `POST /api/posts`, `GET /api/feed`, `GET /api/search`, and `POST /api/interactions`.
- Evidence: `api/routes/api.php` protects `POST /api/posts`, `GET /api/feed`, `GET /api/search`, and `POST /api/interactions` with `auth:sanctum`; `api/app/Http/Controllers/AuthTokenController.php` provides a local token helper; `api/tests/Feature/PostCreationTest.php`, `api/tests/Feature/FeedRankingTest.php`, `api/tests/Feature/SearchTest.php`, and `api/tests/Feature/InteractionCreationTest.php` verify `401` for unauthenticated implemented endpoints.
- Verification: Laravel feature tests passed: 24 tests, 74 assertions.

#### US-11 — Seed test identities

As a reviewer, I want ready-to-use users so that personalized behavior can be evaluated quickly.

Acceptance criteria:

- Seed at least two test users.
- Document usable test credentials or token-generation steps without committing real secrets.

Contributes to DEL-02 and DEL-05.

Status and evidence:

- Status: Implemented and documented; migration/seed command is documented, but seeded login flow was not separately exercised through HTTP in this step.
- Evidence: `api/database/seeders/DatabaseSeeder.php` creates two test users; `README.md` documents test credentials and token-generation steps without real secrets.

#### US-12 — Create reproducible migrations

As a reviewer, I want database migrations so that the schema can be recreated reliably.

Acceptance criteria:

- Include all migrations needed by posts, interactions, users, ranking, and chosen vector storage integration.
- Migrations reproduce the documented schema from a clean database.
- Missing migrations or an unreproducible schema is treated as an instant disqualifier.

Completes the migration portion of DEL-05.

Status and evidence:

- Status: Implemented and runtime-verified for backend foundation schema.
- Evidence: `api/database/migrations/0001_01_01_000000_create_users_table.php`, `0001_01_01_000001_create_personal_access_tokens_table.php`, `2026_07_22_000000_enable_pgvector_extension.php`, `2026_07_22_000100_create_posts_table.php`, and `2026_07_22_000200_create_interactions_table.php`.
- Verification: `php artisan migrate --force` ran successfully against the Docker PostgreSQL 16 pgvector service; `vector` extension was confirmed.

#### US-13 — Model posts

As an author, I want posts to retain content and authorship so that they can be embedded, ranked, searched, and displayed.

Acceptance criteria:

- Store author, text, optional image URL, and creation time.
- Support the authenticity, semantic-similarity, and time-decay data required by the documented ranking approach.
- Keep fields and indexes aligned with TSD and SQL queries.

Contributes to DEL-02 and DEL-05.

Status and evidence:

- Status: Implemented and tested for post creation persistence; feed and search use are now implemented separately in US-18 and US-19.
- Evidence: `api/app/Models/Post.php`, `api/database/migrations/2026_07_22_000100_create_posts_table.php`, `api/app/Http/Controllers/PostController.php`, and `api/tests/Feature/PostCreationTest.php`.
- Verification: Laravel post-creation feature tests passed.

#### US-14 — Model interactions and relationship depth

As a user, I want genuine interactions captured so that the feed can prioritize deeper relationships.

Acceptance criteria:

- Store views, replies, and reactions against a post and acting user.
- Retain enough information to calculate relationship depth between users.
- Support time-bounded aggregation for the SQL challenge.
- Do not reinterpret raw engagement totals as the prohibited global engagement-ranking signal.

Contributes to DEL-02 and DEL-05.

Status and evidence:

- Status: Implemented and tested for raw interaction persistence; relationship-depth scoring is implemented in feed ranking and raw SQL reporting use is verified by the SQL challenge.
- Evidence: `api/app/Models/Interaction.php`, `api/database/migrations/2026_07_22_000200_create_interactions_table.php`, `api/app/Http/Controllers/InteractionController.php`, and `api/tests/Feature/InteractionCreationTest.php`.
- Verification: Laravel interaction feature tests passed, including repeated raw interaction preservation.

#### US-15 — Add indexes and relationships

As an operator, I want efficient relational access so that feed, interaction, and SQL challenge queries remain practical.

Acceptance criteria:

- Enforce the relationships documented in the TSD.
- Add the documented indexes needed by author/time, interaction type/time, relationship aggregation, and lookup paths.

Completes DEL-05.

Status and evidence:

- Status: Implemented and migration-verified for documented backend foundation indexes and relationships.
- Evidence: `api/database/migrations/2026_07_22_000100_create_posts_table.php` and `2026_07_22_000200_create_interactions_table.php` define foreign keys and required indexes; `api/app/Models/User.php`, `Post.php`, and `Interaction.php` define Eloquent relationships.
- Verification: PostgreSQL migrations ran successfully with pgvector enabled.

#### US-16 — Create posts and embeddings

As an authenticated user, I want to create a post so that it becomes available to semantic feed and search features.

Acceptance criteria:

- Implement `POST /api/posts`.
- Accept text and an optional image URL.
- Validate the request.
- Automatically generate a vector embedding for the post content.
- Store the post and its embedding/vector reference.
- Return the documented response shape.

Contributes to DEL-02.

Status and evidence:

- Status: Implemented and tested.
- Evidence: `api/routes/api.php`, `api/app/Http/Controllers/PostController.php`, `api/app/Http/Requests/StorePostRequest.php`, `api/app/Http/Resources/PostResource.php`, `api/app/Services/HttpEmbeddingClient.php`, and `api/tests/Feature/PostCreationTest.php`.
- Verification: Laravel post-creation feature tests passed, including auth rejection, validation, successful persistence, malformed embedding rejection, and service-failure handling without partial persistence.

#### US-17 — Generate and persist embeddings reliably

As the feed system, I want a consistent embedding lifecycle so that new content can be compared semantically.

Acceptance criteria:

- Use the model and vector database described in the TSD.
- Keep vector dimensions, identifiers, and metadata consistent.
- Make failure behavior explicit.
- If mocked due to missing API credits, clearly label the mock and keep the intended real swap documented.

Contributes to DEL-02.

Status and evidence:

- Status: Implemented and tested for deterministic fallback and validated embedding-client behavior; actual transformer model execution is configured but not verified.
- Evidence: `embedding-service/app/core.py`, `embedding-service/app/main.py`, `api/app/Services/HttpEmbeddingClient.php`, `api/app/Services/PgVector.php`, `embedding-service/tests/test_core.py`, `embedding-service/tests/test_api.py`, and `api/tests/Feature/PostCreationTest.php`.
- Verification: Python tests passed: 9 tests. Laravel tests passed: 10 tests, 33 assertions. Tests use fallback or mocks and do not download the transformer model.

#### US-18 — Return a personalized ranked feed

As an authenticated user, I want a personalized feed so that authentic, relationally meaningful, relevant, and reasonably recent posts surface first.

Acceptance criteria:

- Implement `GET /api/feed`.
- Use the ranking algorithm from the TSD without material deviation.
- Combine authenticity, relationship depth, semantic similarity, and time decay.
- Do not use likes, shares, or comments as global engagement-ranking metrics.
- Return exactly 20 results per page when a full page is available.
- Return pagination metadata/links in the documented shape.
- Produce stable behavior across pages.

Contributes to DEL-02.

Status and evidence:

- Status: Implemented and tested.
- Evidence: `api/routes/api.php`, `api/app/Http/Controllers/FeedController.php`, `api/app/Http/Requests/FeedRequest.php`, `api/config/feed.php`, `api/app/Services/Feed/FeedCandidateRepository.php`, `api/app/Services/Feed/EloquentFeedCandidateRepository.php`, `api/app/Services/Feed/FeedRanker.php`, `api/app/Services/Feed/WeightedFeedRanker.php`, `api/app/Services/Feed/FeedScore.php`, `api/app/Services/Feed/VectorMath.php`, and `api/tests/Feature/FeedRankingTest.php`.
- Verification: Laravel feature tests passed: 24 tests, 74 assertions. `php artisan route:list` shows `GET|HEAD api/feed`. Tests verify unauthenticated rejection, 20-post page size, pagination metadata, authenticity signal ordering, authenticated-user relationship-depth ordering, semantic-similarity ordering, time-decay ordering, and stable ordering.

#### US-19 — Search posts with natural language

As a user, I want to search conversationally so that I can find meaningfully related posts without exact keywords.

Acceptance criteria:

- Implement `GET /api/search?q={query}`.
- Embed the natural-language query and use vector similarity rather than keyword matching.
- Return the top 10 semantically relevant posts.
- Preserve the original PDF example: `funny travel stories from last week` should return semantically relevant posts rather than keyword matches, with temporal intent handled by a documented date filter.
- Validate empty or invalid queries and return the documented response shape.

Contributes to DEL-02.

Status and evidence:

- Status: Implemented and tested.
- Evidence: `api/routes/api.php`, `api/config/search.php`, `api/app/Http/Controllers/SearchController.php`, `api/app/Http/Requests/SearchRequest.php`, `api/app/Http/Resources/SearchResultResource.php`, `api/app/Services/Search/PostSearch.php`, `api/app/Services/Search/EmbeddingPostSearch.php`, `api/app/Services/Search/SearchCandidateRepository.php`, `api/app/Services/Search/EloquentSearchCandidateRepository.php`, `api/app/Services/Search/SearchSimilarityCalculator.php`, `api/app/Services/Search/CosineSearchSimilarityCalculator.php`, `api/app/Services/Search/TemporalIntentParser.php`, `api/app/Services/Search/SimpleTemporalIntentParser.php`, `api/app/Services/Search/SearchIntent.php`, `api/app/Services/Search/SearchResults.php`, and `api/tests/Feature/SearchTest.php`.
- Verification: Laravel feature tests passed: 24 tests, 74 assertions. `php artisan route:list` shows `GET|HEAD api/search`. Search tests verify unauthenticated rejection, query validation, semantic vector ranking order, maximum 10 results, empty results, embedding-service failure behavior, and `funny travel stories from last week` temporal handling with a trailing seven-day date filter. PostgreSQL pgvector execution was verified with a rolled-back `posts.embedding <=> query_vector` query returning similarity score `1` for an identical vector.

#### US-20 — Log feed interactions

As a user, I want my meaningful activity recorded so that future relationship-depth ranking can improve.

Acceptance criteria:

- Implement `POST /api/interactions`.
- Accept only the required interaction types: view, reply, or reaction.
- Associate the authenticated user and target post.
- Persist the event for relationship-depth calculations and SQL reporting.
- Return the documented response shape and validation errors.

Contributes to DEL-02.

Status and evidence:

- Status: Implemented and tested for raw event logging; feed consumption integration remains deferred with the mobile and feed work.
- Evidence: `api/routes/api.php`, `api/app/Http/Controllers/InteractionController.php`, `api/app/Http/Requests/StoreInteractionRequest.php`, `api/app/Http/Resources/InteractionResource.php`, and `api/tests/Feature/InteractionCreationTest.php`.
- Verification: Laravel interaction feature tests passed for unauthenticated rejection, invalid type rejection, valid persistence, missing post rejection, and repeated raw interaction preservation.

#### US-21 — Keep backend architecture clean

As a reviewer, I want maintainable backend boundaries so that the solution demonstrates production-oriented engineering rather than endpoint-only code.

Acceptance criteria:

- Keep controllers, validation, ranking logic, embedding/vector integration, and persistence responsibilities clearly separated.
- Ensure implementation matches the TSD, schema, and API contracts.
- Handle dependency failures and invalid input deliberately.

Contributes to DEL-02 and the 25% Backend Quality score.

Status and evidence:

- Status: Implemented for current backend and SQL scope; mobile, deployment, final submission, and video remain deferred.
- Evidence: Controllers delegate validation to form requests; embedding work uses `EmbeddingClient`; feed ranking uses `FeedCandidateRepository` and `FeedRanker`; search uses `PostSearch`, `SearchCandidateRepository`, `SearchSimilarityCalculator`, and `TemporalIntentParser`; ranking and search limits live in configuration; response resources keep API output separate; migrations and models preserve persistence boundaries.
- Verification: Laravel and Python tests passed for implemented behavior.

#### US-22 — Test the most critical logic

As a reviewer, I want automated tests so that essential behavior is demonstrably correct.

Acceptance criteria:

- Include at least three unit or feature tests.
- Cover the most critical logic, prioritizing ranking, semantic search/embedding integration, authenticated post/feed behavior, or interaction logging.
- Make tests reproducible from the README instructions.

Completes DEL-06 and contributes to DEL-02.

Status and evidence:

- Status: Implemented for post, feed, semantic-search, interaction, and embedding-service scope; mobile tests remain deferred.
- Evidence: `api/tests/Feature/PostCreationTest.php`, `api/tests/Feature/FeedRankingTest.php`, `api/tests/Feature/SearchTest.php`, `api/tests/Feature/InteractionCreationTest.php`, `embedding-service/tests/test_core.py`, and `embedding-service/tests/test_api.py`.
- Verification: Laravel feature tests passed: 24 tests, 74 assertions. Python tests passed: 9 tests.

#### US-23 — Validate backend reproducibility

As a reviewer, I want a clean-start verification so that the API can be evaluated without hidden local state.

Acceptance criteria:

- From documented setup, install dependencies, configure environment, migrate, seed, authenticate, and exercise all four endpoints.
- Confirm pagination is 20 per page and search returns at most/top 10 as required.
- Confirm embeddings are stored or the mock is explicit.

Completes DEL-02 when US-09 through US-22 are also accepted.

Status and evidence:

- Status: Partially verified. Docker builds, migrations, post/feed/search/interaction endpoints, route registration, and tests were verified. Full clean-start verification from a fresh checkout and full Docker HTTP exercise of all endpoints remain outstanding.
- Evidence: `docker-compose.yml`, `api/Dockerfile`, `embedding-service/Dockerfile`, `.env.example`, and `README.md`.
- Verification: Docker images built; PostgreSQL 16 pgvector service migrated successfully; `vector` extension confirmed. `GET /api/feed` and `GET /api/search` are implemented and route-verified. PostgreSQL pgvector execution was verified with a rolled-back `posts.embedding <=> query_vector` query.

### Phase 3 — React Native Feed Screen

#### US-24 — Fetch and display the feed

As an authenticated mobile user, I want to see my personalized feed so that I can consume relevant posts.

Acceptance criteria:

- Build a single React Native Feed Screen.
- Fetch data from `GET /api/feed`.
- Display returned posts using the documented API shape.

Contributes to DEL-03.

Status and evidence:

- Status: Implemented and statically verified; simulator/device behavior not verified.
- Evidence: `mobile/src/screens/FeedScreen.tsx`, `mobile/src/hooks/useFeedController.ts`, `mobile/src/api/client.ts`, `mobile/src/api/types.ts`, and `mobile/App.tsx`.
- Verification: `npm run typecheck` passed. Expo startup reached Metro at `exp://127.0.0.1:8091`.

#### US-25 — Present complete post cards

As a feed user, I want each post presented with useful context and an interaction affordance.

Acceptance criteria:

- Every card shows an avatar placeholder.
- Every card shows the username.
- Every card shows post text.
- Every card shows relative time (`time ago`).
- Every card shows a reaction button.

Contributes to DEL-03.

Status and evidence:

- Status: Implemented and statically verified; simulator/device behavior not verified.
- Evidence: `mobile/src/components/PostCard.tsx`, `mobile/src/utils/time.ts`, and `mobile/src/theme/tokens.ts` render an avatar placeholder, username, post text, relative time, and reaction button.
- Verification: `npm run typecheck` passed.

#### US-26 — React from the feed

As a user, I want the reaction control to work so that my interaction can be logged.

Acceptance criteria:

- The reaction button invokes `POST /api/interactions` with a reaction for the selected post.
- Provide clear pending, success, and failure feedback consistent with the screen design.

Contributes to DEL-03 and exercises DEL-02.

Status and evidence:

- Status: Implemented and statically verified; backend interaction endpoint was previously tested, but simulator/device behavior was not verified.
- Evidence: `mobile/src/components/PostCard.tsx`, `mobile/src/hooks/useFeedController.ts`, and `mobile/src/api/client.ts`; reactions go through `ApiClient.reactToPost` and send `type = reaction`.
- Verification: `npm run typecheck` passed.

#### US-27 — Load additional feed pages

As a user, I want infinite scroll so that I can continue browsing without manual pagination controls.

Acceptance criteria:

- Load the next feed page when the user reaches the bottom.
- Append rather than replace existing posts.
- Prevent duplicate concurrent requests and duplicate results.
- Stop requesting when no next page remains.

Contributes to DEL-03.

Status and evidence:

- Status: Implemented and tested at reducer level; simulator/device behavior not verified.
- Evidence: `mobile/src/screens/FeedScreen.tsx`, `mobile/src/hooks/useFeedController.ts`, `mobile/src/state/feedReducer.ts`, and `mobile/tests/feedReducer.test.ts`.
- Verification: `npm test` passed 5 tests, including pagination append without duplicate posts and next-page metadata handling.

#### US-28 — Search inline from the Feed Screen

As a user, I want a search bar within the feed so that natural-language results appear without leaving the screen.

Acceptance criteria:

- Place the search bar at the top.
- Call `GET /api/search` with the user's query.
- Show the returned results inline.
- Restore or clearly transition back to the personalized feed when search is cleared.

Contributes to DEL-03.

Status and evidence:

- Status: Implemented and tested at reducer level; simulator/device behavior not verified.
- Evidence: `mobile/src/screens/FeedScreen.tsx`, `mobile/src/hooks/useFeedController.ts`, `mobile/src/api/client.ts`, `mobile/src/state/feedReducer.ts`, and `mobile/tests/feedReducer.test.ts`.
- Verification: `npm test` passed 5 tests, including search-mode switching and clearing back to feed mode.

#### US-29 — Handle screen states gracefully

As a user, I want clear feedback so that loading and failures never leave the screen confusing or broken.

Acceptance criteria:

- Handle initial loading.
- Handle pagination/search loading.
- Handle an empty feed and empty search results.
- Handle feed, search, and interaction errors gracefully.
- Provide a reasonable retry path where appropriate.

Contributes to DEL-03.

Status and evidence:

- Status: Implemented and partially tested through reducer checks; simulator/device behavior not verified.
- Evidence: `mobile/src/screens/FeedScreen.tsx`, `mobile/src/hooks/useFeedController.ts`, and `mobile/src/state/feedReducer.ts` handle initial loading, pagination loading, search loading, empty states, recoverable errors, and retry.
- Verification: `npm run typecheck` passed. `npm test` passed 5 tests, including recoverable error handling.

#### US-30 — Deliver intentional UI quality

As a user, I want a considered visual experience so that the screen feels like a real product.

Acceptance criteria:

- Use intentional spacing, typography, color, hierarchy, cards, and feedback states.
- Do not use untouched/default React Native styles.
- The UI need not be pixel-perfect but must feel intentional.

Completes DEL-03 and supports the 20% React Native Screen score.

Status and evidence:

- Status: Implemented and statically verified; visual quality was not inspected on simulator/device.
- Evidence: `mobile/src/theme/tokens.ts`, `mobile/src/screens/FeedScreen.tsx`, and `mobile/src/components/PostCard.tsx` define and use custom colors, spacing, typography, borders, cards, loading, empty, and error states.
- Verification: `npm run typecheck` passed and Expo startup reached Metro at `exp://127.0.0.1:8091`.

### Phase 4 — Raw SQL challenge

#### US-31 — Write D1: most active users

As an analyst, I want the top 10 most active users in the last 7 days so that recent interaction activity can be ranked.

Acceptance criteria:

- Use raw SQL.
- Write queries for correctness, efficiency, and readability because the original PDF says they will be run against a real database.
- Count total interactions as views + replies + reactions.
- Limit activity to the last 7 days.
- Rank by total interactions.
- Return the top 10 users.

Contributes to DEL-04.

Status and evidence:

- Status: Implemented and PostgreSQL-verified.
- Evidence: `sql/queries.sql` D1.
- Verification: Executed against Docker PostgreSQL with rolled-back fixtures. Result returned the two within-window fixture users, ordered by `total_activity DESC` with deterministic tie resolution; the user with 20 interactions outside seven days was excluded. `EXPLAIN` was run.

#### US-32 — Write D2: posts from strongest relationships

As an analyst, I want recent posts from the people a given user interacts with most so that relationship depth can be inspected.

Acceptance criteria:

- Accept or clearly mark a `user_id` parameter.
- Write queries for correctness, efficiency, and readability because the original PDF says they will be run against a real database.
- Calculate which users that user interacts with most.
- Return all posts by those users from the last 30 days.
- Order by interaction frequency descending.

Contributes to DEL-04.

Status and evidence:

- Status: Implemented and PostgreSQL-verified.
- Evidence: `sql/queries.sql` D2.
- Verification: Executed with `-v user_id=900001` against Docker PostgreSQL with rolled-back fixtures. Result returned posts by authors the supplied user interacted with, ordered by interaction frequency and deterministic tie rules; the author post outside 30 days was excluded. `EXPLAIN` was run and showed use of `interactions_user_id_post_id_type_index`, `posts_pkey`, `posts_user_id_created_at_index`, and `users_pkey`.

#### US-33 — Write D3: high-view, zero-reaction posts

As an analyst, I want posts with many views and no reactions so that content behavior can be examined.

Acceptance criteria:

- Find posts viewed more than 100 times.
- Write queries for correctness, efficiency, and readability because the original PDF says they will be run against a real database.
- Require zero reactions.
- Return `post_id`, `author_id`, `view_count`, and `created_at`.

Contributes to DEL-04.

Status and evidence:

- Status: Implemented and PostgreSQL-verified.
- Evidence: `sql/queries.sql` D3.
- Verification: Executed against Docker PostgreSQL with rolled-back fixtures. Result returned only the 101-view, zero-reaction fixture post; the exactly-100-view post and the post with a reaction were excluded. `EXPLAIN` was run.

#### US-34 — Write D4: potential posting spam

As a trust-and-safety reviewer, I want users posting excessively so that potential spam can be investigated.

Acceptance criteria:

- Find users with more than 20 posts in the last 24 hours.
- Write queries for correctness, efficiency, and readability because the original PDF says they will be run against a real database.
- Return their email and post count.

Completes DEL-04 when all four queries are placed in `/sql/queries.sql`; supports the 15% SQL score.

Status and evidence:

- Status: Implemented and PostgreSQL-verified.
- Evidence: `sql/queries.sql` D4.
- Verification: Executed against Docker PostgreSQL with rolled-back fixtures. Result returned only the user with 21 posts in the last 24 hours; the exactly-20-post user and the user with 21 posts older than 24 hours were excluded. `EXPLAIN` was run and showed use of `posts_created_at_index`.

### Phase 5 — Documentation, evidence, and submission

#### US-35 — Finalize and place the TSD

As a reviewer, I want the solution document easy to locate so that architecture and decisions can be assessed alongside the code.

Acceptance criteria:

- Place the TSD at `/docs/TSD.pdf` or `/docs/TSD.md`, or put a Notion link in README.
- Ensure it contains every section in US-01 through US-08.
- Confirm it reflects the implementation and calls out any divergence.
- Do not submit without a TSD; absence is an instant disqualifier.

Completes DEL-01.

#### US-36 — Create and populate the private repository

As the founder, I want one private repository so that the complete confidential assessment can be reviewed.

Acceptance criteria:

- Create a private GitHub repository named `Guised Up-assessment-[yourname]`.
- Push the full codebase.
- Include TSD, SQL file, migrations, tests, README, and `.env.example`.
- Do not expose secrets or confidential material publicly.

Completes DEL-07.

#### US-37 — Provide reproducible setup and run instructions

As a reviewer, I want a clear README and environment template so that I can run the project efficiently.

Acceptance criteria:

- Include clear setup instructions.
- Include clear run instructions for backend, Python/embedding component if present, database/vector store, and React Native app.
- Include `.env.example`.
- Explain authentication/test-user setup.
- Explain how to run migrations, seeds, and tests.
- If partial, explain exactly what ran out of time and what remains incomplete.
- Link the TSD if it is a Notion page and make the link accessible to the reviewer.

Completes DEL-08.

#### US-38 — Record the explanation video

As a reviewer, I want an explanatory demonstration so that I can see the end product and understand its features.

Acceptance criteria:

- Make a video of the app that was built.
- Demonstrate and explain the implemented features, including feed, post card/reaction, infinite scrolling, inline search, and relevant states.
- Explain backend/vector/ranking behavior at an appropriate level.
- Clearly distinguish completed features, mocks, and incomplete work.
- Verify the video is accessible before submission.
- No explanation video is an instant disqualifier.

Completes DEL-09.

#### US-39 — Send the final submission

As the founder, I want a clearly identified submission so that I can access and review it.

Acceptance criteria:

- Send the private GitHub repository link and TSD link.
- Send through LinkedIn DM or the email address from which the assessment was received.
- Use the subject line `[Guised Up Application] Your Name — Full-Stack Assessment` when a subject line is available.
- Include or link the explanation video.
- Verify reviewer access to every private or linked artifact.

Completes DEL-10.

## 5. Recommended 8-hour execution order

This sequencing does not add requirements; it orders the frozen requirements to satisfy the explicit TSD-before-code rule and reduce disqualification risk.

| Timebox | Stories | Exit condition |
|---|---|---|
| 0:00–1:15 | US-00 through US-08 | Complete TSD first, including diagram, schema, API, ranking, AI usage, trade-offs |
| 1:15–2:15 | US-09 through US-15 | Laravel/DB/auth foundation, migrations, indexes, two users seeded |
| 2:15–4:15 | US-16 through US-23 | Four endpoints, ranking, embeddings/vector path, at least three tests |
| 4:15–5:45 | US-24 through US-30 | Functional and intentionally styled Feed Screen with infinite scroll and inline search |
| 5:45–6:20 | US-31 through US-34 | Four raw queries saved in `/sql/queries.sql` |
| 6:20–7:00 | US-35 through US-37 | TSD reconciled, private repo populated, README and `.env.example` complete |
| 7:00–7:35 | US-38 | Record and verify explanation video |
| 7:35–8:00 | US-39 plus final audit | Verify access, links, clean setup, tests, and send submission |

## 6. Evaluation traceability

| Scored dimension | Weight | Primary stories |
|---|---:|---|
| Technical Solution Document | 25% | US-01 through US-08, US-35 |
| Backend Quality | 25% | US-09 through US-23 |
| React Native Screen | 20% | US-24 through US-30 |
| SQL Queries | 15% | US-31 through US-34 |
| AI Tool Usage | 15% | US-00, US-07, with honest evidence throughout |

## 7. Final no-deviation gate

Before submission, every answer below must be yes or explicitly disclosed as incomplete in README:

- Was the TSD produced before code and does it include every required section?
- Does the implementation use all four ranking signals and avoid engagement-metric ranking?
- Do all four exact endpoints exist with the required behavior?
- Is Sanctum token authentication configured and are at least two test users seeded?
- Is the SQL database MySQL or PostgreSQL, with complete reproducible migrations?
- Is a permitted vector database integrated, or is a clearly documented fallback mock used?
- Are embeddings generated automatically for new posts?
- Are there at least three critical unit or feature tests?
- Does the one Feed Screen meet every content, infinite-scroll, inline-search, state, and styling requirement?
- Are D1–D4 correct raw SQL and stored at `/sql/queries.sql`?
- Is the full code in the correctly named private repository?
- Does README contain setup, run instructions, and `.env.example`, plus any partial-work disclosure?
- Is the TSD present at an accepted location or linked from README?
- Has an accessible explanation video been created?
- Are the repository and TSD links ready to send through an allowed channel with the required subject line?
- Is the work confidential, non-plagiarized, and supported by honest AI-tool evidence?

Instant-disqualification gate:

- TSD must be present.
- Submission must not be copy-pasted boilerplate without evidence of understanding.
- Migrations must be present and the database schema reproducible.
- Explanation video must be present.
- Work must not be plagiarized.
