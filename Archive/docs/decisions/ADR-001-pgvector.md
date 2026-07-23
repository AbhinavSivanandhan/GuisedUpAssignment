# ADR-001: Use pgvector for Vector Storage

## Status

Status: Accepted.

## Context

`Assignment.md` requires a SQL database and one permitted vector database option. The approved local architecture uses PostgreSQL 16 with pgvector so relational post, user, interaction, and vector data can be managed together.

## Decision

Use PostgreSQL 16 with pgvector as the vector persistence and similarity-search layer. Store post embeddings as `vector(384)` and index them for cosine similarity.

## Why pgvector Fits This Eight-Hour Assessment

pgvector keeps setup smaller than introducing a separate vector service. It supports reproducible migrations, works directly beside the relational schema, and is acceptable under the allowed vector options.

## Considered Alternatives

- Pinecone: managed and specialized, but adds external account, networking, secrets, and billing concerns.
- Weaviate: capable vector database, but operationally heavier for this assessment.
- Qdrant: strong vector search option, but introduces another service and persistence surface.
- Chroma: useful for local prototyping, but less aligned with the SQL challenge and relational data model.

## Benefits

- One database for relational and vector persistence.
- Reproducible local setup with PostgreSQL migrations.
- Direct joins between posts, users, interactions, and vector-ranked candidates.
- Lower infrastructure overhead for an eight-hour assessment.

## Costs

- Less specialized than dedicated vector systems at larger scale.
- Requires PostgreSQL extension setup.
- Approximate index tuning still needs care.

## Operational Limitations

The implementation must verify extension availability, vector dimensions, cosine index configuration, and query plans. Very large datasets may require a dedicated vector service later.

## Replacement Boundary

Laravel must depend on an embedding/vector-search interface rather than raw pgvector details. Real and deterministic embedding implementations share one contract. Replacing pgvector should not affect mobile UI components or API response resources.

## Conditions for Changing Later

Changing the decision could be justified by dataset scale, operational maturity, managed-service requirements, advanced filtering needs, multi-region requirements, or reviewer feedback requiring a different permitted vector database.
