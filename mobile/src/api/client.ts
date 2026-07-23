import type { FeedResponse, SearchResponse } from './types';

export type ApiErrorKind = 'auth' | 'validation' | 'timeout' | 'network' | 'server' | 'unknown';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly kind: ApiErrorKind = 'unknown'
  ) {
    super(message);
  }
}

type CreateApiClientOptions = {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

export type ApiClient = {
  fetchFeed(page: number): Promise<FeedResponse>;
  searchPosts(query: string): Promise<SearchResponse>;
  reactToPost(postId: number): Promise<void>;
};

const DEFAULT_TIMEOUT_MS = 10000;

export function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Something went wrong. Please try again.';
  }

  switch (error.kind) {
    case 'auth':
      return 'Authentication failed. Refresh the development token and retry.';
    case 'validation':
      return 'The request was not accepted. Check the input and try again.';
    case 'timeout':
      return 'The API took too long to respond. Check that Docker is running, then retry.';
    case 'network':
      return 'The API is unreachable. Check the API URL, Docker services, and network connection.';
    case 'server':
      return 'The API returned a server error. Retry after the backend is healthy.';
    default:
      return error.message;
  }
}

export function createApiClient(baseUrl: string, token: string, options: CreateApiClientOptions = {}): ApiClient {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!token) {
      throw new ApiError('Missing Sanctum bearer token.', 401, 'auth');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;

    try {
      response = await fetchImpl(`${normalizedBaseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(init.headers ?? {})
        }
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timed out.', undefined, 'timeout');
      }

      throw new ApiError(error instanceof Error ? error.message : 'Network request failed.', undefined, 'network');
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new ApiError(`Request failed with status ${response.status}.`, response.status, 'auth');
      }

      if (response.status === 422) {
        throw new ApiError(`Request failed with status ${response.status}.`, response.status, 'validation');
      }

      if (response.status >= 500) {
        throw new ApiError(`Request failed with status ${response.status}.`, response.status, 'server');
      }

      throw new ApiError(`Request failed with status ${response.status}.`, response.status, 'unknown');
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
