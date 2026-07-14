const cache = new Map<string, { data: string, timestamp: number }>();
const inflight = new Map<string, Promise<Response>>();
const CACHE_TTL = 5 * 60 * 1000;

const handleJsonResponse = async (res: Response, input: any, originalJsonFn: () => Promise<any>): Promise<any> => {
  const cloned = res.clone();
  try {
    const text = await cloned.text();
    const trimmed = text.trim();
    if (trimmed.startsWith('<')) {
      console.error('API Error: Expected JSON but got HTML for', input, trimmed.substring(0, 150));
      let errorMsg = 'Gagal memproses data dari server (Respons bukan JSON).';
      if (text.includes('MONGODB_URI') || text.includes('MANGODB_URL') || text.includes('Database Gagal')) {
        errorMsg = 'Koneksi database gagal. Silakan periksa konfigurasi MONGODB_URI di Vercel Anda.';
      } else if (text.includes('502') || text.includes('Bad Gateway') || text.includes('504') || text.includes('Gateway Timeout')) {
        errorMsg = 'Server sedang offline atau mengalami gangguan (502/504).';
      } else if (text.includes('404') || text.includes('Not Found')) {
        errorMsg = 'Endpoint API tidak ditemukan (404). Silakan hubungi admin atau periksa routing.';
      } else if (text.includes('Cannot POST') || text.includes('Cannot GET')) {
        const routeMatch = text.match(/Cannot\s+[A-Z]+\s+\S+/i);
        errorMsg = `Endpoint API salah: ${routeMatch ? routeMatch[0] : 'tidak terdaftar'}.`;
      }
      return { data: [], users: [], notifications: [], error: errorMsg, raw: text };
    }
    
    if (!trimmed) {
      return { data: [], users: [], notifications: [] };
    }
    
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      return await originalJsonFn();
    }
  } catch (err) {
    console.error('API Error: Expecting JSON but failed to parse for', input, err);
    return { data: [], users: [], notifications: [], error: 'Failed to parse JSON' };
  }
};

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
        return handleJsonResponse(finalRes, url, originalJsonCloned);
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

  const fetchPromise = fetch(input, modifiedInit).then(async (res) => {
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
      return handleJsonResponse(res, input, originalJson);
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
