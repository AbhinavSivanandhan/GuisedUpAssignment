# Guised Up Real Connections Feed

This repository is a take-home assessment implementation in progress. The current repository implements the Laravel API base, PostgreSQL/pgvector schema, Sanctum-protected post creation, personalized feed retrieval, semantic search, interaction creation, raw SQL challenge answers, one Expo React Native feed screen, a Python FastAPI embedding/authenticity service, Docker Compose configuration, and focused tests.

## Implemented In This Foundation

- Laravel API scaffold under `api/`.
- Python FastAPI embedding service under `embedding-service/`.
- Docker Compose services for API, PostgreSQL 16 with pgvector, and embedding service.
- Migrations for `users`, `personal_access_tokens`, `posts`, and `interactions`.
- Sanctum token endpoint: `POST /api/tokens`.
- Protected endpoints: `POST /api/posts`, `GET /api/feed`, `GET /api/search`, and `POST /api/interactions`.
- Raw SQL challenge answers at `sql/queries.sql`.
- Expo React Native feed screen under `mobile/`.
- Deterministic hash embedding fallback for tests and unavailable model downloads.

## Deferred

Hosted deployment, private GitHub publishing, final submission messaging, and explanation video are not implemented yet.

## Prerequisites

- Docker and Docker Compose.
- Optional local Python 3.12+ for running pure Python unit tests without Docker.

Host PHP and Composer are not required when using Docker.

## Setup

Create a local environment file from the example when you want to override the Docker defaults:

```bash
cp .env.example .env
```

For local assessment use, Docker Compose provides non-secret development defaults for PostgreSQL and hydrates the ignored Laravel `api/.env` file at API startup. Keep real secrets out of tracked files.

Start services:

```bash
docker compose up --build
```

If host port `5432` is already allocated, use an alternate host port while keeping the internal database service unchanged:

```bash
DB_PORT_FORWARD=55432 docker compose up --build
```

Run migrations and seed test users:

```bash
docker compose exec api php artisan migrate --seed
```

The PostgreSQL container uses the `pgvector/pgvector:pg16` image. The Laravel migration enables `CREATE EXTENSION IF NOT EXISTS vector` and creates an HNSW cosine index on `posts.embedding`.

## Service Health

Embedding service:

```bash
curl http://localhost:8001/health
```

Laravel health route:

```bash
curl http://localhost:8000/up
```

## Test Users And Token

Seeded local users:

- `alex@example.test` / `password`
- `sam@example.test` / `password`

Create a Sanctum token:

```bash
curl -X POST http://localhost:8000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.test","password":"password","device_name":"local"}'
```

Use the returned token as `Authorization: Bearer <token>`.

## Create A Post

```bash
curl -X POST http://localhost:8000/api/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text":"A grounded post about today","image_url":"https://example.test/photo.jpg"}'
```

The API calls the embedding service automatically, stores a 384-dimensional embedding, stores `embedding_status`, and records explainable authenticity scores. Image authenticity remains `null` unless a real image-analysis signal exists.

## Record An Interaction

```bash
curl -X POST http://localhost:8000/api/interactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"post_id":1,"type":"reaction"}'
```

Allowed interaction types are `view`, `reply`, and `reaction`. Repeated raw interaction events are preserved for future relationship-depth scoring and SQL reporting.

## Fetch The Feed

```bash
curl http://localhost:8000/api/feed?page=1 \
  -H "Authorization: Bearer <token>"
```

The feed returns 20 posts per page when available. Ranking combines normalized authenticity, relationship depth from the authenticated user's interactions, semantic similarity from embeddings, and exponential time decay. Global likes, shares, comments, follower totals, and popularity metrics are not ranking inputs.

## Search Posts

```bash
curl "http://localhost:8000/api/search?q=funny%20travel%20stories%20from%20last%20week" \
  -H "Authorization: Bearer <token>"
```

Search embeds the query through the embedding-service boundary and ranks posts by vector cosine similarity. PostgreSQL uses pgvector for similarity search. SQLite feature tests use a database-independent cosine path behind the same search repository boundary. Results return at most 10 posts with author information, post text, optional image URL, creation time, similarity score, embedding mode, and any parsed temporal filter. The phrase `last week` is currently interpreted as a trailing seven-day `created_at` filter.

