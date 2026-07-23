"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
exports.getApiErrorMessage = getApiErrorMessage;
exports.createApiClient = createApiClient;
class ApiError extends Error {
    status;
    kind;
    constructor(message, status, kind = 'unknown') {
        super(message);
        this.status = status;
        this.kind = kind;
    }
}
exports.ApiError = ApiError;
const DEFAULT_TIMEOUT_MS = 10000;
function getApiErrorMessage(error) {
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
function createApiClient(baseUrl, token, options = {}) {
    const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
    const fetchImpl = options.fetchImpl ?? fetch;
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    async function request(path, init = {}) {
        if (!token) {
            throw new ApiError('Missing Sanctum bearer token.', 401, 'auth');
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        let response;
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
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new ApiError('Request timed out.', undefined, 'timeout');
            }
            throw new ApiError(error instanceof Error ? error.message : 'Network request failed.', undefined, 'network');
        }
        finally {
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
            return undefined;
        }
        return (await response.json());
    }
    return {
        fetchFeed(page) {
            return request(`/api/feed?page=${page}`);
        },
        searchPosts(query) {
            return request(`/api/search?q=${encodeURIComponent(query)}`);
        },
        async reactToPost(postId) {
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
