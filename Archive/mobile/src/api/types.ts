export type Author = {
  id: number;
  name: string | null;
};

export type Post = {
  id: number;
  author: Author;
  text: string;
  image_url: string | null;
  created_at: string | null;
  updated_at?: string | null;
  similarity_score?: number;
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
  };
};
