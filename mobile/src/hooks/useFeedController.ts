import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import { createApiClient } from '../api/client';
import { getApiErrorMessage } from '../api/client';
import type { ApiClient } from '../api/client';
import type { ReactionKind } from '../api/types';
import { config } from '../config/env';
import {
  canRequestNextFeedPage,
  canRequestPreviousFeedPage,
  feedReducer,
  flattenRetainedPages,
  initialFeedState
} from '../state/feedReducer';

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
    async (page: number, direction: 'initial' | 'next' | 'previous' = page === 1 ? 'initial' : 'next') => {
      if (page < 1 || loadingPagesRef.current.has(page)) {
        return;
      }

      if (direction === 'next' && state.lastServerPage !== null && page > state.lastServerPage) {
        return;
      }

      if (direction === 'previous' && state.firstRetainedPage !== null && page >= state.firstRetainedPage) {
        return;
      }

      loadingPagesRef.current.add(page);
      dispatch({ type: 'feed/loadStart', page, direction });

      try {
        const response = await apiClient.fetchFeed(page);
        if (mountedRef.current) {
          dispatch({ type: 'feed/loadSuccess', response, direction });
        }
      } catch (error) {
        if (mountedRef.current) {
          dispatch({
            type: 'feed/loadError',
            direction,
            message: getApiErrorMessage(error)
          });
        }
      } finally {
        loadingPagesRef.current.delete(page);
      }
    },
    [apiClient, state.firstRetainedPage, state.lastServerPage]
  );

  const refreshFeed = useCallback(() => {
    void loadFeedPage(1, 'initial');
  }, [loadFeedPage]);

  const loadNextPage = useCallback(() => {
    const nextPage = (state.lastRetainedPage ?? 0) + 1;
    if (canRequestNextFeedPage(state, loadingPagesRef.current.has(nextPage))) {
      void loadFeedPage(nextPage, 'next');
    }
  }, [
    loadFeedPage,
    state.retainedPages,
    state.initialLoading,
    state.lastRetainedPage,
    state.lastServerPage,
    state.loadingNext,
    state.mode,
  ]);

  const loadPreviousPage = useCallback(() => {
    const previousPage = (state.firstRetainedPage ?? 1) - 1;
    if (canRequestPreviousFeedPage(state, loadingPagesRef.current.has(previousPage))) {
      void loadFeedPage(previousPage, 'previous');
    }
  }, [
    loadFeedPage,
    state.firstRetainedPage,
    state.initialLoading,
    state.loadingPrevious,
    state.mode,
    state.retainedPages
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
    async (postId: number, reactionKind: ReactionKind) => {
      if (state.pendingReactions[postId]) {
        return;
      }

      const feedPosts = flattenRetainedPages(state.retainedPages);
      const post = [...feedPosts, ...state.searchPosts].find((item) => item.id === postId);
      const previousKind = post?.viewer_reaction_kind ?? null;
      const nextKind = previousKind === reactionKind ? null : reactionKind;

      dispatch({
        type: 'reaction/start',
        postId,
        mode: nextKind === null ? 'removing' : 'reacting',
        nextKind
      });

      try {
        if (nextKind) {
          await apiClient.reactToPost(postId, nextKind);
        } else {
          await apiClient.removeReaction(postId);
        }

        if (mountedRef.current) {
          dispatch({ type: 'reaction/success', postId, viewerReactionKind: nextKind });
        }
      } catch (error) {
        if (mountedRef.current) {
          dispatch({
            type: 'reaction/error',
            postId,
            previousKind,
            message: getApiErrorMessage(error)
          });
        }
      } finally {
        if (mountedRef.current) {
          dispatch({ type: 'reaction/finish', postId });
        }
      }
    },
    [apiClient, state.pendingReactions, state.retainedPages, state.searchPosts]
  );

  useEffect(() => {
    void loadFeedPage(1, 'initial');
    return () => {
      mountedRef.current = false;
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  return {
    state,
    displayedPosts: state.mode === 'search' ? state.searchPosts : flattenRetainedPages(state.retainedPages),
    loadNextPage,
    loadPreviousPage,
    refreshFeed,
    retryCurrentOperation,
    updateQuery,
    reactToPost
  };
}
