export type Author = {
  id: number;
  name: string | null;
  avatar_url?: string | null;
};

export type CurrentUser = {
  id: number;
  name: string | null;
  email: string;
  avatar_url?: string | null;
};

export type ReactionKind = 'like' | 'support' | 'good_vibes';
export type InteractionSource = 'feed' | 'search';

export type RankingDebugComponent = {
  score: number;
  weight: number;
  contribution: number;
};

export type RankingDebug = {
  rank: number;
  final_score: number;
  components: {
    authenticity: RankingDebugComponent;
    relationship_depth: RankingDebugComponent;
    semantic_similarity: RankingDebugComponent;
    time_decay: RankingDebugComponent;
  };
};

export type Post = {
  id: number;
  author: Author;
  text: string;
  image_url: string | null;
  viewer_has_reacted?: boolean;
  viewer_reaction_kind?: ReactionKind | null;
  created_at: string | null;
  updated_at?: string | null;
  similarity_score?: number;
  ranking_debug?: RankingDebug | null;
  __feedPage?: number;
};

export type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links?: PaginationLink[];
};

export type FeedResponse = {
  data: Post[];
  meta: PaginationMeta;
  links?: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
};

export type SearchResponse = {
  data: Post[];
  meta?: {
    query?: string;
    limit?: number;
    embedding_mode?: string;
    temporal_filter?: unknown;
    search_event_id?: number | null;
  };
};
