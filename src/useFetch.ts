import { useState, useEffect, useRef } from 'react';
import { apiFetch } from './apiInterceptor';

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
    
    // Add local updater
    const onUpdate = (newData: any) => {
      if (isMounted) {
        setData(newData);
        setLoading(false);
      }
    };
    urlListeners.add(onUpdate);

    // Initial state based on SWR cache
    if (globalCache.has(url)) {
      setLoading(false);
      setData(globalCache.get(url));
    } else {
      setLoading(true);
    }

    // Cancel previous inflight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Fetch fresh data in background (SWR pattern)
    apiFetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(json => {
        if (!isMounted) return;
        const newData = json?.data !== undefined ? json.data : json;
        globalCache.set(url, newData);
        // notify all components listening to this url
        urlListeners.forEach(fn => fn(newData));
        setError(null);
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

  const mutate = (newData: T) => {
    if (!url) return;
    globalCache.set(url, newData);
    const urlListeners = listeners.get(url);
    if (urlListeners) {
      urlListeners.forEach(fn => fn(newData));
    }
  };

  return { data, loading, error, mutate };
}
