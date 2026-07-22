import { useCallback, useEffect, useMemo, useReducer } from 'react';

import { createApiClient } from '../api/client';
import type { ApiClient } from '../api/client';
import { config } from '../config/env';
import { feedReducer, initialFeedState } from '../state/feedReducer';

type UseFeedControllerOptions = {
  apiClient?: ApiClient;
};

export function useFeedController(options: UseFeedControllerOptions = {}) {
  const [state, dispatch] = useReducer(feedReducer, initialFeedState);
  const apiClient = useMemo(
    () => options.apiClient ?? createApiClient(config.apiBaseUrl, config.developmentToken),
    [options.apiClient]
  );

  const loadFeedPage = useCallback(
    async (page: number) => {
      if (page > 1 && (!state.hasNextPage || state.paginationLoading)) {
        return;
      }

      dispatch({ type: 'feed/loadStart', page });

      try {
        const response = await apiClient.fetchFeed(page);
        dispatch({ type: 'feed/loadSuccess', response });
      } catch (error) {
        dispatch({
          type: 'feed/loadError',
          message: error instanceof Error ? error.message : 'Feed could not be loaded.'
        });
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
        return;
      }

      dispatch({ type: 'search/start' });
      apiClient
        .searchPosts(trimmed)
        .then((response) => {
          dispatch({ type: 'search/success', posts: response.data });
        })
        .catch((error) => {
          dispatch({
            type: 'search/error',
            message: error instanceof Error ? error.message : 'Search could not be loaded.'
          });
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
        dispatch({
          type: 'feed/loadError',
          message: error instanceof Error ? error.message : 'Reaction could not be saved.'
        });
      } finally {
        dispatch({ type: 'reaction/finish', postId });
      }
    },
    [apiClient]
  );

  useEffect(() => {
    void loadFeedPage(1);
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
