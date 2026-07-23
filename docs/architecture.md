# Architecture Diagrams

These Mermaid diagrams are source diagrams only. No rendered PNG, SVG, PDF, or external diagram artifact has been generated.

## System Component Architecture

```mermaid
flowchart LR
  User[Authenticated user] --> Mobile[Expo React Native TypeScript Feed Screen]
  Mobile -->|HTTPS + Sanctum token| Laravel[Laravel API]
  Laravel -->|SQL and vector queries| PG[(PostgreSQL 16 + pgvector)]
  Laravel -->|Embedding/authenticity request| Embeddings[Python FastAPI embedding service]
  Embeddings --> Model[sentence-transformers/all-MiniLM-L6-v2]
  Embeddings --> Fallback[Deterministic hash fallback]
```

## Post-Creation and Embedding Flow

```mermaid
sequenceDiagram
  participant M as Mobile
  participant L as Laravel API
  participant P as Python FastAPI
  participant DB as PostgreSQL + pgvector

  M->>L: POST /api/posts with Sanctum token
  L->>L: Validate text and optional image_url
  L->>P: Request 384-dimensional embedding and authenticity analysis
  alt model available
    P-->>L: embedding, text score, nullable image score
  else model unavailable
    P-->>L: deterministic fallback embedding with fallback status
  end
  L->>DB: Persist post and vector(384)
  L-->>M: 201 Created
```

## Personalized-Feed Flow

```mermaid
sequenceDiagram
  participant M as Mobile
  participant L as Laravel API
  participant DB as PostgreSQL + pgvector

  M->>L: GET /api/feed?page=1 with Sanctum token
  L->>DB: Load candidate posts and current user's interactions
  L->>L: Build user interest vector
  L->>L: Score authenticity, relationship_depth, semantic_similarity, time_decay
  L->>L: Order by final_score DESC, created_at DESC, id DESC
  L->>DB: Read page of 20
  L-->>M: 200 OK with posts and pagination metadata
```

## Semantic-Search and Temporal-Filter Flow

```mermaid
sequenceDiagram
  participant M as Mobile
  participant L as Laravel API
  participant P as Python FastAPI
  participant DB as PostgreSQL + pgvector

  M->>L: GET /api/search?q={natural-language query with temporal intent}
  L->>L: Validate query and extract temporal intent
  L->>P: Embed semantic query text
  P-->>L: 384-dimensional query vector or fallback
  L->>DB: Cosine vector search with created_at date filter
  L->>L: Stable order and limit to 10
  L-->>M: 200 OK with inline-search results
```

## Interaction-Logging Flow

```mermaid
sequenceDiagram
  participant M as Mobile
  participant L as Laravel API
  participant DB as PostgreSQL

  M->>L: POST /api/interactions with post_id and type
  L->>L: Validate Sanctum token, post_id, and type in view/reply/reaction
  L->>DB: Persist raw interaction event
  opt type is reaction
    L->>DB: Upsert current post_reactions row for viewer and post
  end
  L-->>M: 201 Created

  M->>L: DELETE /api/posts/{post}/reaction
  L->>DB: Delete only viewer's current post_reactions row
  L-->>M: 200 OK with viewer_has_reacted false
```

## Entity-Relationship Diagram

```mermaid
erDiagram
  users ||--o{ posts : authors
  users ||--o{ interactions : performs
  users ||--o{ post_reactions : toggles
  users ||--o{ personal_access_tokens : owns
  posts ||--o{ interactions : receives
  posts ||--o{ post_reactions : has_current

  users {
    bigint id PK
    string name
    string email UK
    string avatar_url
    string password
    timestamp created_at
    timestamp updated_at
  }

  personal_access_tokens {
    bigint id PK
    string tokenable_type
    bigint tokenable_id
    string name
    string token
    text abilities
    timestamp last_used_at
    timestamp expires_at
    timestamp created_at
    timestamp updated_at
  }

  posts {
    bigint id PK
    bigint user_id FK
    text text
    string image_url
    vector embedding
    decimal text_authenticity_score
    decimal image_authenticity_score
    decimal authenticity_score
    string embedding_status
    timestamp created_at
    timestamp updated_at
  }

  interactions {
    bigint id PK
    bigint user_id FK
    bigint post_id FK
    string type
    timestamp created_at
    timestamp updated_at
  }

  post_reactions {
    bigint id PK
    bigint user_id FK
    bigint post_id FK
    timestamp created_at
    timestamp updated_at
  }
```
