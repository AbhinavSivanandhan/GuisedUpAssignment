import assert from 'node:assert/strict';
import test from 'node:test';

import { ApiError, createApiClient, getApiErrorMessage } from '../src/api/client.js';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

test('API client maps unauthenticated responses to actionable auth errors', async () => {
  const client = createApiClient('http://localhost:8000', 'token', {
    fetchImpl: async () => jsonResponse({ message: 'Unauthenticated.' }, 401)
  });

  await assert.rejects(client.fetchFeed(1), (error) => {
    assert.equal(error instanceof ApiError, true);
    assert.equal((error as ApiError).kind, 'auth');
    assert.match(getApiErrorMessage(error), /Authentication failed/);
    return true;
  });
});

test('API client maps unreachable API failures to network errors', async () => {
  const client = createApiClient('http://localhost:8000', 'token', {
    fetchImpl: async () => {
      throw new TypeError('Failed to fetch');
    }
  });

  await assert.rejects(client.searchPosts('travel'), (error) => {
    assert.equal(error instanceof ApiError, true);
    assert.equal((error as ApiError).kind, 'network');
    assert.match(getApiErrorMessage(error), /unreachable/);
    return true;
  });
});

test('API client times out slow requests', async () => {
  const client = createApiClient('http://localhost:8000', 'token', {
    timeoutMs: 1,
    fetchImpl: (_url, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      })
  });

  await assert.rejects(client.fetchFeed(1), (error) => {
    assert.equal(error instanceof ApiError, true);
    assert.equal((error as ApiError).kind, 'timeout');
    assert.match(getApiErrorMessage(error), /too long/);
    return true;
  });
});
