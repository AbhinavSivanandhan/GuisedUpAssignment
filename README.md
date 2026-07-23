# Guised Up Real Connections Feed

Guised Up is a full-stack take-home assessment implementing a Real Connections feed: ranked social posts without global popularity signals. The repository contains a Laravel API, PostgreSQL 16 with pgvector, a Python FastAPI embedding/authenticity service, an Expo React Native feed screen, raw SQL challenge answers, and the Technical Solution Document at `docs/TSD.md`.

Deployment, private GitHub publishing, final submission messaging, and the required explanation video are not completed in this repository.

## Implemented Features

- Laravel Sanctum bearer-token authentication.
- Seeded local users, including `alex@example.test` and `sam@example.test`.
- `POST /api/posts` with automatic 384-dimensional embedding generation and authenticity scoring.
- `GET /api/feed` with 20-post pagination, authenticity, relationship, semantic-similarity, and time-relevance ranking.
- `GET /api/search?q={query}` with vector similarity, top-10 limit, and a `last week` temporal filter.
- `POST /api/interactions` for `view`, `reply`, and `reaction` raw event logging.
- Typed current reactions with `like`, `support`, and `good_vibes`, plus `DELETE /api/posts/{post}/reaction`.
- Search-event and interaction-provenance logging.
- Materialized user feed profiles rebuilt outside the feed request path.
- Expo React Native feed screen with feed retrieval, search, infinite scrolling, avatars, post media, Read more / Show less, reaction controls, loading, empty, and error states.
- PostgreSQL-compatible SQL answers in `sql/queries.sql`.

Global likes, shares, comments, follower totals, global views, global replies, and global reactions are not feed-ranking inputs.

## Repository Structure

- `api/`: Laravel API, migrations, seeders, services, routes, and feature tests.
- `embedding-service/`: FastAPI embedding/authenticity service and Python tests.
- `mobile/`: Expo React Native application and TypeScript tests.
- `docs/`: TSD, architecture, feature specs, testing, AI usage, and production-readiness notes.
- `sql/queries.sql`: raw SQL challenge answers.
- `docker-compose.yml`: local API, PostgreSQL/pgvector, and embedding-service stack.
- `.env.example`, `mobile/.env.example`: non-secret environment templates.

## Prerequisites

- Docker and Docker Compose.
- Node 20.19.4 or newer for Expo SDK 54.
- npm for the mobile app.
- Optional local Python 3.12+ if running Python tests outside Docker.

Host PHP and Composer are not required when using Docker.

## Clean Start

From a fresh checkout:

```bash
cp .env.example .env
DB_PORT_FORWARD=55432 docker compose up -d --build
docker compose exec -T api php artisan migrate --force
docker compose exec -T api php artisan db:seed --force
```

Use `DB_PORT_FORWARD=5432` or omit it only if local port `5432` is free. The internal Docker database port remains `5432`.

The API container hydrates an ignored `api/.env` for local Docker use. Keep real secrets in ignored `.env` files only.

## Environment Variables

Root `.env.example` documents:

- Laravel and Docker ports: `APP_*`, `API_PORT`, `DB_PORT_FORWARD`, `EMBEDDING_SERVICE_PORT`.
- PostgreSQL: `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.
- Feed profile/debug settings: `FEED_DEBUG_ENABLED`, `FEED_PROFILE_REBUILD_CONNECTION`, `QUEUE_CONNECTION`.
- Embeddings: `EMBEDDING_SERVICE_URL`, `EMBEDDING_MODE`, `EMBEDDING_MODEL`, fallback and timeout settings.
- Mobile convenience values: `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_SANCTUM_TOKEN`, `EXPO_PUBLIC_DEVELOPER_MODE`.

`mobile/.env.example` documents the Expo public values used by the mobile client. Do not commit real tokens.

## Health Checks

```bash
curl http://localhost:8000/up
curl http://localhost:8001/health
docker compose exec -T db psql -U guised_up -d guised_up -c "select extname from pg_extension where extname = 'vector';"
```

## Authentication

Seeded local credentials:

- `alex@example.test` / `password`
- `sam@example.test` / `password`

Create a Sanctum token:

```bash
curl -s -X POST http://localhost:8000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.test","password":"password","device_name":"local"}'
```

Use the returned token as `Authorization: Bearer <token>`.

## API Examples

Create a post:

```bash
curl -X POST http://localhost:8000/api/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text":"A grounded post about today","image_url":"https://example.com/photo.jpg"}'
```

Fetch feed:

```bash
curl "http://localhost:8000/api/feed?page=1" \
  -H "Authorization: Bearer <token>"
