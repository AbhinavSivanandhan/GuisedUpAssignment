# Mobile Feed Feature Specification

## Purpose

Provide one intentional Expo React Native Feed Screen that displays the personalized feed, supports infinite scrolling, logs reactions, and shows inline semantic-search results.

## Included Roadmap Stories

US-05, US-18, US-19, US-20, US-24, US-25, US-26, US-27, US-28, US-29, US-30.

## User-Visible Behavior

The screen loads authenticated feed posts, renders post cards with avatar placeholder, username, post text, relative time, and reaction button, loads more results as the user scrolls, and searches inline from a search bar.

## API Contract

The mobile API client will call:

- `GET /api/feed?page={page}` for paginated feed results.
- `GET /api/search?q={query}` for inline semantic search.
- `POST /api/interactions` with `type = reaction` when the reaction button is pressed.
- `DELETE /api/posts/{post}/reaction` when a reacted post is toggled off.

All calls use Sanctum bearer token authentication.

## Data-Model Impact

The mobile screen is not a persistence owner. It reads feed and search responses, creates raw reaction interaction events through the API, and asks the API to remove current reaction state on undo.

## Implementation Rules

- Build one Expo React Native Feed Screen.
- Use an isolated mobile API client rather than calling fetch directly from UI components.
- Fetch and display `GET /api/feed`.
- Display avatar placeholder, username, post text, relative time, and reaction button on every post card.
- Display author avatar images when available and fall back to deterministic initials.
- Hydrate reaction state from `viewer_has_reacted`.
- Hydrate the active reaction from `viewer_reaction_kind`.
- Render `like`, `support`, and `good_vibes` from a data-driven catalog.
- Toggle reactions with POST for activation or switching and DELETE for undo.
- Load additional pages with infinite scrolling.
- Append page results without duplicates.
- Retain at most five complete feed pages, or 100 posts, in memory after successful page appends or prepends.
- Reload released earlier pages when scrolling back near the top and evict the opposite end.
- Report retained posts separately from the API total.
- Show subtle notices when earlier or later pages have been released.
- Prevent duplicate concurrent pagination requests.
- Stop requesting when no next page remains.
- Place a search bar at the top.
- Call `GET /api/search` and show inline semantic-search results.
- Restore or clearly transition back to feed results when search is cleared.
- Handle loading, empty, error, and retry states.
- Use intentional custom styling rather than untouched default React Native styles.

## Responsibility Boundaries

React Native owns presentation and client interactions. Laravel owns returned ordering, validation, pagination, ranking, and API responses. Mobile networking is isolated from UI components.

## Replaceable Interfaces

The feed screen should depend on a mobile API client interface so API implementation details can change without rewriting UI components.

## Edge Cases

- Initial loading.
- Empty feed.
- Empty search results.
- Feed request failure.
- Search request failure.
- Interaction request failure.
- Pagination exhaustion.
- Duplicate pagination trigger.
- Slow network with pending reaction state.
- Typed reaction switching and undo.
- Failed avatar or post image URL.
- Long post text requiring Read more / Show less.
- Six or more loaded pages requiring page-aligned eviction.

## Required Tests

Component or integration tests for feed loading, post card rendering, relative time display, reaction pending/success/failure states, typed reaction switching, reaction undo, bidirectional infinite scroll, page retention, search input, inline results, empty states, error states, retry behavior, and API-client isolation.

## Explicit Non-Goals

- Multiple mobile screens.
- Native app store packaging.
- Implementing backend ranking inside mobile code.

## Definition of Done

The feature is done only when the single Feed Screen works against the documented API, handles all required states, uses intentional custom styling, and required component or integration tests pass.

## Current Implementation Status

- Specified/documented.
- Implemented in `mobile/`.
- Runtime-verified through Expo Web and automated mobile tests where listed in `docs/testing.md`.
