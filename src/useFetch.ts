import { useState, useEffect } from 'react';
import { apiFetch, getCompositeCacheKey } from './apiInterceptor';

const globalCache = new Map<string, any>();
const listeners = new Map<string, Set<(data: any) => void>>();

export function useFetch<T>(url: string | null) {
  const cacheKey = url ? getCompositeCacheKey(url) : null;
  const [data, setData] = useState<T | null>(cacheKey ? globalCache.get(cacheKey) || null : null);
  const [loading, setLoading] = useState<boolean>(!data);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!url || !cacheKey) return;

    let isMounted = true;
    
    if (!listeners.has(cacheKey)) {
      listeners.set(cacheKey, new Set());
    }
    const urlListeners = listeners.get(cacheKey)!;
    
    // Add local updater
    const onUpdate = (newData: any) => {
      if (isMounted) {
        setData(newData);
        setLoading(false);
      }
    };
    urlListeners.add(onUpdate);

    // Initial state based on cache
    if (globalCache.has(cacheKey)) {
      setLoading(false);
      setData(globalCache.get(cacheKey));
    } else {
      setLoading(true);
    }

    // Fetch data always to ensure freshness
    apiFetch(url)
      .then(res => res.json())
      .then(json => {
        const newData = json.data || json; // adjust based on API response structure
        globalCache.set(cacheKey, newData);
        // notify all components listening to this url
        urlListeners.forEach(fn => fn(newData));
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      urlListeners.delete(onUpdate);
    };
  }, [url, cacheKey]);

  const mutate = (newData: T) => {
    if (!url || !cacheKey) return;
    globalCache.set(cacheKey, newData);
    const urlListeners = listeners.get(cacheKey);
    if (urlListeners) {
      urlListeners.forEach(fn => fn(newData));
    }
  };

  return { data, loading, error, mutate };
}