## Mobile Feed Screen

The Expo app lives in `mobile/`. Configure the API URL and Sanctum token with Expo public environment variables:

```bash
cd mobile
cp .env.example .env
```

Set `EXPO_PUBLIC_API_BASE_URL` to the Laravel base URL and set `EXPO_PUBLIC_SANCTUM_TOKEN` to a token from `POST /api/tokens`.

Install and run:

```bash
npm install
npm run start -- --localhost
```

The screen fetches `GET /api/feed`, paginates with infinite scroll, renders post cards with avatar placeholder, username, post text, relative time, and reaction button, calls `POST /api/interactions` for reactions, and calls `GET /api/search` from the inline search bar.

## Tests

Laravel tests:

```bash
docker run --rm guisedup-api php artisan test --testsuite=Feature
```

Python tests inside Docker:

```bash
docker run --rm guisedup-embedding-service python -m pytest
```

Pure Python core tests can run locally if Python is available:

```bash
PYTHONPATH=embedding-service python3 -m unittest discover -s embedding-service/tests
```

Mobile checks:

```bash
cd mobile
npm run typecheck
npm test
```

The tests use fallback mode or mocks and do not require downloading `sentence-transformers/all-MiniLM-L6-v2`. The default Docker image installs the FastAPI service and fallback path only. To exercise the transformer path later, install `embedding-service/requirements-optional-transformer.txt` in the embedding-service environment and set `EMBEDDING_MODE=transformer`.

## SQL Challenge

The raw SQL answers live in `sql/queries.sql`.

D2 uses a psql variable for the supplied user id:

```bash
sed -n '1,220p' sql/queries.sql | docker compose exec -T db psql -U guised_up -d guised_up -v user_id=1
```

The queries are PostgreSQL-compatible and use `CURRENT_TIMESTAMP` for relative time windows. They were verified against the Docker PostgreSQL database with representative fixture data inserted inside transactions and rolled back.

## Deterministic Fallback

The fallback uses stable SHA-256 hashing, not Python's randomized `hash()`. It returns exactly 384 finite numeric values and is labeled as `fallback`. It is test/failure infrastructure, not genuine semantic search.

## Verification Status

- Docker images for `api` and `embedding-service` were built successfully.
- Laravel feature tests passed: 24 tests, 74 assertions.
- Python embedding-service tests passed: 9 tests.
- Mobile TypeScript type-check passed.
- Mobile state tests passed: 7 tests.
- Expo start was verified with `npm run start -- --localhost --port 8091`; Metro reached `exp://127.0.0.1:8091`.
- PostgreSQL migration verification against `pgvector/pgvector:pg16` passed with the `vector` extension enabled. Host port 5432 was already allocated locally, so verification used `DB_PORT_FORWARD=55432`.
- Authenticated HTTP smoke testing against the Docker stack passed for token creation, unauthenticated rejection, `POST /api/posts`, `POST /api/interactions`, `GET /api/feed`, `GET /api/search`, validation errors, 384-dimensional embedding persistence, and cleanup of marked smoke records.
- A rolled-back PostgreSQL check executed `posts.embedding <=> query_vector` and returned a similarity score of `1` for an identical 384-dimensional vector.
- `sql/queries.sql` was executed against PostgreSQL with rolled-back fixtures covering the D1 seven-day window, D2 30-day post window, D3 exactly-100-view and reaction exclusions, D4 exactly-20-post and old-post exclusions, and interaction-count ties.

## Known Limitations

- Full clean-start verification from a fresh checkout still has to be repeated in the target environment.
- The transformer model path is configured but optional dependencies and model download are not claimed verified until they are installed and run successfully.
- The semantic search implementation currently supports only a small explicit temporal parser for `last week`; broader natural-language date parsing remains deferred.
- Simulator/device rendering was not verified. Expo Web was attempted but is not available because this minimal native Expo app does not install `react-dom`, `react-native-web`, or `@expo/metro-runtime`.
- `npm install` for the mobile app reported 11 moderate vulnerabilities in the installed dependency tree; no audit fix was applied.
- Deployment and video remain deferred.
