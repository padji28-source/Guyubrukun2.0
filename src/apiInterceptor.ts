const cache = new Map<string, { data: string; timestamp: number }>();
const inflight = new Map<string, Promise<Response>>();
const CACHE_TTL = 10 * 60 * 1000;

const DEFAULT_FALLBACK_JSON = {
  data: [],
  users: [],
  notifications: [],
  acara: [],
  laporan: [],
  kas: [],
  media: []
};

function tryParseJson(text: string): any | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return null;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function attachSafeJsonParser(res: Response, url: string): Response {
  res.json = async () => {
    try {
      const cloned = res.clone();
      const text = await cloned.text();
      const parsed = tryParseJson(text);
      if (parsed !== null) {
        return parsed;
      }
      // Fallback to stale cache if available when rate limited or non-JSON returned
      const stale = cache.get(url);
      if (stale?.data) {
        const staleParsed = tryParseJson(stale.data);
        if (staleParsed !== null) {
          return staleParsed;
        }
      }
      return { ...DEFAULT_FALLBACK_JSON };
    } catch {
      const stale = cache.get(url);
      if (stale?.data) {
        const staleParsed = tryParseJson(stale.data);
        if (staleParsed !== null) {
          return staleParsed;
        }
      }
      return { ...DEFAULT_FALLBACK_JSON };
    }
  };
  return res;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(input: RequestInfo | URL, init: RequestInit, isGet: boolean, retries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(input, init);
    if (res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504) {
      if (attempt < retries) {
        await delay(600 * Math.pow(2, attempt));
        continue;
      }
      return res;
    }

    if (isGet) {
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const peek = await res.clone().text().catch(() => '');
        if (peek.includes('Rate exceeded') && attempt < retries) {
          await delay(600 * Math.pow(2, attempt));
          continue;
        }
      }
    }

    return res;
  }
  return fetch(input, init);
}

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const isGet = !init || !init.method || init.method.toUpperCase() === 'GET';
  const url = typeof input === 'string' ? input : input.toString();

  // Clear cache on mutations (POST, PUT, DELETE) unless it's a non-mutating action
  if (!isGet) {
    const isNonMutating =
      url.includes('/api/ping') ||
      url.includes('/api/notifications/read') ||
      url.includes('/api/logout') ||
      url.includes('/api/login') ||
      url.includes('/api/register') ||
      url.includes('/api/gemini') ||
      url.includes('/api/ai') ||
      url.includes('/api/chat') ||
      url.includes('/api/password');

    if (!isNonMutating) {
      cache.clear();
    }
  } else {
    // 1. Check cache
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const mockRes = new Response(cached.data, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      return attachSafeJsonParser(mockRes, url);
    }

    // 2. Check inflight requests
    if (inflight.has(url)) {
      const res = await inflight.get(url)!;
      const finalRes = res.clone();
      return attachSafeJsonParser(finalRes, url);
    }
  }

  const modifiedInit: RequestInit = { ...init };
  modifiedInit.headers = new Headers(init?.headers);
  const selectedRt = localStorage.getItem('selected_rt');
  if (selectedRt) {
    modifiedInit.headers.set('x-rt-id', selectedRt);
  }

  const authUser = localStorage.getItem('auth_user');
  if (authUser) {
    try {
      const userObj = JSON.parse(authUser);
      if (userObj.id) {
        modifiedInit.headers.set('x-user-id', userObj.id);
      }
      if (userObj.role) {
        modifiedInit.headers.set('x-user-role', userObj.role);
      }
      if (userObj.token) {
        modifiedInit.headers.set('Authorization', `Bearer ${userObj.token}`);
      }
    } catch {}
  }

  // Append updaterName to POST/PUT payloads automatically
  if (!isGet && modifiedInit.body && typeof modifiedInit.body === 'string') {
    try {
      const parsed = JSON.parse(modifiedInit.body);
      if (typeof parsed === 'object' && parsed !== null && !parsed.updaterName) {
        if (authUser) {
          const userObj = JSON.parse(authUser);
          parsed.updaterName = userObj.nama || userObj.username || 'Admin';
          modifiedInit.body = JSON.stringify(parsed);
        }
      }
    } catch {}
  }

  const fetchPromise = fetchWithRetry(input, modifiedInit, isGet)
    .then(async (res) => {
      if (isGet && res.ok) {
        const clonedForCache = res.clone();
        try {
          const text = await clonedForCache.text();
          if (tryParseJson(text) !== null) {
            cache.set(url, { data: text, timestamp: Date.now() });
          }
        } catch {}
      }

      return attachSafeJsonParser(res, url);
    })
    .finally(() => {
      if (isGet) {
        inflight.delete(url);
      }
    });

  if (isGet) {
    inflight.set(url, fetchPromise);
  }

  return fetchPromise;
};
