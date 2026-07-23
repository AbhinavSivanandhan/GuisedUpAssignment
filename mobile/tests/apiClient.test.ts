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

test('API client removes a reaction through the post undo route', async () => {
  const calls: Array<{ url: string; method?: string }> = [];
  const client = createApiClient('http://localhost:8000', 'token', {
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), method: init?.method });
      return new Response(JSON.stringify({ data: { post_id: 42, viewer_has_reacted: false } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });

  await client.removeReaction(42);

  assert.deepEqual(calls, [
    {
      url: 'http://localhost:8000/api/posts/42/reaction',
      method: 'DELETE'
    }
  ]);
});

test('API client sends the selected reaction kind with reaction interactions', async () => {
  const calls: Array<{ url: string; method?: string; body?: unknown }> = [];
  const client = createApiClient('http://localhost:8000', 'token', {
    fetchImpl: async (url, init) => {
      calls.push({
        url: String(url),
        method: init?.method,
        body: init?.body ? JSON.parse(String(init.body)) : null
      });

      return new Response(JSON.stringify({ data: { id: 1 } }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });

  await client.reactToPost(42, 'good_vibes', { source: 'search', searchEventId: 99 });

  assert.deepEqual(calls, [
    {
      url: 'http://localhost:8000/api/interactions',
      method: 'POST',
      body: {
        post_id: 42,
        type: 'reaction',
        reaction_kind: 'good_vibes',
        source: 'search',
        search_event_id: 99
      }
    }
  ]);
});

test('API client logs qualified views with source and visible duration', async () => {
  const calls: Array<{ url: string; method?: string; body?: unknown }> = [];
  const client = createApiClient('http://localhost:8000', 'token', {
    fetchImpl: async (url, init) => {
      calls.push({
        url: String(url),
        method: init?.method,
        body: init?.body ? JSON.parse(String(init.body)) : null
      });

      return new Response(JSON.stringify({ data: { id: 1 } }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });

  await client.recordView(42, {
    source: 'feed',
    visibleDurationMs: 1500
  });

  assert.deepEqual(calls, [
    {
      url: 'http://localhost:8000/api/interactions',
      method: 'POST',
      body: {
        post_id: 42,
        type: 'view',
        source: 'feed',
        visible_duration_ms: 1500
      }
    }
  ]);
});
