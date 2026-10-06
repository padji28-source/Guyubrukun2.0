// Granular TTL and Selective Invalidation Cache Manager
export interface CacheItem {
  data: string;
  timestamp: number;
}

export const apiCache = new Map<string, CacheItem>();
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

/**
 * Granular TTL values in milliseconds based on domain requirements:
 * - Profile: 5–10 menit (300,000ms)
 * - Master Data / Menu / Warga: 10 menit (600,000ms)
 * - Dashboard: 30–60 detik (45,000ms)
 * - Kas & Iuran: 15–30 detik (20,000ms)
 * - Notifikasi: 5–15 detik (10,000ms)
 * - Voting: 10–30 detik (15,000ms)
 * - Default fallback: 30 detik (30,000ms)
 */
export function getGranularTtl(url: string): number {
  const clean = url.toLowerCase();
  if (clean.includes('/notifications') || clean.includes('/notifikasi')) {
    return 10 * 1000; // 10s (5-15s range)
  }
  if (clean.includes('/voting') || clean.includes('/polling')) {
    return 15 * 1000; // 15s (10-30s range)
  }
  if (clean.includes('/kas') || clean.includes('/iuran')) {
    return 20 * 1000; // 20s (15-30s range)
  }
  if (clean.includes('/dashboard') || clean.includes('/stats') || clean.includes('/developer/stats')) {
    return 45 * 1000; // 45s (30-60s range)
  }
  if (clean.includes('/profile') || clean.includes('/auth/me')) {
    return 5 * 60 * 1000; // 5 mins (5-10m range)
  }
  if (
    clean.includes('/menu') ||
    clean.includes('/public/rt-list') ||
    clean.includes('/warga') ||
    clean.includes('/users')
  ) {
    return 10 * 60 * 1000; // 10 mins (master data)
  }
  return 30 * 1000; // Default 30s
}

/**
 * Selective Mutation Invalidation:
 * Only purges relevant cache keys based on the mutation endpoint.
 * Prevents invalidating unrelated modules (e.g. mutating kas won't wipe profile or warga).
 */
export function invalidateSelectiveCache(mutationUrl: string) {
  const clean = mutationUrl.toLowerCase();
  const keysToDelete: string[] = [];

  for (const key of apiCache.keys()) {
    const keyLower = key.toLowerCase();
    let shouldInvalidate = false;

    if (clean.includes('/kas')) {
      if (keyLower.includes('/kas') || keyLower.includes('/dashboard')) {
        shouldInvalidate = true;
      }
    } else if (clean.includes('/iuran')) {
      if (keyLower.includes('/iuran') || keyLower.includes('/dashboard')) {
        shouldInvalidate = true;
      }
    } else if (clean.includes('/voting')) {
      if (keyLower.includes('/voting') || keyLower.includes('/dashboard')) {
        shouldInvalidate = true;
      }
    } else if (clean.includes('/warga') || clean.includes('/users')) {
      if (keyLower.includes('/warga') || keyLower.includes('/users') || keyLower.includes('/dashboard')) {
        shouldInvalidate = true;
      }
    } else if (clean.includes('/surat')) {
      if (keyLower.includes('/surat') || keyLower.includes('/dashboard')) {
        shouldInvalidate = true;
      }
    } else if (clean.includes('/laporan') || clean.includes('/pengaduan')) {
      if (keyLower.includes('/laporan') || keyLower.includes('/pengaduan') || keyLower.includes('/dashboard')) {
        shouldInvalidate = true;
      }
    } else if (clean.includes('/acara') || clean.includes('/events')) {
      if (keyLower.includes('/acara') || keyLower.includes('/dashboard')) {
        shouldInvalidate = true;
      }
    } else if (clean.includes('/dokumen')) {
      if (keyLower.includes('/dokumen') || keyLower.includes('/dashboard')) {
        shouldInvalidate = true;
      }
    } else if (clean.includes('/umkm')) {
      if (keyLower.includes('/umkm') || keyLower.includes('/dashboard')) {
        shouldInvalidate = true;
      }
    } else if (clean.includes('/media')) {
      if (keyLower.includes('/media')) {
        shouldInvalidate = true;
      }
    } else if (clean.includes('/inventaris')) {
      if (keyLower.includes('/inventaris')) {
        shouldInvalidate = true;
      }
    } else if (clean.includes('/notulen')) {
      if (keyLower.includes('/notulen')) {
        shouldInvalidate = true;
      }
    } else if (clean.includes('/menu-access') || clean.includes('/menu')) {
      if (keyLower.includes('/menu')) {
        shouldInvalidate = true;
      }
    } else if (clean.includes('/notifications') || clean.includes('/notifikasi')) {
      if (keyLower.includes('/notifications') || keyLower.includes('/notifikasi')) {
        shouldInvalidate = true;
      }
    } else if (clean.includes('/profile')) {
      if (keyLower.includes('/profile') || keyLower.includes('/users') || keyLower.includes('/auth/me')) {
        shouldInvalidate = true;
      }
    } else {
      if (keyLower.includes(clean) || keyLower.includes('/dashboard')) {
        shouldInvalidate = true;
      }
    }

    if (shouldInvalidate) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((k) => apiCache.delete(k));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('app_cache_invalidated', {
        detail: { mutationUrl, invalidatedKeys: keysToDelete }
      })
    );
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
      // Fallback to stale cache if available when rate limited or non-JSON returned
      const stale = apiCache.get(url);
      if (stale?.data) {
        const staleParsed = tryParseJson(stale.data);
        if (staleParsed !== null) {
          return staleParsed;
        }
      }
      return { ...DEFAULT_FALLBACK_JSON };
    } catch {
      const stale = apiCache.get(url);
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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit,
  isGet: boolean,
  retries = 2
): Promise<Response> {
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
      if (err?.name === 'AbortError') {
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
      // Selective invalidation only!
      invalidateSelectiveCache(url);
    }
  } else {
    // 1. Check granular cache validity
    const cached = apiCache.get(url);
    const ttl = getGranularTtl(url);
    if (cached && Date.now() - cached.timestamp < ttl) {
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
            apiCache.set(url, { data: text, timestamp: Date.now() });
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
