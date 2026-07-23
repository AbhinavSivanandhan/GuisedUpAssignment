import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import { createApiClient } from '../api/client';
import { getApiErrorMessage } from '../api/client';
import type { ApiClient } from '../api/client';
import { config } from '../config/env';
import { canRequestNextFeedPage, feedReducer, initialFeedState } from '../state/feedReducer';

type UseFeedControllerOptions = {
  apiClient?: ApiClient;
};

export function useFeedController(options: UseFeedControllerOptions = {}) {
  const [state, dispatch] = useReducer(feedReducer, initialFeedState);
  const mountedRef = useRef(true);
  const loadingPagesRef = useRef(new Set<number>());
  const searchRequestRef = useRef(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiClient = useMemo(
    () => options.apiClient ?? createApiClient(config.apiBaseUrl, config.developmentToken),
    [options.apiClient]
  );

  const loadFeedPage = useCallback(
    async (page: number) => {
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
      } catch (error) {
        if (mountedRef.current) {
          dispatch({
            type: 'feed/loadError',
            message: getApiErrorMessage(error)
          });
        }
      } finally {
        loadingPagesRef.current.delete(page);
      }
    },
    [apiClient, state.hasNextPage, state.paginationLoading]
  );

  const refreshFeed = useCallback(() => {
    void loadFeedPage(1);
  }, [loadFeedPage]);

  const loadNextPage = useCallback(() => {
    if (canRequestNextFeedPage(state, loadingPagesRef.current.size)) {
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

  const updateQuery = useCallback(
    (query: string) => {
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
                message: getApiErrorMessage(error)
              });
            }
          });
      }, 350);
    },
    [apiClient]
  );

  const retryCurrentOperation = useCallback(() => {
    const trimmed = state.query.trim();
    if (state.mode === 'search' && trimmed !== '') {
      updateQuery(trimmed);
      return;
    }

    void loadFeedPage(1);
  }, [loadFeedPage, state.mode, state.query, updateQuery]);

  const reactToPost = useCallback(
    async (postId: number) => {
      if (state.reactingPostIds.includes(postId)) {
        return;
      }

      dispatch({ type: 'reaction/start', postId });

      try {
        await apiClient.reactToPost(postId);
        if (mountedRef.current) {
          dispatch({ type: 'reaction/success', postId });
        }
      } catch (error) {
        if (mountedRef.current) {
          dispatch({
            type: 'reaction/error',
            postId,
            message: getApiErrorMessage(error)
          });
        }
      } finally {
        if (mountedRef.current) {
          dispatch({ type: 'reaction/finish', postId });
        }
      }
    },
    [apiClient, state.reactingPostIds]
  );

  useEffect(() => {
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
