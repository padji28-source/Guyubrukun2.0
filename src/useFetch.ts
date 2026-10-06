import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch, invalidateCacheForResource } from './apiInterceptor';

const globalCache = new Map<string, any>();
const listeners = new Map<string, Set<(data: any) => void>>();

export function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(url ? globalCache.get(url) || null : null);
  const [loading, setLoading] = useState<boolean>(!data);
  const [error, setError] = useState<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    if (!listeners.has(url)) {
      listeners.set(url, new Set());
    }
    const urlListeners = listeners.get(url)!;

    const onUpdate = (newData: any) => {
      if (isMounted) {
        setData(newData);
        setLoading(false);
      }
    };
    urlListeners.add(onUpdate);

    // Initial state based on instant cache
    if (globalCache.has(url)) {
      setData(globalCache.get(url));
      setLoading(false);
    } else {
      setLoading(true);
    }

    // Cancel previous inflight request if url changes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Fetch data in background (Stale While Revalidate)
    apiFetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(json => {
        if (!isMounted) return;
        const newData = json.data !== undefined ? json.data : json;
        globalCache.set(url, newData);
        urlListeners.forEach(fn => fn(newData));
      })
      .catch(err => {
        if (!isMounted || err.name === 'AbortError') return;
        setError(err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
      urlListeners.delete(onUpdate);
      controller.abort();
    };
  }, [url]);

  const mutate = useCallback((newData: T) => {
    if (!url) return;
    globalCache.set(url, newData);
    const urlListeners = listeners.get(url);
    if (urlListeners) {
      urlListeners.forEach(fn => fn(newData));
    }
    invalidateCacheForResource(url);
  }, [url]);

  return { data, loading, error, mutate };
}
