import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { handleRequest } from '../server/src/index.mjs';

const originalFetch = globalThis.fetch;
const allowedOrigin = 'https://app.example.com';

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function makeEnvironment({ userId = 'user-123', put = async () => {} } = {}) {
  return {
    SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: 'public-key',
    ALLOWED_ORIGINS: allowedOrigin,
    VIDEOS: { put },
    userId,
  };
}

function makeRequest({ origin = allowedOrigin, mimeType = 'video/mp4', token = 'valid-token' } = {}) {
  const form = new FormData();
  form.set('file', new File(['video-bytes'], 'recording.mp4', { type: mimeType }));
  return new Request('https://worker.example.com/api/recordings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Origin: origin },
    body: form,
  });
}

function mockAuthenticatedUser(userId = 'user-123') {
  globalThis.fetch = async () => new Response(JSON.stringify({ id: userId }), { status: 200 });
}

test('rejects requests without a valid Supabase session', async () => {
  globalThis.fetch = async () => new Response('{}', { status: 401 });
  let stored = false;
  const env = makeEnvironment({ put: async () => { stored = true; } });

  const result = await handleRequest(makeRequest(), env);
  assert.equal(result.status, 401);
  assert.equal(stored, false);
});

test('stores a video in the authenticated user namespace without exposing a public URL', async () => {
  mockAuthenticatedUser('user-456');
  let storedKey = '';
  let storedType = '';
  const env = makeEnvironment({
    userId: 'user-456',
    put: async (key, _body, options) => {
      storedKey = key;
      storedType = options.httpMetadata.contentType;
    },
  });

  const result = await handleRequest(makeRequest(), env);
  assert.equal(result.status, 204);
  assert.match(storedKey, /^user-456\/[\da-f-]+\.mp4$/i);
  assert.equal(storedType, 'video/mp4');
  assert.equal(await result.text(), '');
});

test('rejects origins outside the configured allowlist', async () => {
  let authenticated = false;
  globalThis.fetch = async () => {
    authenticated = true;
    return new Response('{}', { status: 200 });
  };

  const result = await handleRequest(makeRequest({ origin: 'https://attacker.example' }), makeEnvironment());
  assert.equal(result.status, 403);
  assert.equal(authenticated, false);
});

test('rejects unsupported content types', async () => {
  mockAuthenticatedUser();
  const result = await handleRequest(makeRequest({ mimeType: 'text/plain' }), makeEnvironment());
  assert.equal(result.status, 415);
});

test('reports R2 failures as a generic storage error', async () => {
  mockAuthenticatedUser();
  const env = makeEnvironment({ put: async () => { throw new Error('internal bucket detail'); } });
  const result = await handleRequest(makeRequest(), env);
  assert.equal(result.status, 502);
  assert.deepEqual(await result.json(), { error: 'Video storage is unavailable.' });
});
