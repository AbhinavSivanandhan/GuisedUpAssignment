"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const feedReducer_js_1 = require("../src/state/feedReducer.js");
function post(id) {
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
function feedResponse(data, currentPage, lastPage) {
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
(0, node_test_1.default)('pagination appends without duplicate posts', () => {
    const firstPage = (0, feedReducer_js_1.feedReducer)(feedReducer_js_1.initialFeedState, {
        type: 'feed/loadSuccess',
        response: feedResponse([post(1), post(2)], 1, 2)
    });
    const secondPage = (0, feedReducer_js_1.feedReducer)(firstPage, {
        type: 'feed/loadSuccess',
        response: feedResponse([post(2), post(3)], 2, 2)
    });
    strict_1.default.deepEqual(secondPage.feedPosts.map((item) => item.id), [1, 2, 3]);
    strict_1.default.equal(secondPage.hasNextPage, false);
});
(0, node_test_1.default)('search mode switches on query and clears back to feed mode', () => {
    const searching = (0, feedReducer_js_1.feedReducer)(feedReducer_js_1.initialFeedState, {
        type: 'search/queryChanged',
        query: 'travel stories'
    });
    strict_1.default.equal(searching.mode, 'search');
    const withResults = (0, feedReducer_js_1.feedReducer)(searching, {
        type: 'search/success',
        query: 'travel stories',
        posts: [post(4)]
    });
    strict_1.default.equal(withResults.searchPosts.length, 1);
    const cleared = (0, feedReducer_js_1.feedReducer)(withResults, {
        type: 'search/queryChanged',
        query: '   '
    });
    strict_1.default.equal(cleared.mode, 'feed');
    strict_1.default.equal(cleared.searchPosts.length, 0);
});
(0, node_test_1.default)('stale search success is ignored when the query changes', () => {
    const searching = (0, feedReducer_js_1.feedReducer)(feedReducer_js_1.initialFeedState, {
        type: 'search/queryChanged',
        query: 'travel stories'
    });
    const changed = (0, feedReducer_js_1.feedReducer)(searching, {
        type: 'search/queryChanged',
        query: 'coffee meetups'
    });
    const staleResult = (0, feedReducer_js_1.feedReducer)(changed, {
        type: 'search/success',
        query: 'travel stories',
        posts: [post(7)]
    });
    strict_1.default.equal(staleResult.query, 'coffee meetups');
    strict_1.default.equal(staleResult.searchPosts.length, 0);
});
(0, node_test_1.default)('stale search error is ignored after search is cleared', () => {
    const searching = (0, feedReducer_js_1.feedReducer)(feedReducer_js_1.initialFeedState, {
        type: 'search/queryChanged',
        query: 'travel stories'
    });
    const cleared = (0, feedReducer_js_1.feedReducer)(searching, {
        type: 'search/queryChanged',
        query: ''
    });
    const staleError = (0, feedReducer_js_1.feedReducer)(cleared, {
        type: 'search/error',
        query: 'travel stories',
        message: 'Search failed.'
    });
    strict_1.default.equal(staleError.mode, 'feed');
    strict_1.default.equal(staleError.error, null);
    strict_1.default.equal(staleError.searchLoading, false);
});
(0, node_test_1.default)('error handling clears loading flags and preserves recoverable message', () => {
    const loading = (0, feedReducer_js_1.feedReducer)(feedReducer_js_1.initialFeedState, {
        type: 'feed/loadStart',
        page: 1
    });
    const failed = (0, feedReducer_js_1.feedReducer)(loading, {
        type: 'feed/loadError',
        message: 'Feed could not be loaded.'
    });
    strict_1.default.equal(failed.initialLoading, false);
    strict_1.default.equal(failed.error, 'Feed could not be loaded.');
});
(0, node_test_1.default)('feed pagination metadata controls next-page detection', () => {
    strict_1.default.equal((0, feedReducer_js_1.hasNextFeedPage)(feedResponse([post(1)], 1, 2)), true);
    strict_1.default.equal((0, feedReducer_js_1.hasNextFeedPage)(feedResponse([post(1)], 2, 2)), false);
});
(0, node_test_1.default)('next-page requests wait for initial posts and no active feed request', () => {
    strict_1.default.equal((0, feedReducer_js_1.canRequestNextFeedPage)(feedReducer_js_1.initialFeedState, 0), false);
    const loaded = (0, feedReducer_js_1.feedReducer)(feedReducer_js_1.initialFeedState, {
        type: 'feed/loadSuccess',
        response: feedResponse([post(1)], 1, 2)
    });
    strict_1.default.equal((0, feedReducer_js_1.canRequestNextFeedPage)(loaded, 1), false);
    strict_1.default.equal((0, feedReducer_js_1.canRequestNextFeedPage)(loaded, 0), true);
});
(0, node_test_1.default)('mergeUniquePosts preserves existing order while adding new ids', () => {
    strict_1.default.deepEqual((0, feedReducer_js_1.mergeUniquePosts)([post(1), post(2)], [post(1), post(3)]).map((item) => item.id), [1, 2, 3]);
});
(0, node_test_1.default)('reaction success records visible feedback and clears pending state', () => {
    const pending = (0, feedReducer_js_1.feedReducer)(feedReducer_js_1.initialFeedState, {
        type: 'reaction/start',
        postId: 10
    });
    const succeeded = (0, feedReducer_js_1.feedReducer)(pending, {
        type: 'reaction/success',
        postId: 10
    });
    const finished = (0, feedReducer_js_1.feedReducer)(succeeded, {
        type: 'reaction/finish',
        postId: 10
    });
    strict_1.default.deepEqual(finished.reactingPostIds, []);
    strict_1.default.deepEqual(finished.reactedPostIds, [10]);
    strict_1.default.equal(finished.error, null);
});
(0, node_test_1.default)('reaction failure removes false success state and preserves recoverable message', () => {
    const withReaction = {
        ...feedReducer_js_1.initialFeedState,
        reactedPostIds: [11]
    };
    const failed = (0, feedReducer_js_1.feedReducer)(withReaction, {
        type: 'reaction/error',
        postId: 11,
        message: 'The API is unreachable.'
    });
    strict_1.default.deepEqual(failed.reactedPostIds, []);
    strict_1.default.equal(failed.error, 'The API is unreachable.');
});
