"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialFeedState = void 0;
exports.mergeUniquePosts = mergeUniquePosts;
exports.hasNextFeedPage = hasNextFeedPage;
exports.canRequestNextFeedPage = canRequestNextFeedPage;
exports.feedReducer = feedReducer;
exports.initialFeedState = {
    feedPosts: [],
    searchPosts: [],
    mode: 'feed',
    query: '',
    page: 1,
    hasNextPage: true,
    initialLoading: false,
    paginationLoading: false,
    searchLoading: false,
    error: null,
    reactingPostIds: [],
    reactedPostIds: []
};
function mergeUniquePosts(existing, incoming) {
    const seen = new Set(existing.map((post) => post.id));
    const merged = [...existing];
    for (const post of incoming) {
        if (!seen.has(post.id)) {
            seen.add(post.id);
            merged.push(post);
        }
    }
    return merged;
}
function hasNextFeedPage(response) {
    return response.meta.current_page < response.meta.last_page;
}
function canRequestNextFeedPage(state, activeFeedRequests) {
    return (state.mode === 'feed' &&
        state.feedPosts.length > 0 &&
        state.hasNextPage &&
        !state.paginationLoading &&
        !state.initialLoading &&
        activeFeedRequests === 0);
}
function feedReducer(state, action) {
    switch (action.type) {
        case 'feed/loadStart':
            return {
                ...state,
                initialLoading: action.page === 1,
                paginationLoading: action.page > 1,
                error: null
            };
        case 'feed/loadSuccess':
            return {
                ...state,
                feedPosts: action.response.meta.current_page === 1
                    ? action.response.data
                    : mergeUniquePosts(state.feedPosts, action.response.data),
                page: action.response.meta.current_page,
                hasNextPage: hasNextFeedPage(action.response),
                initialLoading: false,
                paginationLoading: false,
                error: null
            };
        case 'feed/loadError':
            return {
                ...state,
                initialLoading: false,
                paginationLoading: false,
                error: action.message
            };
        case 'search/queryChanged': {
            const query = action.query;
            return {
                ...state,
                query,
                mode: query.trim() === '' ? 'feed' : 'search',
                searchPosts: query.trim() === '' ? [] : state.searchPosts,
                searchLoading: query.trim() === '' ? false : state.searchLoading,
                error: null
            };
        }
        case 'search/start':
            return {
                ...state,
                mode: 'search',
                searchLoading: true,
                error: null
            };
        case 'search/success':
            if (state.mode !== 'search' || state.query.trim() !== action.query) {
                return state;
            }
            return {
                ...state,
                searchPosts: action.posts,
                searchLoading: false,
                error: null
            };
        case 'search/error':
            if (state.mode !== 'search' || state.query.trim() !== action.query) {
                return state;
            }
            return {
                ...state,
                searchLoading: false,
                error: action.message
            };
        case 'reaction/start':
            return {
                ...state,
                error: null,
                reactingPostIds: state.reactingPostIds.includes(action.postId)
                    ? state.reactingPostIds
                    : [...state.reactingPostIds, action.postId]
            };
        case 'reaction/success':
            return {
                ...state,
                reactedPostIds: state.reactedPostIds.includes(action.postId)
                    ? state.reactedPostIds
                    : [...state.reactedPostIds, action.postId]
            };
        case 'reaction/error':
            return {
                ...state,
                error: action.message,
                reactedPostIds: state.reactedPostIds.filter((id) => id !== action.postId)
            };
        case 'reaction/finish':
            return {
                ...state,
                reactingPostIds: state.reactingPostIds.filter((id) => id !== action.postId)
            };
        case 'error/clear':
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
}
