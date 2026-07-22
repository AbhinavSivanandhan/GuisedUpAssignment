# Interactions Feature Specification

## Purpose

Record authenticated user activity against posts so relationship depth can be calculated and SQL reporting can aggregate views, replies, and reactions.

## Included Roadmap Stories

US-05, US-10, US-14, US-20, US-21, US-22, US-23, US-26, US-31, US-32, US-33.

## User-Visible Behavior

When a user views, replies to, or reacts to a post, the API records the event and returns confirmation. Invalid interaction types or missing posts return explicit errors.

## API Contract

`POST /api/interactions` requires Sanctum authentication.

Request:

```json
{
  "post_id": 123,
  "type": "view"
}
```

Allowed values: `view`, `reply`, `reaction`.

Success: `201 Created` with interaction id, post id, type, and timestamp.

Failures: `401` unauthenticated and `422` invalid payload, including missing or nonexistent `post_id`.

## Data-Model Impact

Creates one `interactions` row with `user_id`, `post_id`, `type`, `created_at`, and `updated_at`. Foreign keys preserve referential integrity with users and posts.

## Implementation Rules

- Use Sanctum authentication.
- Accept only `view`, `reply`, or `reaction`.
- Persist raw events for ranking and SQL reporting.
- Relationship depth uses only the authenticated user's events with each author.
- SQL reporting can aggregate raw events by type and time.
- Duplicate-event policy: persist repeated raw events, including repeated views, because the assessment data model needs raw interactions for relationship-depth calculations and SQL reporting. No uniqueness constraint blocks repeated legitimate events.

## Responsibility Boundaries

Laravel owns validation, persistence, relationship use, and API responses. PostgreSQL owns referential integrity and time-bounded aggregation. React Native invokes reaction logging from the feed UI.

## Replaceable Interfaces

Relationship-depth calculation should consume raw interaction events through a scoring service so event storage can remain stable if ranking changes.

## Edge Cases

- Invalid token.
- Missing `post_id`.
- Deleted post.
- Invalid interaction type.
- Rapid duplicate views.
- Multiple reactions by the same user.
- Self-interaction with own post.

## Required Tests

Feature tests for authentication, allowed type validation, invalid post handling, raw-event persistence, referential deletion behavior, duplicate policy, and SQL-reporting compatibility.

## Explicit Non-Goals

- Adding interaction types beyond `view`, `reply`, and `reaction`.
- Using global interaction totals for feed popularity ranking.
- Calculating feed ranking from interaction events in this backend foundation batch.

## Definition of Done

The feature is done only when `POST /api/interactions` validates and persists raw events, supports relationship-depth and SQL reporting, documents duplicate behavior, and required tests pass.

## Current Implementation Status

- Specified/documented.
- Implemented for `POST /api/interactions` in `api/`.
- Runtime-verified by Laravel feature tests: 5 interaction tests passed as part of the 10-test feature suite.
- Feed integration and relationship-depth scoring remain deferred.
