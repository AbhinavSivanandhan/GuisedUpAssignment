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
  "type": "reaction",
  "reaction_kind": "support"
}
```

Allowed interaction `type` values: `view`, `reply`, `reaction`. For `type = reaction`, `reaction_kind` accepts `like`, `support`, or `good_vibes`; omitting it defaults to `like` for backward compatibility.

Success: `201 Created` with interaction id, post id, type, and timestamp.

Failures: `401` unauthenticated and `422` invalid payload, including missing or nonexistent `post_id`.

`DELETE /api/posts/{post}/reaction` requires Sanctum authentication and removes only the authenticated user's current reaction state for that post. The route is idempotent and returns `viewer_has_reacted: false` and `viewer_reaction_kind: null`.

## Data-Model Impact

Creates one `interactions` row with `user_id`, `post_id`, `type`, `created_at`, and `updated_at`. Foreign keys preserve referential integrity with users and posts.

Reaction toggle state is stored separately in `post_reactions` with one row per `user_id` and `post_id`, plus the active `reaction_kind`. Raw interaction rows are not deleted when a reaction is undone.

## Implementation Rules

- Use Sanctum authentication.
- Accept only `view`, `reply`, or `reaction`.
- Persist raw events for ranking and SQL reporting.
- Persist reaction current-state separately from raw events.
- `POST /api/interactions` with `type = reaction` records the raw event and activates or switches current reaction state.
- Keep reaction kinds data-driven and do not add `like`, `support`, or `good_vibes` as top-level interaction types.
- `DELETE /api/posts/{post}/reaction` removes only current reaction state for the authenticated user.
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
- Switching from one reaction kind to another.
- Invalid reaction kind.
- Undoing an already-removed reaction.
- Self-interaction with own post.

## Required Tests

Feature tests for authentication, allowed type validation, reaction-kind validation and defaulting, invalid post handling, raw-event persistence, current-state switching, undo idempotency, referential deletion behavior, duplicate policy, and SQL-reporting compatibility.

## Explicit Non-Goals

- Adding interaction types beyond `view`, `reply`, and `reaction`.
- Treating reaction kinds as global popularity counters.
- Using global interaction totals for feed popularity ranking.
- Replacing raw interaction history with only aggregate counters.

## Definition of Done

The feature is done only when `POST /api/interactions` validates and persists raw events, supports relationship-depth and SQL reporting, documents duplicate behavior, and required tests pass.

## Current Implementation Status

- Specified/documented.
- Implemented for `POST /api/interactions` in `api/`.
- Runtime-verified by Laravel feature tests where listed in `docs/testing.md`.
- Feed and search hydrate current reaction state for the authenticated viewer.
- Interaction provenance and qualified-view fields are implemented for feed/search attribution.
