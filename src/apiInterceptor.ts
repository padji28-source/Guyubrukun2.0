// In-memory cache + sessionStorage initialization for 0ms instant display
const cache = new Map<string, { data: string; timestamp: number }>();
try {
  const savedCache = sessionStorage.getItem('app_api_cache');
  if (savedCache) {
    const parsed = JSON.parse(savedCache);
    for (const [k, v] of Object.entries(parsed)) {
      cache.set(k, v as any);
    }
  }
} catch {}

const persistCache = () => {
  try {
    const obj: Record<string, any> = {};
    let count = 0;
    for (const [k, v] of cache.entries()) {
      if (count++ > 50) break;
      if (v.data && v.data.length < 50000) {
        obj[k] = v;
      }
    }
    sessionStorage.setItem('app_api_cache', JSON.stringify(obj));
  } catch {}
};

const inflight = new Map<string, Promise<Response>>();

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

// Granular cache invalidation: Only purge related caches, NEVER clear all caches
export function invalidateCacheForResource(url: string) {
  const targets: string[] = [];
  if (url.includes('/kas')) {
    targets.push('/kas', '/dashboard');
  } else if (url.includes('/warga') || url.includes('/users')) {
    targets.push('/warga', '/dashboard');
  } else if (url.includes('/acara')) {
    targets.push('/acara', '/dashboard');
  } else if (url.includes('/laporan')) {
    targets.push('/laporan', '/dashboard');
  } else if (url.includes('/iuran')) {
    targets.push('/iuran', '/kas', '/dashboard');
  } else if (url.includes('/voting')) {
    targets.push('/voting', '/dashboard');
  } else if (url.includes('/umkm')) {
    targets.push('/umkm');
  } else if (url.includes('/surat')) {
    targets.push('/surat', '/dashboard');
  } else if (url.includes('/inventaris')) {
    targets.push('/inventaris');
  } else if (url.includes('/notulen')) {
    targets.push('/notulen');
  } else if (url.includes('/dokumen')) {
    targets.push('/dokumen');
  } else if (url.includes('/media')) {
    targets.push('/media', '/dashboard');
  } else {
    targets.push(url);
  }

  const keysToDelete: string[] = [];
  for (const key of cache.keys()) {
    if (targets.some(target => key.includes(target))) {
      keysToDelete.push(key);
    }
  }
  for (const k of keysToDelete) {
    cache.delete(k);
  }
  persistCache();
}

let isRefreshingToken = false;
let refreshSubscribers: ((newToken: string) => void)[] = [];

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach(cb => cb(newToken));
  refreshSubscribers = [];
}

async function attemptTokenRefresh(): Promise<string | null> {
  const authUser = localStorage.getItem('auth_user');
  if (!authUser) return null;

  try {
    const userObj = JSON.parse(authUser);
    if (!userObj.refreshToken) return null;

    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: userObj.refreshToken })
    });

    if (!res.ok) {
      // Refresh token expired or revoked
      localStorage.removeItem('auth_user');
      window.dispatchEvent(new CustomEvent('auth_expired'));
      return null;
    }

    const data = await res.json();
    const newAccessToken = data.accessToken || data.token;
    if (newAccessToken) {
      userObj.token = newAccessToken;
      if (data.refreshToken) {
        userObj.refreshToken = data.refreshToken;
      }
      localStorage.setItem('auth_user', JSON.stringify(userObj));
      return newAccessToken;
    }
  } catch {
    return null;
  }
  return null;
}

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const isGet = !init || !init.method || init.method.toUpperCase() === 'GET';
  const url = typeof input === 'string' ? input : input.toString();

  // Selective Cache Invalidation on mutations (POST, PUT, DELETE)
  if (!isGet) {
    const isNonMutating =
      url.includes('/api/ping') ||
      url.includes('/api/notifications/read') ||
      url.includes('/api/logout') ||
      url.includes('/api/login') ||
      url.includes('/api/register') ||
      url.includes('/api/auth/refresh') ||
      url.includes('/api/gemini') ||
      url.includes('/api/ai') ||
      url.includes('/api/chat');

    if (!isNonMutating) {
      invalidateCacheForResource(url);
      try { window.dispatchEvent(new CustomEvent('app_data_update')); } catch {}
    }
  } else {
    // 1. Instant Cache hit (0ms display)
    const cached = cache.get(url);
    if (cached) {
      // Background revalidation without blocking UI if older than 3500ms
      if (Date.now() - cached.timestamp > 3500 && !inflight.has(url)) {
        setTimeout(() => {
          apiFetch(input, { ...init, headers: { ...init?.headers, 'x-swr-revalidate': '1' } }).catch(() => {});
        }, 10);
      }
      const mockRes = new Response(cached.data, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      return attachSafeJsonParser(mockRes, url);
    }

    // 2. Check inflight requests to deduplicate parallel calls
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
      if (userObj.token) {
        modifiedInit.headers.set('Authorization', `Bearer ${userObj.token}`);
      }
      if (userObj.id) {
        modifiedInit.headers.set('x-user-id', userObj.id);
      }
      if (userObj.role) {
        modifiedInit.headers.set('x-user-role', userObj.role);
      }
    } catch {}
  }

  // Append updaterName to POST/PUT payloads automatically if not present
  if (!isGet && modifiedInit.body && typeof modifiedInit.body === 'string') {
    try {
      const parsed = JSON.parse(modifiedInit.body);
      if (typeof parsed === 'object' && parsed !== null && !parsed.updaterName && authUser) {
        const userObj = JSON.parse(authUser);
        parsed.updaterName = userObj.nama || userObj.username || 'Admin';
        modifiedInit.body = JSON.stringify(parsed);
      }
    } catch {}
  }

  const fetchPromise = (async () => {
    let res = await fetch(input, modifiedInit);

    // Handle token expiration (401) with silent refresh and retry
    if (res.status === 401 && !url.includes('/api/login') && !url.includes('/api/auth/refresh') && authUser) {
      if (!isRefreshingToken) {
        isRefreshingToken = true;
        const newToken = await attemptTokenRefresh();
        isRefreshingToken = false;
        if (newToken) {
          onTokenRefreshed(newToken);
          const retryHeaders = new Headers(modifiedInit.headers);
          retryHeaders.set('Authorization', `Bearer ${newToken}`);
          res = await fetch(input, { ...modifiedInit, headers: retryHeaders });
        }
      } else {
        // Wait for active token refresh to finish
        const waitPromise = new Promise<string>((resolve) => {
          refreshSubscribers.push(resolve);
        });
        const newToken = await waitPromise;
        if (newToken) {
          const retryHeaders = new Headers(modifiedInit.headers);
          retryHeaders.set('Authorization', `Bearer ${newToken}`);
          res = await fetch(input, { ...modifiedInit, headers: retryHeaders });
        }
      }
    }

    if (isGet && res.ok) {
      const clonedForCache = res.clone();
      clonedForCache.text().then(text => {
        if (tryParseJson(text) !== null) {
          cache.set(url, { data: text, timestamp: Date.now() });
          persistCache();
        }
      }).catch(() => {});
    }

    return attachSafeJsonParser(res, url);
  })().finally(() => {
    if (isGet) {
      inflight.delete(url);
    }
  });

  if (isGet) {
    inflight.set(url, fetchPromise);
  }

  return fetchPromise;
};
