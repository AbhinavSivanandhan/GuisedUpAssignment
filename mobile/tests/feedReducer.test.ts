import assert from 'node:assert/strict';
import test from 'node:test';

import type { FeedResponse, Post, ReactionKind } from '../src/api/types.js';
import {
  FEED_PAGE_RETAIN_LIMIT,
  canRequestNextFeedPage,
  canRequestPreviousFeedPage,
  feedReducer,
  flattenRetainedPages,
  hasNextFeedPage,
  initialFeedState,
  mergeUniquePosts,
  retainedPostCount
} from '../src/state/feedReducer.js';

function post(id: number, reactionKind: ReactionKind | null = null): Post {
  return {
    id,
    author: {
      id: 100 + id,
      name: `Author ${id}`
    },
    text: `Post ${id}`,
    image_url: null,
    viewer_has_reacted: reactionKind !== null,
    viewer_reaction_kind: reactionKind,
    created_at: '2026-07-22T12:00:00.000000Z'
  };
}

function pagePosts(page: number, count = 20): Post[] {
  return Array.from({ length: count }, (_, index) => post(page * 100 + index + 1));
}

function feedResponse(data: Post[], currentPage: number, lastPage: number, total = 155): FeedResponse {
  return {
    data,
    meta: {
      current_page: currentPage,
      last_page: lastPage,
      per_page: 20,
      total
    }
  };
}

function loadPage(state = initialFeedState, page = 1, lastPage = 8, count = 20) {
  return feedReducer(state, {
    type: 'feed/loadSuccess',
    direction: page === 1 ? 'initial' : 'next',
    response: feedResponse(pagePosts(page, count), page, lastPage)
  });
}

test('pagination appends without duplicate posts', () => {
  const firstPage = feedReducer(initialFeedState, {
    type: 'feed/loadSuccess',
    direction: 'initial',
    response: feedResponse([post(1), post(2)], 1, 2, 3)
  });

  const secondPage = feedReducer(firstPage, {
    type: 'feed/loadSuccess',
    direction: 'next',
    response: feedResponse([post(2), post(3)], 2, 2, 3)
  });

  assert.deepEqual(
    flattenRetainedPages(secondPage.retainedPages).map((item) => item.id),
    [1, 2, 3]
  );
  assert.equal(secondPage.lastRetainedPage, 2);
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
    page: 1,
    direction: 'initial'
  });
  const failed = feedReducer(loading, {
    type: 'feed/loadError',
    direction: 'initial',
    message: 'Feed could not be loaded.'
  });

  assert.equal(failed.initialLoading, false);
  assert.equal(failed.error, 'Feed could not be loaded.');
});

test('feed pagination metadata controls next-page detection', () => {
  assert.equal(hasNextFeedPage(feedResponse([post(1)], 1, 2)), true);
  assert.equal(hasNextFeedPage(feedResponse([post(1)], 2, 2)), false);
});

test('next and previous page request guards are independently protected', () => {
  let loaded = loadPage(initialFeedState, 1, 3);
  loaded = loadPage(loaded, 2, 3);

  assert.equal(canRequestNextFeedPage(loaded, true), false);
  assert.equal(canRequestNextFeedPage(loaded, false), true);
  assert.equal(canRequestPreviousFeedPage(loaded, false), false);

  const middleWindow = {
    ...loaded,
    retainedPages: [
      { page: 2, posts: pagePosts(2) },
      { page: 3, posts: pagePosts(3) }
    ],
    firstRetainedPage: 2,
    lastRetainedPage: 3,
    lastServerPage: 8
  };

  assert.equal(canRequestPreviousFeedPage(middleWindow, true), false);
  assert.equal(canRequestPreviousFeedPage(middleWindow, false), true);
  assert.equal(canRequestNextFeedPage(middleWindow, false), true);
});

test('loading pages 1 through 8 retains pages 4 through 8 with a partial final page', () => {
  let state = initialFeedState;

  for (let page = 1; page <= 8; page++) {
    state = feedReducer(state, {
      type: 'feed/loadSuccess',
      direction: page === 1 ? 'initial' : 'next',
      response: feedResponse(pagePosts(page, page === 8 ? 15 : 20), page, 8, 155)
    });
  }

  assert.deepEqual(state.retainedPages.map((page) => page.page), [4, 5, 6, 7, 8]);
  assert.equal(retainedPostCount(state), 95);
  assert.equal(state.totalServerPosts, 155);
  assert.equal(state.releasedBefore, true);
  assert.equal(state.releasedAfter, false);
});

