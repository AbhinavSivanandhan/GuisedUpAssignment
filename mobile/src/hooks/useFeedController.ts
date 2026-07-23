import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { createApiClient } from '../api/client';
import { getApiErrorMessage } from '../api/client';
import type { ApiClient } from '../api/client';
import type { CurrentUser, ReactionKind } from '../api/types';
import { config } from '../config/env';
import { QUALIFIED_VIEW_MINIMUM_MS, qualifiedViewKey } from '../feed/qualifiedViews';
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
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const mountedRef = useRef(true);
  const stateRef = useRef(state);
  const loadingPagesRef = useRef(new Set<number>());
  const searchRequestRef = useRef(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loggedViewsRef = useRef(new Set<string>());
  const apiClient = useMemo(
    () => options.apiClient ?? createApiClient(config.apiBaseUrl, config.developmentToken),
    [options.apiClient]
  );

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
              dispatch({
                type: 'search/success',
                query: trimmed,
                posts: response.data,
                searchEventId: response.meta?.search_event_id ?? null
              });
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
      const interactionState = stateRef.current;
      const source = interactionState.mode === 'search' && interactionState.searchEventId ? 'search' : 'feed';
      const searchEventId = source === 'search' ? interactionState.searchEventId : null;

      dispatch({
        type: 'reaction/start',
        postId,
        mode: nextKind === null ? 'removing' : 'reacting',
        nextKind
      });

      try {
        if (nextKind) {
          await apiClient.reactToPost(postId, nextKind, {
            source,
            searchEventId
          });
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

  const recordQualifiedViews = useCallback(
    (postIds: number[]) => {
      const currentState = stateRef.current;
      const source = currentState.mode === 'search' && currentState.searchEventId ? 'search' : 'feed';
      const searchEventId = source === 'search' ? currentState.searchEventId : null;

      for (const postId of postIds) {
        const key = qualifiedViewKey(source, searchEventId, postId);
        if (loggedViewsRef.current.has(key)) {
          continue;
        }

        loggedViewsRef.current.add(key);
        apiClient
          .recordView(postId, {
            source,
            searchEventId,
            visibleDurationMs: QUALIFIED_VIEW_MINIMUM_MS
          })
          .catch((error) => {
            if (config.developerMode) {
              console.warn('Qualified view write failed.', getApiErrorMessage(error));
            }
          });
      }
    },
    [apiClient]
  );

  useEffect(() => {
    void loadFeedPage(1, 'initial');

    if (config.developerMode) {
      apiClient
        .fetchCurrentUser()
        .then((user) => {
          if (mountedRef.current) {
            setCurrentUser(user);
          }
        })
        .catch(() => {
          if (mountedRef.current) {
            setCurrentUser(null);
          }
        });
    }

    return () => {
      mountedRef.current = false;
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  return {
    state,
    currentUser,
    displayedPosts: state.mode === 'search' ? state.searchPosts : flattenRetainedPages(state.retainedPages),
    loadNextPage,
    loadPreviousPage,
    refreshFeed,
    retryCurrentOperation,
    updateQuery,
    recordQualifiedViews,
    reactToPost
  };
}
