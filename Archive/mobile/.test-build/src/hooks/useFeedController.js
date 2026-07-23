"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFeedController = useFeedController;
const react_1 = require("react");
const client_1 = require("../api/client");
const client_2 = require("../api/client");
const env_1 = require("../config/env");
const feedReducer_1 = require("../state/feedReducer");
function useFeedController(options = {}) {
    const [state, dispatch] = (0, react_1.useReducer)(feedReducer_1.feedReducer, feedReducer_1.initialFeedState);
    const mountedRef = (0, react_1.useRef)(true);
    const loadingPagesRef = (0, react_1.useRef)(new Set());
    const searchRequestRef = (0, react_1.useRef)(0);
    const searchTimerRef = (0, react_1.useRef)(null);
    const apiClient = (0, react_1.useMemo)(() => options.apiClient ?? (0, client_1.createApiClient)(env_1.config.apiBaseUrl, env_1.config.developmentToken), [options.apiClient]);
    const loadFeedPage = (0, react_1.useCallback)(async (page) => {
        if (loadingPagesRef.current.has(page) || (page > 1 && (!state.hasNextPage || state.paginationLoading))) {
            return;
        }
        loadingPagesRef.current.add(page);
        dispatch({ type: 'feed/loadStart', page });
        try {
            const response = await apiClient.fetchFeed(page);
            if (mountedRef.current) {
                dispatch({ type: 'feed/loadSuccess', response });
            }
        }
        catch (error) {
            if (mountedRef.current) {
                dispatch({
                    type: 'feed/loadError',
                    message: (0, client_2.getApiErrorMessage)(error)
                });
            }
        }
        finally {
            loadingPagesRef.current.delete(page);
        }
    }, [apiClient, state.hasNextPage, state.paginationLoading]);
    const refreshFeed = (0, react_1.useCallback)(() => {
        void loadFeedPage(1);
    }, [loadFeedPage]);
    const loadNextPage = (0, react_1.useCallback)(() => {
        if ((0, feedReducer_1.canRequestNextFeedPage)(state, loadingPagesRef.current.size)) {
            void loadFeedPage(state.page + 1);
        }
    }, [
        loadFeedPage,
        state.feedPosts.length,
        state.hasNextPage,
        state.initialLoading,
        state.mode,
        state.page,
        state.paginationLoading
    ]);
    const updateQuery = (0, react_1.useCallback)((query) => {
        dispatch({ type: 'search/queryChanged', query });
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
            searchTimerRef.current = null;
        }
        const trimmed = query.trim();
        if (trimmed === '') {
            searchRequestRef.current += 1;
            return;
        }
        const requestId = searchRequestRef.current + 1;
        searchRequestRef.current = requestId;
        dispatch({ type: 'search/start' });
        searchTimerRef.current = setTimeout(() => {
            apiClient
                .searchPosts(trimmed)
                .then((response) => {
                if (mountedRef.current && searchRequestRef.current === requestId) {
                    dispatch({ type: 'search/success', query: trimmed, posts: response.data });
                }
            })
                .catch((error) => {
                if (mountedRef.current && searchRequestRef.current === requestId) {
                    dispatch({
                        type: 'search/error',
                        query: trimmed,
                        message: (0, client_2.getApiErrorMessage)(error)
                    });
                }
            });
        }, 350);
    }, [apiClient]);
    const retryCurrentOperation = (0, react_1.useCallback)(() => {
        const trimmed = state.query.trim();
        if (state.mode === 'search' && trimmed !== '') {
            updateQuery(trimmed);
            return;
        }
        void loadFeedPage(1);
    }, [loadFeedPage, state.mode, state.query, updateQuery]);
    const reactToPost = (0, react_1.useCallback)(async (postId) => {
        if (state.reactingPostIds.includes(postId)) {
            return;
        }
        dispatch({ type: 'reaction/start', postId });
        try {
            await apiClient.reactToPost(postId);
            if (mountedRef.current) {
                dispatch({ type: 'reaction/success', postId });
            }
        }
        catch (error) {
            if (mountedRef.current) {
                dispatch({
                    type: 'reaction/error',
                    postId,
                    message: (0, client_2.getApiErrorMessage)(error)
                });
            }
        }
        finally {
            if (mountedRef.current) {
                dispatch({ type: 'reaction/finish', postId });
            }
        }
    }, [apiClient, state.reactingPostIds]);
    (0, react_1.useEffect)(() => {
        void loadFeedPage(1);
        return () => {
            mountedRef.current = false;
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, []);
    return {
        state,
        displayedPosts: state.mode === 'search' ? state.searchPosts : state.feedPosts,
        loadNextPage,
        refreshFeed,
        retryCurrentOperation,
        updateQuery,
        reactToPost
    };
}
