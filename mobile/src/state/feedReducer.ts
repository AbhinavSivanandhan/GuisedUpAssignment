import type { FeedResponse, Post, ReactionKind } from '../api/types';

export type FeedMode = 'feed' | 'search';
export type FeedLoadDirection = 'initial' | 'next' | 'previous';
export type ReactionPendingMode = 'reacting' | 'removing';

export const FEED_PAGE_RETAIN_LIMIT = 5;

export type RetainedFeedPage = {
  page: number;
  posts: Post[];
};

export type FeedState = {
  retainedPages: RetainedFeedPage[];
  searchPosts: Post[];
  mode: FeedMode;
  query: string;
  firstRetainedPage: number | null;
  lastRetainedPage: number | null;
  lastServerPage: number | null;
  totalServerPosts: number;
  loadingPrevious: boolean;
  loadingNext: boolean;
  initialLoading: boolean;
  searchLoading: boolean;
  releasedBefore: boolean;
  releasedAfter: boolean;
  error: string | null;
  pendingReactions: Record<number, ReactionPendingMode>;
};

export const initialFeedState: FeedState = {
  retainedPages: [],
  searchPosts: [],
  mode: 'feed',
  query: '',
  firstRetainedPage: null,
  lastRetainedPage: null,
  lastServerPage: null,
  totalServerPosts: 0,
  loadingPrevious: false,
  loadingNext: false,
  initialLoading: false,
  searchLoading: false,
  releasedBefore: false,
  releasedAfter: false,
  error: null,
  pendingReactions: {}
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

export function flattenRetainedPages(pages: RetainedFeedPage[]): Post[] {
  return pages.flatMap((page) => page.posts);
}

export function retainedPostCount(state: FeedState): number {
  return flattenRetainedPages(state.retainedPages).length;
}

function markPagePosts(posts: Post[], page: number): Post[] {
  const seen = new Set<number>();

  return posts
    .filter((post) => {
      if (seen.has(post.id)) {
        return false;
      }

      seen.add(post.id);
      return true;
    })
    .map((post) => ({
      ...post,
      __feedPage: page
    }));
}

function upsertPage(
  pages: RetainedFeedPage[],
  page: number,
  posts: Post[],
  direction: FeedLoadDirection
): RetainedFeedPage[] {
  const incomingIds = new Set(posts.map((post) => post.id));
  const withoutSamePageOrDuplicates = pages
    .filter((retainedPage) => retainedPage.page !== page)
    .map((retainedPage) => ({
      ...retainedPage,
      posts: retainedPage.posts.filter((post) => !incomingIds.has(post.id))
    }));
  const nextPage = { page, posts: markPagePosts(posts, page) };
  const merged =
    direction === 'previous'
      ? [nextPage, ...withoutSamePageOrDuplicates]
      : [...withoutSamePageOrDuplicates, nextPage];

  return merged.sort((left, right) => left.page - right.page);
}

function prunePages(
  pages: RetainedFeedPage[],
  direction: FeedLoadDirection
): { pages: RetainedFeedPage[]; releasedBefore: boolean; releasedAfter: boolean } {
  if (pages.length <= FEED_PAGE_RETAIN_LIMIT) {
    return { pages, releasedBefore: false, releasedAfter: false };
  }

  if (direction === 'previous') {
    return {
      pages: pages.slice(0, FEED_PAGE_RETAIN_LIMIT),
      releasedBefore: false,
      releasedAfter: true
    };
  }

  return {
    pages: pages.slice(-FEED_PAGE_RETAIN_LIMIT),
    releasedBefore: true,
    releasedAfter: false
  };
}

function pageBounds(pages: RetainedFeedPage[]): Pick<FeedState, 'firstRetainedPage' | 'lastRetainedPage'> {
  if (pages.length === 0) {
    return { firstRetainedPage: null, lastRetainedPage: null };
  }

  return {
    firstRetainedPage: pages[0]?.page ?? null,
    lastRetainedPage: pages[pages.length - 1]?.page ?? null
  };
}

export function canRequestNextFeedPage(state: FeedState, targetPagePending: boolean): boolean {
  return (
    state.mode === 'feed' &&
    retainedPostCount(state) > 0 &&
    state.lastRetainedPage !== null &&
    state.lastServerPage !== null &&
    state.lastRetainedPage < state.lastServerPage &&
    !state.loadingNext &&
    !state.initialLoading &&
    !targetPagePending
  );
}

export function canRequestPreviousFeedPage(state: FeedState, targetPagePending: boolean): boolean {
  return (
    state.mode === 'feed' &&
    retainedPostCount(state) > 0 &&
    state.firstRetainedPage !== null &&
    state.firstRetainedPage > 1 &&
    !state.loadingPrevious &&
    !state.initialLoading &&
    !targetPagePending
  );
}

export type FeedAction =
  | { type: 'feed/loadStart'; page: number; direction: FeedLoadDirection }
  | { type: 'feed/loadSuccess'; response: FeedResponse; direction: FeedLoadDirection }
  | { type: 'feed/loadError'; direction: FeedLoadDirection; message: string }
  | { type: 'search/queryChanged'; query: string }
  | { type: 'search/start' }
  | { type: 'search/success'; query: string; posts: Post[] }
  | { type: 'search/error'; query: string; message: string }
  | { type: 'reaction/start'; postId: number; mode: ReactionPendingMode; nextKind: ReactionKind | null }
  | { type: 'reaction/success'; postId: number; viewerReactionKind: ReactionKind | null }
  | { type: 'reaction/error'; postId: number; previousKind: ReactionKind | null; message: string }
  | { type: 'reaction/finish'; postId: number }
  | { type: 'error/clear' };

function updatePostReaction(posts: Post[], postId: number, kind: ReactionKind | null): Post[] {
  return posts.map((post) =>
    post.id === postId
      ? { ...post, viewer_has_reacted: kind !== null, viewer_reaction_kind: kind }
      : post
  );
}

function updatePageReactions(pages: RetainedFeedPage[], postId: number, kind: ReactionKind | null): RetainedFeedPage[] {
  return pages.map((page) => ({
    ...page,
    posts: updatePostReaction(page.posts, postId, kind)
  }));
}

export function feedReducer(state: FeedState, action: FeedAction): FeedState {
  switch (action.type) {
    case 'feed/loadStart':
      return {
        ...state,
        initialLoading: action.direction === 'initial',
        loadingNext: action.direction === 'next',
        loadingPrevious: action.direction === 'previous',
        error: null
      };
    case 'feed/loadSuccess': {
      const page = action.response.meta.current_page;
      const lastServerPage = action.response.meta.last_page;
      const totalServerPosts = action.response.meta.total;

      if (action.direction === 'initial' || page === 1) {
        const retainedPages = [{ page, posts: markPagePosts(action.response.data, page) }];

        return {
          ...state,
          retainedPages,
          ...pageBounds(retainedPages),
          lastServerPage,
          totalServerPosts,
          releasedBefore: false,
          releasedAfter: lastServerPage > page && retainedPages.length >= FEED_PAGE_RETAIN_LIMIT,
          initialLoading: false,
          loadingNext: false,
          loadingPrevious: false,
          error: null
        };
      }

      const mergedPages = upsertPage(state.retainedPages, page, action.response.data, action.direction);
      const pruned = prunePages(mergedPages, action.direction);
      const retainedPages = pruned.pages;

      return {
        ...state,
        retainedPages,
        ...pageBounds(retainedPages),
        lastServerPage,
        totalServerPosts,
        releasedBefore: pruned.releasedBefore || (retainedPages[0]?.page ?? 1) > 1,
        releasedAfter:
          pruned.releasedAfter ||
          (lastServerPage !== null && (retainedPages[retainedPages.length - 1]?.page ?? lastServerPage) < lastServerPage),
        initialLoading: false,
        loadingNext: false,
        loadingPrevious: false,
        error: null
      };
    }
    case 'feed/loadError':
      return {
        ...state,
        initialLoading: false,
        loadingNext: action.direction === 'next' ? false : state.loadingNext,
        loadingPrevious: action.direction === 'previous' ? false : state.loadingPrevious,
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
        pendingReactions: {
          ...state.pendingReactions,
          [action.postId]: action.mode
        },
        retainedPages: updatePageReactions(state.retainedPages, action.postId, action.nextKind),
        searchPosts: updatePostReaction(state.searchPosts, action.postId, action.nextKind)
      };
    case 'reaction/success':
      return {
        ...state,
        retainedPages: updatePageReactions(state.retainedPages, action.postId, action.viewerReactionKind),
        searchPosts: updatePostReaction(state.searchPosts, action.postId, action.viewerReactionKind)
      };
    case 'reaction/error':
      return {
        ...state,
        error: action.message,
        retainedPages: updatePageReactions(state.retainedPages, action.postId, action.previousKind),
        searchPosts: updatePostReaction(state.searchPosts, action.postId, action.previousKind)
      };
    case 'reaction/finish': {
      const { [action.postId]: _finished, ...remainingPendingReactions } = state.pendingReactions;

      return {
        ...state,
        pendingReactions: remainingPendingReactions
      };
    }
    case 'error/clear':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
}
