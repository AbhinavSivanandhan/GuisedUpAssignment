# Workspace Structure

`Assignment.md` is the frozen assessment contract. This document describes repository layout only; it does not add product requirements.

## Current Structure

The repository currently contains:

```text
/
├── Assignment.md
├── User_story_Roadmap.md
├── AGENTS.md
├── README.md
├── .env.example
├── .gitignore
├── docker-compose.yml
├── api/
├── embedding-service/
└── docs/
    ├── governance.md
    ├── TSD.md
    ├── architecture.md
    ├── testing.md
    ├── ai-usage.md
    ├── workspace.md
    ├── decisions/
    │   └── ADR-001-pgvector.md
    └── features/
        ├── post-creation.md
        ├── feed-ranking.md
        ├── semantic-search.md
        ├── interactions.md
        └── mobile-feed.md
```

The current implementation contains a Laravel API foundation in `/api/`, a Python FastAPI embedding service in `/embedding-service/`, Docker Compose configuration, a root `README.md`, and a root `.env.example`. The Expo mobile app, SQL challenge file, deployment artifacts, submission video, and rendered/generated diagrams do not exist yet.

## Approved Future Structure

Uncreated directories below are proposed, not present. Create them only in a batch that explicitly authorizes that work. The implemented backend uses `/api/` and `/embedding-service/`; the earlier `/apps/api/` and `/services/embeddings/` names remain conceptual equivalents from the pre-implementation plan.

```text
/
├── Assignment.md
├── AGENTS.md
├── README.md
├── .env.example
├── .gitignore
├── docker-compose.yml
├── apps/
│   ├── api/              # Conceptual equivalent now implemented as /api/
│   └── mobile/
├── services/
│   └── embeddings/       # Conceptual equivalent now implemented as /embedding-service/
├── docs/
│   ├── TSD.md
│   ├── architecture.md
│   ├── workspace.md
│   ├── testing.md
│   ├── ai-usage.md
│   ├── decisions/
│   └── features/
├── sql/
│   └── queries.sql
└── scripts/
```

## Directory Responsibilities

- `/api/`: Laravel API. Owns authentication, validation, orchestration, implemented post/feed/interaction endpoints, persistence, ranking, pagination, and API responses. Semantic search remains deferred.
- `/apps/api/`: Earlier documented conceptual path for the Laravel API; do not create a duplicate while `/api/` is the implemented location.
- `/apps/mobile/`: Expo React Native TypeScript app. Owns presentation and client interactions.
- `/embedding-service/`: Python FastAPI embedding service. Owns embedding generation and explainable authenticity analysis.
- `/services/embeddings/`: Earlier documented conceptual path for the embedding service; do not create a duplicate while `/embedding-service/` is the implemented location.
- `/docs/`: Tracked project documentation, including TSD, architecture, testing, AI usage, workspace, decisions, and feature specs.
- `/docs/features/`: Feature-level specifications and acceptance criteria.
- `/docs/decisions/`: Durable architecture and implementation decision records.
- `/sql/`: Raw SQL challenge answers, including `/sql/queries.sql`.
- `/scripts/`: Project-owned automation scripts.

Important project-owned files include `Assignment.md`, `AGENTS.md`, the roadmap, `README.md`, `.env.example`, `.gitignore`, `docker-compose.yml`, `/docs/TSD.md` or `/docs/TSD.pdf`, and `/sql/queries.sql`.

## Ownership Rules

Project-owned files are intentional source, documentation, configuration, tests, migrations, SQL answers, and scripts. Framework-generated files are files produced by Laravel, Expo, Python tooling, or build systems. Generated framework files need not each be documented individually, but their top-level location and purpose must remain clear.

Tracked documentation belongs in `/docs/`. Local-only artifacts, scratch notes, editor state, logs, caches, generated coverage, local environment files, and transient agent output must remain untracked unless explicitly approved as deliverables.

Laravel files belong under `/api/` for the implemented repository. Mobile files will belong under `/mobile/` or `/apps/mobile/` only when that batch is authorized. Python embedding files belong under `/embedding-service/`. SQL challenge files belong under `/sql/`. Automation belongs under `/scripts/`. Documentation belongs under `/docs/`.

## Approved Architecture Context

The approved direction is a monorepo with Expo React Native TypeScript, Laravel as the authoritative API, Laravel Sanctum token authentication, PostgreSQL 16, pgvector, a Python FastAPI embedding service, `sentence-transformers/all-MiniLM-L6-v2`, 384-dimensional embeddings, deterministic hash-based embedding fallback, and Docker Compose for the intended reproducible environment. If any of this conflicts with `Assignment.md`, `Assignment.md` controls.

## Replaceability Boundaries

- Laravel depends on an embedding interface, not FastAPI details.
- Real and deterministic embedding implementations share one contract.
- Feed score components are isolated services or strategies.
- API response resources are separate from ranking internals.
- Mobile networking is isolated from UI components.
- Environment-specific values come from configuration.
- Controllers remain thin.
- Feature tests protect public behavior during replacements.

Feature boundaries must remain replaceable and interface-driven.
