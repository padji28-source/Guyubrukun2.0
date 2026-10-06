import { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch, getCachedData, setCachedData, invalidateCache } from './apiInterceptor';

const listeners = new Map<string, Set<(data: any) => void>>();

export interface UseFetchOptions {
  revalidateOnFocus?: boolean;
  dedupingInterval?: number;
}

export function useFetch<T>(url: string | null, options: UseFetchOptions = {}) {
  const initialData = url ? getCachedData<T>(url) : null;
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<any>(null);
  
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const revalidate = useCallback(async (customUrl?: string) => {
    const targetUrl = customUrl || url;
    if (!targetUrl) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await apiFetch(targetUrl, { signal: abortControllerRef.current.signal });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      const freshData = json.data !== undefined ? json.data : json;

      if (isMountedRef.current) {
        setCachedData(targetUrl, freshData);
        setData(freshData);
        setError(null);
        setLoading(false);

        // Notify all other mounted instances listening to this URL
        const urlListeners = listeners.get(targetUrl);
        if (urlListeners) {
          urlListeners.forEach(fn => fn(freshData));
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      if (isMountedRef.current) {
        setError(err);
        setLoading(false);
      }
    }
  }, [url]);

  useEffect(() => {
    isMountedRef.current = true;
    if (!url) {
      setLoading(false);
      return;
    }

    if (!listeners.has(url)) {
      listeners.set(url, new Set());
    }
    const urlListeners = listeners.get(url)!;

    const onExternalUpdate = (newData: any) => {
      if (isMountedRef.current) {
        setData(newData);
        setLoading(false);
      }
    };
    urlListeners.add(onExternalUpdate);

    // Stale-While-Revalidate: If we have cached data, display it immediately
    const cached = getCachedData<T>(url);
    if (cached !== null) {
      setData(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    // Always fetch in background to revalidate freshness
    revalidate(url);

    return () => {
      isMountedRef.current = false;
      urlListeners.delete(onExternalUpdate);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, revalidate]);

  const mutate = useCallback((newData: T | ((prev: T | null) => T), shouldRevalidate = false) => {
    if (!url) return;
    const resolved = typeof newData === 'function' ? (newData as any)(data) : newData;
    
    setCachedData(url, resolved);
    setData(resolved);

    const urlListeners = listeners.get(url);
    if (urlListeners) {
      urlListeners.forEach(fn => fn(resolved));
    }

    if (shouldRevalidate) {
      revalidate(url);
    }
  }, [url, data, revalidate]);

  return { data, loading, error, mutate, revalidate };
}

export { invalidateCache };