```

Search:

```bash
curl "http://localhost:8000/api/search?q=funny%20travel%20stories%20from%20last%20week" \
  -H "Authorization: Bearer <token>"
```

Record an interaction:

```bash
curl -X POST http://localhost:8000/api/interactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"post_id":1,"type":"reaction","reaction_kind":"like"}'
```

Remove current reaction state:

```bash
curl -X DELETE http://localhost:8000/api/posts/1/reaction \
  -H "Authorization: Bearer <token>"
```

## Mobile App

```bash
cd mobile
cp .env.example .env
npm ci
```

Set:

- `EXPO_PUBLIC_API_BASE_URL` to the Laravel URL.
- `EXPO_PUBLIC_SANCTUM_TOKEN` to a local development token.
- `EXPO_PUBLIC_DEVELOPER_MODE=true` only when local ranking diagnostics should be visible.

Run Expo Web:

```bash
npm run start -- --web --clear --port 8091
```

Run for iOS simulator:

```bash
npm run start -- --ios --port 8091
```

Run for Android emulator:

```bash
npm run start -- --android --port 8091
```

For a physical device, set `EXPO_PUBLIC_API_BASE_URL` to a LAN-reachable computer address such as `http://192.168.x.x:8000`; Expo tunnel mode tunnels Metro, not the Laravel API.

## Tests

Laravel:

```bash
docker compose exec -T api php artisan test
```

Python:

```bash
docker compose exec -T embedding-service python -m pytest
```

Mobile:

```bash
cd mobile
npm run typecheck
npm test
```

The Python and Laravel tests use fallback mode or mocks and do not require downloading `sentence-transformers/all-MiniLM-L6-v2`.

## SQL Challenge

Run all four SQL answers with a supplied D2 user id:

```bash
sed -n '1,220p' sql/queries.sql | docker compose exec -T db psql -U guised_up -d guised_up -v user_id=1
```

The queries use PostgreSQL-compatible SQL, `CURRENT_TIMESTAMP` relative windows, CTEs where useful, and deterministic tie-breakers.

## Ranking Summary

Feed ranking uses:

```text
final_score =
    0.30 × authenticity
  + 0.30 × relationship_depth
  + 0.25 × semantic_similarity
  + 0.15 × time_decay
```

All components are normalized to `0..1`. The score is calculated before display rounding. Ties sort by `final_score DESC`, `created_at DESC`, then `id DESC`. Development-only ranking diagnostics are gated by `FEED_DEBUG_ENABLED` on the backend and `EXPO_PUBLIC_DEVELOPER_MODE` in the mobile app; committed defaults are `false`.

## Embeddings

The Python service is configured for `sentence-transformers/all-MiniLM-L6-v2` and 384-dimensional vectors. Docker defaults to deterministic fallback mode so setup and tests do not require model downloads. The fallback uses stable SHA-256 hashing, returns exactly 384 finite values, and is not genuine semantic search. Production use should install `embedding-service/requirements-optional-transformer.txt` and run transformer mode after verifying model download and resource constraints.

## Known Limitations

- The explanation video is not included.
- Deployment is not completed.
- The transformer model path is configured but not claimed verified unless optional dependencies and model download are run successfully.
- Temporal search currently handles the explicit `last week` pattern, not broad natural-language date parsing.
- Feed profiles are eventually consistent; interaction writes dispatch non-blocking rebuilds.
- Offset/page pagination can drift if ranking inputs change during a long session.
- Mobile memory retains a bounded page window and does not restore scroll state after app restart.
- Physical-device acceptance still requires the owner to run the app on their target device.
- External demo media is less reliable than controlled object storage.

## Submission Contents

Required technical artifacts are present:

- `README.md`
- `.env.example`
- `mobile/.env.example`
- `docs/TSD.md`
- `sql/queries.sql`
- Laravel migrations and tests
- Python service and tests
- Expo React Native screen and tests
- AI usage documentation in `docs/ai-usage.md`

Remaining manual submission work: private GitHub publication, explanation video recording/linking, deployment if desired, and final message to the founder.
