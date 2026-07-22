# AI Usage Log

This document records verified AI-agentic tool usage only. It claims application implementation and runtime testing only where those actions are directly recorded below. It does not claim deployment, hosted repository configuration, final submission, or video generation.

## Verified So Far

| Date | Tool | Purpose | Files affected | Commands run | Outcome | Limitations or corrections |
|---|---|---|---|---|---|---|
| 2026-07-22 | Codex | Requirements traceability and repository governance preparation | `AGENTS.md`, `docs/governance.md`, `docs/workspace.md`, `User_story_Roadmap.md`, `.gitignore` | `pwd`, `find`, `sed`, `wc`, `rg`, `git init`, `git branch -M main`, `mkdir`, `git status --short`, `git diff --check` | Governance and workspace documentation prepared before application code | Batch 1 over-narrowed roadmap source wording; later repaired to use `Assignment.md` as complete source authority |
| 2026-07-22 | Codex | Architecture documentation and TSD drafting | `docs/TSD.md`, `docs/architecture.md`, `docs/testing.md`, `docs/decisions/ADR-001-pgvector.md` | `sed`, `rg`, `git status --short`, `find`, `git diff --check` | Pre-implementation design documented | No runtime tests or implementation performed |
| 2026-07-22 | Codex | Feature-specification drafting, documentation consistency review, and roadmap evidence synchronization | `docs/features/post-creation.md`, `docs/features/feed-ranking.md`, `docs/features/semantic-search.md`, `docs/features/interactions.md`, `docs/features/mobile-feed.md`, `User_story_Roadmap.md`, `docs/ai-usage.md`, `docs/TSD.md`, `docs/architecture.md`, `docs/testing.md` | `sed`, `rg`, `git status --short`, `find`, `git diff --check`, `file` | Feature specifications documented and consistency-reviewed before application code | No application implementation, tests, runtime verification, deployment, hosted repository configuration, working application generation, or video generation performed |
| 2026-07-22 | Codex | Backend foundation implementation, database schema implementation, embedding-service implementation, API endpoint implementation, automated-test creation, and documentation synchronization | `api/`, `embedding-service/`, `docker-compose.yml`, `.env.example`, `README.md`, `docs/TSD.md`, `docs/testing.md`, `docs/workspace.md`, `docs/ai-usage.md`, `User_story_Roadmap.md` | `pwd`, `sed`, `find`, `git status --short`, `docker compose build api embedding-service`, `docker run --rm guisedup-api php artisan test --testsuite=Feature`, `docker run --rm guisedup-embedding-service python -m pytest`, `docker compose up -d db`, `docker compose ps`, `docker run --rm --network guisedup_default ... php artisan migrate --force`, `docker compose exec db psql ...`, `docker run --rm guisedup-api php artisan route:list`, `git diff --check`, `rg` | Laravel foundation, PostgreSQL/pgvector migrations, Sanctum-protected post and interaction endpoints, Python fallback embedding/authenticity service, Docker Compose configuration, README, `.env.example`, and focused tests were created and verified as stated | Feed ranking endpoint, semantic-search endpoint, Expo mobile app, SQL answers, deployment, hosted repository configuration, final submission, and video were not implemented; transformer model execution was not verified |

## Append-Only Template

Add future entries below without rewriting verified history.

| Date/time | Tool | Purpose | Prompt summary | Files affected | Commands run | Human review | Outcome | Limitations or corrections |
|---|---|---|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
