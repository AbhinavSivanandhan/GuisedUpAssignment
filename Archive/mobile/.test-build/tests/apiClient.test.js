"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const client_js_1 = require("../src/api/client.js");
function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
(0, node_test_1.default)('API client maps unauthenticated responses to actionable auth errors', async () => {
    const client = (0, client_js_1.createApiClient)('http://localhost:8000', 'token', {
        fetchImpl: async () => jsonResponse({ message: 'Unauthenticated.' }, 401)
    });
    await strict_1.default.rejects(client.fetchFeed(1), (error) => {
        strict_1.default.equal(error instanceof client_js_1.ApiError, true);
        strict_1.default.equal(error.kind, 'auth');
        strict_1.default.match((0, client_js_1.getApiErrorMessage)(error), /Authentication failed/);
        return true;
    });
});
(0, node_test_1.default)('API client maps unreachable API failures to network errors', async () => {
    const client = (0, client_js_1.createApiClient)('http://localhost:8000', 'token', {
        fetchImpl: async () => {
            throw new TypeError('Failed to fetch');
        }
    });
    await strict_1.default.rejects(client.searchPosts('travel'), (error) => {
        strict_1.default.equal(error instanceof client_js_1.ApiError, true);
        strict_1.default.equal(error.kind, 'network');
        strict_1.default.match((0, client_js_1.getApiErrorMessage)(error), /unreachable/);
        return true;
    });
});
(0, node_test_1.default)('API client times out slow requests', async () => {
    const client = (0, client_js_1.createApiClient)('http://localhost:8000', 'token', {
        timeoutMs: 1,
        fetchImpl: (_url, init) => new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'));
            });
        })
    });
    await strict_1.default.rejects(client.fetchFeed(1), (error) => {
        strict_1.default.equal(error instanceof client_js_1.ApiError, true);
        strict_1.default.equal(error.kind, 'timeout');
        strict_1.default.match((0, client_js_1.getApiErrorMessage)(error), /too long/);
        return true;
    });
});
