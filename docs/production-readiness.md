# Production Readiness Notes

## Media Storage

Current assessment implementation stores post `image_url` and user `avatar_url` as URL references in PostgreSQL. Fixed application assets belong in `mobile/assets`. Demo media uses verified HTTPS fixtures so the React Native screen can exercise avatar and post-image rendering without bundling large binaries.

Production uploads should use S3-compatible object storage plus a CDN. PostgreSQL should store stable object keys, ownership, MIME type, dimensions, and variant metadata rather than image binaries or Base64 payloads. Signed upload URLs, generated image variants, moderation, lifecycle cleanup, and placeholder behavior remain future work.

## Feed Pagination

The current API uses page/offset pagination through `GET /api/feed?page=N`. Offset/page pagination can drift if ranking inputs or new posts change during a long session. A production feed should use an opaque cursor or a stable ranking snapshot.

The mobile app keeps a five-page in-memory feed window so long sessions do not retain every loaded post. The cache is intentionally memory-only and does not restore scroll state after app restart.

## Reactions

Reaction writes preserve raw `interactions` history and maintain current state in `post_reactions`. Offline retry and idempotency-key handling are not implemented yet. The reaction catalog is extensible in backend and mobile code, but server-driven reaction definitions are deferred.

## Demo Media Reliability

External demo media is less reliable than controlled object storage. One controlled broken-image fixture is intentionally kept deeper in the feed to exercise fallback UI; initial demo rows should use working HTTPS images or text-only posts.

## Deferred Search Work

Broader semantic-search improvements remain a separate pass. This note does not change the documented ranking weights, embedding behavior, or Python model policy.
