import { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch, apiCache, getGranularTtl, invalidateSelectiveCache } from './apiInterceptor';

// Global listener map for reactive UI sync across mounted components
const listeners = new Map<string, Set<(data: any) => void>>();

export interface UseFetchOptions<T> {
  ttl?: number;
  initialData?: T;
  revalidateOnMount?: boolean;
}

export function useFetch<T = any>(url: string | null, options?: UseFetchOptions<T>) {
  // 1. Synchronously get initial data from cache if present (Zero blank spinner / instant render)
  const getCachedValue = useCallback((): T | null => {
    if (!url) return options?.initialData || null;
    const item = apiCache.get(url);
    if (item && item.data) {
      try {
        const parsed = JSON.parse(item.data);
        return (parsed && parsed.data !== undefined ? parsed.data : parsed) as T;
      } catch {
        return null;
      }
    }
    return options?.initialData || null;
  }, [url, options?.initialData]);

  const [data, setData] = useState<T | null>(() => getCachedValue());
  const [loading, setLoading] = useState<boolean>(() => {
    if (!url) return false;
    return !apiCache.has(url);
  });
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const activeAbortCtrlRef = useRef<AbortController | null>(null);

  // Background revalidation with AbortController
  const performFetch = useCallback(async (targetUrl: string, isManual = false) => {
    if (!targetUrl) return;

    // Abort previous inflight request for this hook instance to prevent memory leaks / race conditions
    if (activeAbortCtrlRef.current) {
      activeAbortCtrlRef.current.abort();
    }

    const abortController = new AbortController();
    activeAbortCtrlRef.current = abortController;

    setIsValidating(true);
    if (!apiCache.has(targetUrl)) {
      setLoading(true);
    }

    try {
      const res = await apiFetch(targetUrl, { signal: abortController.signal });
      const json = await res.json();
      const extracted = json && json.data !== undefined ? json.data : json;

      setData(extracted);
      setError(null);
      setLoading(false);
      setIsValidating(false);

      // Notify all other mounted components listening to this same URL
      const subs = listeners.get(targetUrl);
      if (subs) {
        subs.forEach((fn) => fn(extracted));
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setError(err);
        setLoading(false);
        setIsValidating(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!url) {
      setData(null);
      setLoading(false);
      setIsValidating(false);
      return;
    }

    let isMounted = true;

    // Register cross-component listener
    if (!listeners.has(url)) {
      listeners.set(url, new Set());
    }
    const urlListeners = listeners.get(url)!;

    const handleListenerUpdate = (newData: any) => {
      if (isMounted) {
        setData(newData);
        setLoading(false);
        setIsValidating(false);
      }
    };
    urlListeners.add(handleListenerUpdate);

    // Check freshness against granular TTL
    const cachedItem = apiCache.get(url);
    const ttl = options?.ttl ?? getGranularTtl(url);
    const isFresh = cachedItem && Date.now() - cachedItem.timestamp < ttl;

    if (cachedItem) {
      try {
        const parsed = JSON.parse(cachedItem.data);
        const extracted = parsed && parsed.data !== undefined ? parsed.data : parsed;
        setData(extracted);
        setLoading(false);
      } catch {}
    }

    // Always revalidate in background if not fresh or requested
    if (!isFresh || options?.revalidateOnMount !== false) {
      performFetch(url);
    }

    // Selective Cache Invalidation / Broadcast Listener
    const handleCacheInvalidated = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.invalidatedKeys?.includes(url) || detail?.mutationUrl?.includes(url)) {
        performFetch(url, true);
      }
    };

    const handleAppDataUpdate = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (!detail || typeof detail !== 'string') {
        performFetch(url, true);
        return;
      }
      const tag = detail.toLowerCase();
      const urlLower = url.toLowerCase();
      if (urlLower.includes(tag) || tag === 'all') {
        performFetch(url, true);
      }
    };

    window.addEventListener('app_cache_invalidated', handleCacheInvalidated);
    window.addEventListener('app_data_update', handleAppDataUpdate);

    return () => {
      isMounted = false;
      urlListeners.delete(handleListenerUpdate);
      if (urlListeners.size === 0) {
        listeners.delete(url);
      }
      window.removeEventListener('app_cache_invalidated', handleCacheInvalidated);
      window.removeEventListener('app_data_update', handleAppDataUpdate);

      // Abort ongoing network request on unmount (preventing memory leaks)
      if (activeAbortCtrlRef.current) {
        activeAbortCtrlRef.current.abort();
      }
    };
  }, [url, performFetch, options?.ttl, options?.revalidateOnMount]);

  // Local optimistic mutation with selective invalidation
  const mutate = useCallback(
    (newData: T | ((curr: T | null) => T), shouldRevalidate = false) => {
      if (!url) return;

      const resolved = typeof newData === 'function' ? (newData as any)(data) : newData;
      setData(resolved);

      // Update in apiCache
      apiCache.set(url, {
        data: JSON.stringify({ data: resolved }),
        timestamp: Date.now()
      });

      // Notify other listeners
      const subs = listeners.get(url);
      if (subs) {
        subs.forEach((fn) => fn(resolved));
      }

      if (shouldRevalidate) {
        performFetch(url, true);
      }
    },
    [url, data, performFetch]
  );

  const revalidate = useCallback(() => {
    if (url) {
      return performFetch(url, true);
    }
  }, [url, performFetch]);

  return { data, loading, isValidating, error, mutate, revalidate };
}

export function mutateEndpoint(url: string, data: any) {
  apiCache.set(url, {
    data: JSON.stringify({ data }),
    timestamp: Date.now()
  });
  const subs = listeners.get(url);
  if (subs) {
    subs.forEach((fn) => fn(data));
  }
}

export function invalidateEndpoint(urlOrTag: string) {
  invalidateSelectiveCache(urlOrTag);
}
