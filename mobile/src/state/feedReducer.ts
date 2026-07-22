import type { FeedResponse, Post } from '../api/types';

export type FeedMode = 'feed' | 'search';

export type FeedState = {
  feedPosts: Post[];
  searchPosts: Post[];
  mode: FeedMode;
  query: string;
  page: number;
  hasNextPage: boolean;
  initialLoading: boolean;
  paginationLoading: boolean;
  searchLoading: boolean;
  error: string | null;
  reactingPostIds: number[];
};

export const initialFeedState: FeedState = {
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
  reactingPostIds: []
};

export function mergeUniquePosts(existing: Post[], incoming: Post[]): Post[] {
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

export function hasNextFeedPage(response: FeedResponse): boolean {
  return response.meta.current_page < response.meta.last_page;
}

export type FeedAction =
  | { type: 'feed/loadStart'; page: number }
  | { type: 'feed/loadSuccess'; response: FeedResponse }
  | { type: 'feed/loadError'; message: string }
  | { type: 'search/queryChanged'; query: string }
  | { type: 'search/start' }
  | { type: 'search/success'; posts: Post[] }
  | { type: 'search/error'; message: string }
  | { type: 'reaction/start'; postId: number }
  | { type: 'reaction/finish'; postId: number }
  | { type: 'error/clear' };

export function feedReducer(state: FeedState, action: FeedAction): FeedState {
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
        feedPosts:
          action.response.meta.current_page === 1
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
      return {
        ...state,
        searchPosts: action.posts,
        searchLoading: false,
        error: null
      };
    case 'search/error':
      return {
        ...state,
        searchLoading: false,
        error: action.message
      };
    case 'reaction/start':
      return {
        ...state,
        reactingPostIds: state.reactingPostIds.includes(action.postId)
          ? state.reactingPostIds
          : [...state.reactingPostIds, action.postId]
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
