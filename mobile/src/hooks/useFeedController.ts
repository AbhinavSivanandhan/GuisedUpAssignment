import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import { createApiClient } from '../api/client';
import type { ApiClient } from '../api/client';
import { config } from '../config/env';
import { feedReducer, initialFeedState } from '../state/feedReducer';

type UseFeedControllerOptions = {
  apiClient?: ApiClient;
};

export function useFeedController(options: UseFeedControllerOptions = {}) {
  const [state, dispatch] = useReducer(feedReducer, initialFeedState);
  const mountedRef = useRef(true);
  const loadingPagesRef = useRef(new Set<number>());
  const searchRequestRef = useRef(0);
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
            message: error instanceof Error ? error.message : 'Feed could not be loaded.'
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
    if (state.mode === 'feed' && state.hasNextPage && !state.paginationLoading && !state.initialLoading) {
      void loadFeedPage(state.page + 1);
    }
  }, [loadFeedPage, state.hasNextPage, state.initialLoading, state.mode, state.page, state.paginationLoading]);

  const updateQuery = useCallback(
    (query: string) => {
      dispatch({ type: 'search/queryChanged', query });

      const trimmed = query.trim();
      if (trimmed === '') {
        searchRequestRef.current += 1;
        return;
      }

      const requestId = searchRequestRef.current + 1;
      searchRequestRef.current = requestId;
      dispatch({ type: 'search/start' });
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
              message: error instanceof Error ? error.message : 'Search could not be loaded.'
            });
          }
        });
    },
    [apiClient]
  );

  const reactToPost = useCallback(
    async (postId: number) => {
      dispatch({ type: 'reaction/start', postId });

      try {
        await apiClient.reactToPost(postId);
      } catch (error) {
        if (mountedRef.current) {
          dispatch({
            type: 'feed/loadError',
            message: error instanceof Error ? error.message : 'Reaction could not be saved.'
          });
        }
      } finally {
        if (mountedRef.current) {
          dispatch({ type: 'reaction/finish', postId });
        }
      }
    },
    [apiClient]
  );

  useEffect(() => {
    void loadFeedPage(1);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    state,
    displayedPosts: state.mode === 'search' ? state.searchPosts : state.feedPosts,
    loadNextPage,
    refreshFeed,
    updateQuery,
    reactToPost
  };
}
