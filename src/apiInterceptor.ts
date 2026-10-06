import { getTtlForUrl } from './constants/cacheTtl';

export interface CacheEntry {
  data: string;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
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

export function getCachedData<T = any>(url: string): T | null {
  const entry = cache.get(url);
  if (!entry) return null;
  const ttl = getTtlForUrl(url);
  if (Date.now() - entry.timestamp > ttl * 2) {
    // Expired stale cache beyond 2x TTL
    return null;
  }
  return tryParseJson(entry.data);
}

export function setCachedData(url: string, data: any): void {
  try {
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    cache.set(url, { data: text, timestamp: Date.now() });
  } catch {}
}

export function invalidateCache(pattern?: string | RegExp): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  const reg = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
  for (const key of cache.keys()) {
    if (reg.test(key)) {
      cache.delete(key);
    }
  }
}

// Selectively invalidate cache on mutations
export function handleSelectiveMutationInvalidation(url: string, method?: string) {
  const m = (method || 'GET').toUpperCase();
  if (m === 'GET') return;

  if (url.includes('/api/data/kas') || url.includes('/api/kas') || url.includes('/api/sedekah')) {
    invalidateCache(/\/api\/data\/kas|\/api\/kas|\/api\/dashboard/i);
  } else if (url.includes('/api/data/iuran') || url.includes('/api/iuran')) {
    invalidateCache(/\/api\/data\/iuran|\/api\/iuran|\/api\/data\/kas|\/api\/kas|\/api\/dashboard/i);
  } else if (url.includes('/api/warga') || url.includes('/api/profile')) {
    invalidateCache(/\/api\/warga|\/api\/profile|\/api\/dashboard|\/api\/developer\/stats/i);
  } else if (url.includes('/api/voting')) {
    invalidateCache(/\/api\/voting|\/api\/data\/voting/i);
  } else if (url.includes('/api/data/laporan') || url.includes('/api/laporan')) {
    invalidateCache(/\/api\/data\/laporan|\/api\/dashboard/i);
  } else if (url.includes('/api/data/acara') || url.includes('/api/acara')) {
    invalidateCache(/\/api\/data\/acara|\/api\/dashboard/i);
  } else if (url.includes('/api/data/surat') || url.includes('/api/surat')) {
    invalidateCache(/\/api\/data\/surat/i);
  } else if (url.includes('/api/data/umkm') || url.includes('/api/umkm')) {
    invalidateCache(/\/api\/data\/umkm/i);
  } else if (url.includes('/api/data/dokumen') || url.includes('/api/dokumen') || url.includes('/api/warga-dokumen-kk')) {
    invalidateCache(/\/api\/data\/dokumen|\/api\/warga-dokumen-kk/i);
  } else if (url.includes('/api/data/inventaris') || url.includes('/api/inventaris')) {
    invalidateCache(/\/api\/data\/inventaris/i);
  } else if (url.includes('/api/data/notulen') || url.includes('/api/notulen')) {
    invalidateCache(/\/api\/data\/notulen/i);
  } else if (url.includes('/api/data/media') || url.includes('/api/media')) {
    invalidateCache(/\/api\/data\/media|\/api\/dashboard/i);
  } else if (url.includes('/api/notifications')) {
    invalidateCache(/\/api\/notifications/i);
  } else if (url.includes('/api/menu-permissions')) {
    invalidateCache(/\/api\/menu-permissions/i);
  } else if (url.includes('/api/developer/rt')) {
    invalidateCache(/\/api\/public\/rt-list|\/api\/developer\/rt/i);
  }
}

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
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err;
      }
      if (attempt < retries) {
        await delay(500 * Math.pow(2, attempt));
        continue;
      }
      throw err;
    }
  }
  return fetch(input, init);
}

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const isGet = !init || !init.method || init.method.toUpperCase() === 'GET';
  const url = typeof input === 'string' ? input : input.toString();

  // Selective Cache Invalidation on Mutations
  if (!isGet) {
    handleSelectiveMutationInvalidation(url, init?.method);
  } else {
    // 1. Check TTL cache
    const cached = cache.get(url);
    const ttl = getTtlForUrl(url);
    if (cached && Date.now() - cached.timestamp < ttl) {
      const mockRes = new Response(cached.data, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      return attachSafeJsonParser(mockRes, url);
    }

    // 2. Check inflight deduplication (only if no signal attached or same signal)
    if (!init?.signal && inflight.has(url)) {
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

  if (isGet && !init?.signal) {
    inflight.set(url, fetchPromise);
  }

  return fetchPromise;
};
