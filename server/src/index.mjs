const MAX_UPLOAD_BYTES = 90 * 1024 * 1024;
const VIDEO_TYPES = new Map([
  ['video/mp4', 'mp4'],
  ['video/webm', 'webm'],
  ['video/quicktime', 'mov'],
]);

function allowedOrigin(origin, env) {
  return !origin || (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).includes(origin);
}

function response(body, status, origin) {
  const headers = new Headers({ 'Content-Type': 'application/json', 'Vary': 'Origin' });
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  }
  return new Response(body === null ? null : JSON.stringify(body), { status, headers });
}

async function findUserId(request, env) {
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ') || authorization.length > 8192) return null;

  const response = await fetch(`${env.SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_PUBLISHABLE_KEY,
      authorization,
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;
  const user = await response.json();
  return typeof user.id === 'string' ? user.id : null;
}

export async function handleRequest(request, env) {
  const origin = request.headers.get('Origin');
  if (!allowedOrigin(origin, env)) return response({ error: 'Origin not allowed.' }, 403);

  const url = new URL(request.url);
  if (url.pathname !== '/api/recordings') return response({ error: 'Not found.' }, 404, origin);
  if (request.method === 'OPTIONS') return response(null, 204, origin);
  if (request.method !== 'POST') return response({ error: 'Method not allowed.' }, 405, origin);
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY || !env.VIDEOS) {
    return response({ error: 'Video storage is not configured.' }, 503, origin);
  }

  const declaredLength = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_UPLOAD_BYTES) {
    return response({ error: 'Video is too large.' }, 413, origin);
  }

  let userId;
  try {
    userId = await findUserId(request, env);
  } catch {
    return response({ error: 'Authentication service is unavailable.' }, 503, origin);
  }
  if (!userId) return response({ error: 'Sign in to save a recording.' }, 401, origin);

  let file;
  try {
    file = (await request.formData()).get('file');
  } catch {
    return response({ error: 'Upload must contain a video file.' }, 400, origin);
  }
  if (!file || typeof file === 'string' || typeof file.stream !== 'function') {
    return response({ error: 'Upload must contain a video file.' }, 400, origin);
  }
  if (!VIDEO_TYPES.has(file.type)) return response({ error: 'Unsupported video format.' }, 415, origin);
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) return response({ error: 'Video is too large or empty.' }, 413, origin);

  const extension = VIDEO_TYPES.get(file.type);
  const key = `${userId}/${crypto.randomUUID()}.${extension}`;
  try {
    await env.VIDEOS.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  } catch {
    return response({ error: 'Video storage is unavailable.' }, 502, origin);
  }

  return response(null, 204, origin);
}

export default { fetch: handleRequest };
