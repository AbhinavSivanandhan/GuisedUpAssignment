import assert from 'node:assert/strict';
import test from 'node:test';

import type { FeedResponse, Post } from '../src/api/types.js';
import {
  canRequestNextFeedPage,
  feedReducer,
  hasNextFeedPage,
  initialFeedState,
  mergeUniquePosts
} from '../src/state/feedReducer.js';

function post(id: number): Post {
  return {
    id,
    author: {
      id: 100 + id,
      name: `Author ${id}`
    },
    text: `Post ${id}`,
    image_url: null,
    created_at: '2026-07-22T12:00:00.000000Z'
  };
}

function feedResponse(data: Post[], currentPage: number, lastPage: number): FeedResponse {
  return {
    data,
    meta: {
      current_page: currentPage,
      last_page: lastPage,
      per_page: 20,
      total: data.length
    }
  };
}

test('pagination appends without duplicate posts', () => {
  const firstPage = feedReducer(initialFeedState, {
    type: 'feed/loadSuccess',
    response: feedResponse([post(1), post(2)], 1, 2)
  });

  const secondPage = feedReducer(firstPage, {
    type: 'feed/loadSuccess',
    response: feedResponse([post(2), post(3)], 2, 2)
  });

  assert.deepEqual(
    secondPage.feedPosts.map((item) => item.id),
    [1, 2, 3]
  );
  assert.equal(secondPage.hasNextPage, false);
});

test('search mode switches on query and clears back to feed mode', () => {
  const searching = feedReducer(initialFeedState, {
    type: 'search/queryChanged',
    query: 'travel stories'
  });
  assert.equal(searching.mode, 'search');

  const withResults = feedReducer(searching, {
    type: 'search/success',
    query: 'travel stories',
    posts: [post(4)]
  });
  assert.equal(withResults.searchPosts.length, 1);

  const cleared = feedReducer(withResults, {
    type: 'search/queryChanged',
    query: '   '
  });
  assert.equal(cleared.mode, 'feed');
  assert.equal(cleared.searchPosts.length, 0);
});

test('stale search success is ignored when the query changes', () => {
  const searching = feedReducer(initialFeedState, {
    type: 'search/queryChanged',
    query: 'travel stories'
  });

  const changed = feedReducer(searching, {
    type: 'search/queryChanged',
    query: 'coffee meetups'
  });

  const staleResult = feedReducer(changed, {
    type: 'search/success',
    query: 'travel stories',
    posts: [post(7)]
  });

  assert.equal(staleResult.query, 'coffee meetups');
  assert.equal(staleResult.searchPosts.length, 0);
});

test('stale search error is ignored after search is cleared', () => {
  const searching = feedReducer(initialFeedState, {
    type: 'search/queryChanged',
    query: 'travel stories'
  });

  const cleared = feedReducer(searching, {
    type: 'search/queryChanged',
    query: ''
  });

  const staleError = feedReducer(cleared, {
    type: 'search/error',
    query: 'travel stories',
    message: 'Search failed.'
  });

  assert.equal(staleError.mode, 'feed');
  assert.equal(staleError.error, null);
  assert.equal(staleError.searchLoading, false);
});

test('error handling clears loading flags and preserves recoverable message', () => {
  const loading = feedReducer(initialFeedState, {
    type: 'feed/loadStart',
    page: 1
  });
  const failed = feedReducer(loading, {
    type: 'feed/loadError',
    message: 'Feed could not be loaded.'
  });

  assert.equal(failed.initialLoading, false);
  assert.equal(failed.error, 'Feed could not be loaded.');
});

test('feed pagination metadata controls next-page detection', () => {
  assert.equal(hasNextFeedPage(feedResponse([post(1)], 1, 2)), true);
  assert.equal(hasNextFeedPage(feedResponse([post(1)], 2, 2)), false);
});

test('next-page requests wait for initial posts and no active feed request', () => {
  assert.equal(canRequestNextFeedPage(initialFeedState, 0), false);

  const loaded = feedReducer(initialFeedState, {
    type: 'feed/loadSuccess',
    response: feedResponse([post(1)], 1, 2)
  });

  assert.equal(canRequestNextFeedPage(loaded, 1), false);
  assert.equal(canRequestNextFeedPage(loaded, 0), true);
});

test('mergeUniquePosts preserves existing order while adding new ids', () => {
  assert.deepEqual(
    mergeUniquePosts([post(1), post(2)], [post(1), post(3)]).map((item) => item.id),
    [1, 2, 3]
  );
});

test('reaction success records visible feedback and clears pending state', () => {
  const pending = feedReducer(initialFeedState, {
    type: 'reaction/start',
    postId: 10
  });
  const succeeded = feedReducer(pending, {
    type: 'reaction/success',
    postId: 10
  });
  const finished = feedReducer(succeeded, {
    type: 'reaction/finish',
    postId: 10
  });

  assert.deepEqual(finished.reactingPostIds, []);
  assert.deepEqual(finished.reactedPostIds, [10]);
  assert.equal(finished.error, null);
});

test('reaction failure removes false success state and preserves recoverable message', () => {
  const withReaction = {
    ...initialFeedState,
    reactedPostIds: [11]
  };
  const failed = feedReducer(withReaction, {
    type: 'reaction/error',
    postId: 11,
    message: 'The API is unreachable.'
  });

  assert.deepEqual(failed.reactedPostIds, []);
  assert.equal(failed.error, 'The API is unreachable.');
});
