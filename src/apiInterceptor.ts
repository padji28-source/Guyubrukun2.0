import { Capacitor } from '@capacitor/core';

const cache = new Map<string, { data: string, timestamp: number }>();
const inflight = new Map<string, Promise<Response>>();
const CACHE_TTL = 5 * 60 * 1000;

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const isGet = !init || !init.method || init.method.toUpperCase() === 'GET';
  const url = typeof input === 'string' ? input : input.toString();

  // Clear cache on mutations (POST, PUT, DELETE)
  if (!isGet) {
    cache.clear();
  } else {
    // 1. Check cache
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const mockRes = new Response(cached.data, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      // apply custom json parser to mock res
      const originalJsonMock = mockRes.json.bind(mockRes);
      mockRes.json = async () => {
        try { return await originalJsonMock(); } catch (e) { return { data: [] }; }
      };
      return Promise.resolve(mockRes);
    }

    // 2. Check inflight requests
    if (inflight.has(url)) {
      const res = await inflight.get(url)!;
      const finalRes = res.clone();
      // apply custom json parser to cloned res
      const originalJsonCloned = finalRes.json.bind(finalRes);
      finalRes.json = async () => {
        const cloned = finalRes.clone();
        const text = await cloned.text();
        if (text.trim().startsWith('<')) {
          console.error('API Error: Expected JSON but got HTML for', url, text.substring(0, 100));
          return { data: [], users: [], notifications: [], error: 'Failed to parse JSON' };
        }
        try {
          return await originalJsonCloned();
        } catch (err) {
          console.error('API Error: Expecting JSON but failed to parse for', url, err);
          return { data: [], users: [], notifications: [], error: 'Failed to parse JSON', raw: text };
        }
      };
      return finalRes;
    }
  }

  const modifiedInit = { ...init };
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
    } catch(e) {}
  }

  // Append updaterName to POST/PUT payloads automatically
  if (!isGet && modifiedInit.body && typeof modifiedInit.body === 'string') {
    try {
      const parsed = JSON.parse(modifiedInit.body);
      if (typeof parsed === 'object' && !parsed.updaterName) {
        if (authUser) {
          const userObj = JSON.parse(authUser);
          parsed.updaterName = userObj.nama || userObj.username || 'Admin';
          modifiedInit.body = JSON.stringify(parsed);
        }
      }
    } catch(e) {}
  }

  // Handle relative URLs for Capacitor
  let finalInput = input;
  if (Capacitor.isNativePlatform() && typeof input === 'string' && input.startsWith('/')) {
    // In production, this should be the deployed URL.
    // For now, we use the current environment's URL as a default.
    const baseUrl = window.location.origin.includes('localhost') || window.location.origin.includes('ais-dev') || window.location.origin.includes('ais-pre')
      ? window.location.origin 
      : 'https://ais-pre-4cyexyaiz2lrevpvgr7rkp-47019996628.asia-east1.run.app';
    
    finalInput = `${baseUrl}${input}`;
  }

  const fetchPromise = fetch(finalInput, modifiedInit).then(async (res) => {
    if (isGet && res.ok) {
      const clonedForCache = res.clone();
      try {
        const text = await clonedForCache.text();
        if (!text.trim().startsWith('<')) {
          cache.set(url, { data: text, timestamp: Date.now() });
        }
      } catch (e) {}
    }

    const originalJson = res.json.bind(res);
    res.json = async () => {
      const cloned = res.clone();
      const text = await cloned.text();
      if (text.trim().startsWith('<')) {
        console.error('API Error: Expected JSON but got HTML for', input, text.substring(0, 100));
        return { data: [], users: [], notifications: [], error: 'Failed to parse JSON' };
      }
      try {
        return await originalJson();
      } catch (err) {
        console.error('API Error: Expecting JSON but failed to parse for', input, err);
        return { data: [], users: [], notifications: [], error: 'Failed to parse JSON', raw: text };
      }
    };
    return res;
  }).finally(() => {
    if (isGet) {
      inflight.delete(url);
    }
  });

  if (isGet) {
    inflight.set(url, fetchPromise);
  }

  return fetchPromise;
};