test('scrolling upward loads page three and restores a 100-post window', () => {
  let state = initialFeedState;

  for (let page = 1; page <= 8; page++) {
    state = feedReducer(state, {
      type: 'feed/loadSuccess',
      direction: page === 1 ? 'initial' : 'next',
      response: feedResponse(pagePosts(page, page === 8 ? 15 : 20), page, 8, 155)
    });
  }

  state = feedReducer(state, {
    type: 'feed/loadSuccess',
    direction: 'previous',
    response: feedResponse(pagePosts(3), 3, 8, 155)
  });

  assert.deepEqual(state.retainedPages.map((page) => page.page), [3, 4, 5, 6, 7]);
  assert.equal(retainedPostCount(state), FEED_PAGE_RETAIN_LIMIT * 20);
  assert.equal(state.releasedBefore, true);
  assert.equal(state.releasedAfter, true);
});

test('refresh resets retained pages to page one', () => {
  const loaded = loadPage(loadPage(initialFeedState, 1, 3), 2, 3);

  const refreshed = feedReducer(loaded, {
    type: 'feed/loadSuccess',
    direction: 'initial',
    response: feedResponse([post(9)], 1, 3, 41)
  });

  assert.deepEqual(refreshed.retainedPages.map((page) => page.page), [1]);
  assert.deepEqual(flattenRetainedPages(refreshed.retainedPages).map((item) => item.id), [9]);
  assert.equal(refreshed.releasedBefore, false);
  assert.equal(refreshed.totalServerPosts, 41);
});

test('mergeUniquePosts preserves existing order while adding new ids', () => {
  assert.deepEqual(
    mergeUniquePosts([post(1), post(2)], [post(1), post(3)]).map((item) => item.id),
    [1, 2, 3]
  );
});

test('reaction success records visible kind feedback and clears pending state', () => {
  const loaded = feedReducer(initialFeedState, {
    type: 'feed/loadSuccess',
    direction: 'initial',
    response: feedResponse([post(10)], 1, 1, 1)
  });
  const pending = feedReducer(loaded, {
    type: 'reaction/start',
    postId: 10,
    mode: 'reacting',
    nextKind: 'support'
  });
  const succeeded = feedReducer(pending, {
    type: 'reaction/success',
    postId: 10,
    viewerReactionKind: 'support'
  });
  const finished = feedReducer(succeeded, {
    type: 'reaction/finish',
    postId: 10
  });

  const reacted = flattenRetainedPages(finished.retainedPages)[0];
  assert.deepEqual(finished.pendingReactions, {});
  assert.equal(reacted?.viewer_has_reacted, true);
  assert.equal(reacted?.viewer_reaction_kind, 'support');
  assert.equal(finished.error, null);
});

test('reaction failure rolls back kind and preserves recoverable message', () => {
  const loaded = feedReducer(initialFeedState, {
    type: 'feed/loadSuccess',
    direction: 'initial',
    response: feedResponse([post(11, 'like')], 1, 1, 1)
  });
  const pending = feedReducer(loaded, {
    type: 'reaction/start',
    postId: 11,
    mode: 'removing',
    nextKind: null
  });
  const failed = feedReducer(pending, {
    type: 'reaction/error',
    postId: 11,
    previousKind: 'like',
    message: 'The API is unreachable.'
  });

  const rolledBack = flattenRetainedPages(failed.retainedPages)[0];
  assert.equal(rolledBack?.viewer_has_reacted, true);
  assert.equal(rolledBack?.viewer_reaction_kind, 'like');
  assert.equal(failed.error, 'The API is unreachable.');
});

test('reaction updates the same post in feed and search state', () => {
  const loaded = {
    ...feedReducer(initialFeedState, {
      type: 'feed/loadSuccess',
      direction: 'initial',
      response: feedResponse([post(12)], 1, 1, 1)
    }),
    mode: 'search' as const,
    query: 'travel',
    searchPosts: [post(12)]
  };

  const reacted = feedReducer(loaded, {
    type: 'reaction/success',
    postId: 12,
    viewerReactionKind: 'good_vibes'
  });

  const feedPost = flattenRetainedPages(reacted.retainedPages)[0];
  assert.equal(feedPost?.viewer_has_reacted, true);
  assert.equal(feedPost?.viewer_reaction_kind, 'good_vibes');
  assert.equal(reacted.searchPosts[0]?.viewer_reaction_kind, 'good_vibes');
});

test('reaction state survives page eviction and refetch through API hydration', () => {
  let state = initialFeedState;

  for (let page = 1; page <= 6; page++) {
    state = feedReducer(state, {
      type: 'feed/loadSuccess',
      direction: page === 1 ? 'initial' : 'next',
      response: feedResponse(pagePosts(page), page, 8, 155)
    });
  }

  assert.equal(flattenRetainedPages(state.retainedPages).some((item) => item.id === 101), false);

  state = feedReducer(state, {
    type: 'feed/loadSuccess',
    direction: 'previous',
    response: feedResponse([post(101, 'like'), ...pagePosts(1).slice(1)], 1, 8, 155)
  });

  const refetched = flattenRetainedPages(state.retainedPages).find((item) => item.id === 101);
  assert.equal(refetched?.viewer_has_reacted, true);
  assert.equal(refetched?.viewer_reaction_kind, 'like');
});
