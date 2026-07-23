-- Guised Up SQL Challenge
-- PostgreSQL-compatible raw SQL matching the repository migrations.

-- D1: Top 10 most active users during the last seven days.
-- Activity total is the count of raw interaction events where type is
-- view, reply, or reaction and interactions.created_at is within the
-- trailing seven days relative to CURRENT_TIMESTAMP.
WITH recent_activity AS (
    SELECT
        interactions.user_id,
        COUNT(*) FILTER (WHERE interactions.type = 'view') AS view_count,
        COUNT(*) FILTER (WHERE interactions.type = 'reply') AS reply_count,
        COUNT(*) FILTER (WHERE interactions.type = 'reaction') AS reaction_count,
        COUNT(*) AS total_activity
    FROM interactions
    WHERE interactions.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
      AND interactions.type IN ('view', 'reply', 'reaction')
    GROUP BY interactions.user_id
)
SELECT
    users.id AS user_id,
    users.email,
    users.name,
    recent_activity.view_count,
    recent_activity.reply_count,
    recent_activity.reaction_count,
    recent_activity.total_activity
FROM recent_activity
JOIN users ON users.id = recent_activity.user_id
ORDER BY
    recent_activity.total_activity DESC,
    recent_activity.reply_count DESC,
    recent_activity.reaction_count DESC,
    recent_activity.view_count DESC,
    users.id ASC
LIMIT 10;

-- D2: For a supplied user_id, return posts from users they interact with most.
-- psql usage example:
--   psql -v user_id=123 -f sql/queries.sql
-- The supplied user interacts with authors through raw interactions on posts.
-- Results include posts by those authors from the trailing 30 days and are
-- ordered by interaction frequency first, then deterministic post ordering.
WITH params AS (
    SELECT :user_id::bigint AS user_id
),
author_interaction_counts AS (
    SELECT
        posts.user_id AS author_id,
        COUNT(*) AS interaction_frequency
    FROM interactions
    JOIN posts ON posts.id = interactions.post_id
    JOIN params ON params.user_id = interactions.user_id
    WHERE interactions.type IN ('view', 'reply', 'reaction')
    GROUP BY posts.user_id
)
SELECT
    posts.id AS post_id,
    posts.user_id AS author_id,
    users.email AS author_email,
    users.name AS author_name,
    posts.text,
    posts.image_url,
    posts.created_at,
    author_interaction_counts.interaction_frequency
FROM author_interaction_counts
JOIN posts ON posts.user_id = author_interaction_counts.author_id
JOIN users ON users.id = posts.user_id
WHERE posts.created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY
    author_interaction_counts.interaction_frequency DESC,
    posts.user_id ASC,
    posts.created_at DESC,
    posts.id DESC;

-- D3: Posts with more than 100 views and zero reactions.
-- Views are counted per post through a lateral aggregate. Reactions are tested
-- with NOT EXISTS so reactions cannot multiply the view count.
SELECT
    posts.id AS post_id,
    posts.user_id AS author_id,
    view_counts.view_count,
    posts.created_at
FROM posts
JOIN LATERAL (
    SELECT COUNT(*) AS view_count
    FROM interactions
    WHERE interactions.post_id = posts.id
      AND interactions.type = 'view'
) AS view_counts ON TRUE
WHERE view_counts.view_count > 100
  AND NOT EXISTS (
      SELECT 1
      FROM interactions
      WHERE interactions.post_id = posts.id
        AND interactions.type = 'reaction'
  )
ORDER BY
    view_counts.view_count DESC,
    posts.created_at DESC,
    posts.id DESC;

-- D4: Users who created more than 20 posts during the last 24 hours.
SELECT
    users.email,
    COUNT(posts.id) AS post_count
FROM users
JOIN posts ON posts.user_id = users.id
WHERE posts.created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY users.id, users.email
HAVING COUNT(posts.id) > 20
ORDER BY
    post_count DESC,
    users.email ASC,
    users.id ASC;
