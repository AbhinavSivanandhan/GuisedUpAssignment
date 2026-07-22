import type { FeedResponse, SearchResponse } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
  }
}

export type ApiClient = {
  fetchFeed(page: number): Promise<FeedResponse>;
  searchPosts(query: string): Promise<SearchResponse>;
  reactToPost(postId: number): Promise<void>;
};

export function createApiClient(baseUrl: string, token: string): ApiClient {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!token) {
      throw new ApiError('Missing Sanctum bearer token.');
    }

    const response = await fetch(`${normalizedBaseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init.headers ?? {})
      }
    });

    if (!response.ok) {
      throw new ApiError(`Request failed with status ${response.status}.`, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  return {
    fetchFeed(page: number) {
      return request<FeedResponse>(`/api/feed?page=${page}`);
    },
    searchPosts(query: string) {
      return request<SearchResponse>(`/api/search?q=${encodeURIComponent(query)}`);
    },
    async reactToPost(postId: number) {
      await request('/api/interactions', {
        method: 'POST',
        body: JSON.stringify({
          post_id: postId,
          type: 'reaction'
        })
      });
    }
  };
}
