import assert from 'node:assert/strict';
import test from 'node:test';

import type { Post, RankingDebug } from '../src/api/types.js';
import { formatRankingDebug, shouldShowFeedRankingDebug } from '../src/feed/rankingDebug.js';

const debug: RankingDebug = {
  rank: 3,
  final_score: 0.6842,
  components: {
    authenticity: {
      score: 0.72,
      weight: 0.3,
      contribution: 0.216
    },
    relationship_depth: {
      score: 0.8,
      weight: 0.3,
      contribution: 0.24
    },
    semantic_similarity: {
      score: 0.55,
      weight: 0.25,
      contribution: 0.1375
    },
    time_decay: {
      score: 0.6047,
      weight: 0.15,
      contribution: 0.0907
    }
  }
};

const post: Post = {
  id: 1,
  author: {
    id: 2,
    name: 'Author'
  },
  text: 'Post',
  image_url: null,
  created_at: '2026-07-23T12:00:00.000Z',
  ranking_debug: debug
};

test('rank debug formats backend-provided score components', () => {
  const display = formatRankingDebug(debug);

  assert.equal(display.title, 'Rank #3 · Final 68.4%');
  assert.deepEqual(display.rows, [
    { label: 'Authenticity', value: '72 × 30% = 21.6' },
    { label: 'Relationship', value: '80 × 30% = 24.0' },
    { label: 'Semantic similarity', value: '55 × 25% = 13.8' },
    { label: 'Time relevance', value: '60 × 15% = 9.1' }
  ]);
  assert.match(display.accessibilityLabel, /authenticity score/);
  assert.match(display.accessibilityLabel, /relationship depth score/);
});

test('rank debug is developer-only and feed-only', () => {
  assert.equal(shouldShowFeedRankingDebug(post, true, 'feed'), true);
  assert.equal(shouldShowFeedRankingDebug(post, false, 'feed'), false);
  assert.equal(shouldShowFeedRankingDebug({ ...post, similarity_score: 0.92 }, true, 'feed'), false);
  assert.equal(shouldShowFeedRankingDebug(post, true, 'search'), false);
});
