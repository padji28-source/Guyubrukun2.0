// Smart Stale-While-Revalidate API Interceptor with Granular Invalidation & Resource TTLs

interface CacheEntry {
  data: string;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<Response>>();

// Resource-specific TTL configuration in milliseconds
const RESOURCE_TTLS: Record<string, number> = {
  profile: 5 * 60 * 1000,          // 5 minutes
  'public/rt-list': 10 * 60 * 1000, // 10 minutes
  'menu-permissions': 10 * 60 * 1000,
  dashboard: 30 * 1000,             // 30 seconds
  kas: 20 * 1000,                   // 20 seconds
  iuran: 20 * 1000,                 // 20 seconds
  voting: 15 * 1000,                // 15 seconds
  notifications: 10 * 1000,         // 10 seconds
  warga: 60 * 1000,                 // 1 minute
  acara: 60 * 1000,
  laporan: 30 * 1000,
  surat: 30 * 1000,
  umkm: 60 * 1000,
  darurat: 5 * 60 * 1000,
  tamu: 60 * 1000,
  media: 60 * 1000,
  dokumen: 60 * 1000,
  inventaris: 60 * 1000,
  notulen: 60 * 1000,
  'audit-logs': 30 * 1000
};

export function getTtlForUrl(url: string): number {
  for (const [key, ttl] of Object.entries(RESOURCE_TTLS)) {
    if (url.includes(`/api/${key}`) || url.includes(`/api/data/${key}`)) {
      return ttl;
    }
  }
  return 30 * 1000; // Default 30s
}

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
    try {
      const res = await fetch(input, init);
      if (res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504) {
        if (attempt < retries) {
          await delay(500 * Math.pow(2, attempt));
          continue;
        }
        return res;
      }

      if (isGet) {
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const peek = await res.clone().text().catch(() => '');
          if (peek.includes('Rate exceeded') && attempt < retries) {
            await delay(500 * Math.pow(2, attempt));
            continue;
          }
        }
      }

      return res;
    } catch (netErr) {
      if (attempt < retries) {
        await delay(500 * Math.pow(2, attempt));
        continue;
      }
      throw netErr;
    }
  }
  return fetch(input, init);
}

// Granular cache invalidation: only clears entries related to the mutated resource
export function invalidateCacheForResource(resource: string) {
  const norm = resource.toLowerCase();
  for (const key of Array.from(cache.keys())) {
    if (key.includes(norm) || key.includes('/api/dashboard') || key.includes('/api/audit-logs')) {
      cache.delete(key);
    }
  }
}

export function invalidateAllCache() {
  cache.clear();
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function attemptTokenRefresh(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const authUserStr = localStorage.getItem('auth_user');
      if (!authUserStr) return null;
      const authUser = JSON.parse(authUserStr);
      const refreshToken = authUser?.refreshToken;
      if (!refreshToken) return null;

      const res = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken, userId: authUser.id })
      });

      if (res.ok) {
        const json = await res.json();
        const newToken = json.token || json.accessToken;
        if (newToken) {
          authUser.token = newToken;
          if (json.refreshToken) {
            authUser.refreshToken = json.refreshToken;
          }
          localStorage.setItem('auth_user', JSON.stringify(authUser));
          return newToken;
        }
      }
      return null;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const isGet = !init || !init.method || init.method.toUpperCase() === 'GET';
  const url = typeof input === 'string' ? input : input.toString();

  // Granular invalidation on mutations (POST, PUT, DELETE)
  if (!isGet) {
    const isNonMutating =
      url.includes('/api/ping') ||
      url.includes('/api/notifications/read') ||
      url.includes('/api/logout') ||
      url.includes('/api/login') ||
      url.includes('/api/register') ||
      url.includes('/api/refresh-token') ||
      url.includes('/api/gemini') ||
      url.includes('/api/ai') ||
      url.includes('/api/chat');

    if (!isNonMutating) {
      // Find matching resource and invalidate targeted cache
      let matched = false;
      for (const resKey of Object.keys(RESOURCE_TTLS)) {
        if (url.includes(resKey)) {
          invalidateCacheForResource(resKey);
          matched = true;
        }
      }
      if (!matched) {
        invalidateCacheForResource('dashboard');
      }
    }
  } else {
    // 1. Check cache with custom TTL
    const cached = cache.get(url);
    const ttl = cached?.ttl || getTtlForUrl(url);
    if (cached && Date.now() - cached.timestamp < ttl) {
      const mockRes = new Response(cached.data, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      return attachSafeJsonParser(mockRes, url);
    }

    // 2. Inflight deduplication
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

  const executeRequest = async (currentInit: RequestInit): Promise<Response> => {
    let res = await fetchWithRetry(input, currentInit, isGet);

    // Handle 401 token expiration with auto-refresh
    if (res.status === 401 && !url.includes('/api/login') && !url.includes('/api/register') && !url.includes('/api/refresh-token')) {
      const newToken = await attemptTokenRefresh();
      if (newToken) {
        const retryHeaders = new Headers(currentInit.headers);
        retryHeaders.set('Authorization', `Bearer ${newToken}`);
        const retryInit = { ...currentInit, headers: retryHeaders };
        res = await fetchWithRetry(input, retryInit, isGet);
      }
    }

    if (isGet && res.ok) {
      const clonedForCache = res.clone();
      try {
        const text = await clonedForCache.text();
        if (tryParseJson(text) !== null) {
          cache.set(url, {
            data: text,
            timestamp: Date.now(),
            ttl: getTtlForUrl(url)
          });
        }
      } catch {}
    }

    return attachSafeJsonParser(res, url);
  };

  const fetchPromise = executeRequest(modifiedInit).finally(() => {
    if (isGet) {
      inflight.delete(url);
    }
  });

  if (isGet) {
    inflight.set(url, fetchPromise);
  }

  return fetchPromise;
};
