# Guised Up Real Connections Feed

This repository is a take-home assessment implementation in progress. The current foundation implements the Laravel API base, PostgreSQL/pgvector schema, Sanctum-protected post creation, personalized feed retrieval, semantic search, interaction creation, a Python FastAPI embedding/authenticity service, Docker Compose configuration, and focused tests.

## Implemented In This Foundation

- Laravel API scaffold under `api/`.
- Python FastAPI embedding service under `embedding-service/`.
- Docker Compose services for API, PostgreSQL 16 with pgvector, and embedding service.
- Migrations for `users`, `personal_access_tokens`, `posts`, and `interactions`.
- Sanctum token endpoint: `POST /api/tokens`.
- Protected endpoints: `POST /api/posts`, `GET /api/feed`, `GET /api/search`, and `POST /api/interactions`.
- Deterministic hash embedding fallback for tests and unavailable model downloads.

## Deferred

The Expo React Native app, SQL challenge answers, hosted deployment, final submission, and explanation video are not implemented yet.

## Prerequisites

- Docker and Docker Compose.
- Optional local Python 3.12+ for running pure Python unit tests without Docker.

Host PHP and Composer are not required when using Docker.

## Setup

Create a local environment file from the example:

```bash
cp .env.example .env
```

Set `APP_KEY` before running Laravel. If using Docker after dependencies install, generate it with:

```bash
docker compose run --rm api php artisan key:generate
```

Start services:

```bash
docker compose up --build
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

The tests use fallback mode or mocks and do not require downloading `sentence-transformers/all-MiniLM-L6-v2`. The default Docker image installs the FastAPI service and fallback path only. To exercise the transformer path later, install `embedding-service/requirements-optional-transformer.txt` in the embedding-service environment and set `EMBEDDING_MODE=transformer`.

## Deterministic Fallback

The fallback uses stable SHA-256 hashing, not Python's randomized `hash()`. It returns exactly 384 finite numeric values and is labeled as `fallback`. It is test/failure infrastructure, not genuine semantic search.

## Verification Status

- Docker images for `api` and `embedding-service` were built successfully.
- Laravel feature tests passed: 24 tests, 74 assertions.
- Python embedding-service tests passed: 9 tests.
- PostgreSQL migration verification against `pgvector/pgvector:pg16` passed with the `vector` extension enabled. Host port 5432 was already allocated locally, so verification used `DB_PORT_FORWARD=55432`.
- A rolled-back PostgreSQL check executed `posts.embedding <=> query_vector` and returned a similarity score of `1` for an identical 384-dimensional vector.

## Known Limitations

- Full clean-start verification from a fresh checkout still has to be repeated in the target environment.
- The transformer model path is configured but optional dependencies and model download are not claimed verified until they are installed and run successfully.
- The semantic search implementation currently supports only a small explicit temporal parser for `last week`; broader natural-language date parsing remains deferred.
- Mobile UI, SQL answers, deployment, and video remain deferred.
