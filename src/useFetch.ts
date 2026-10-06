import { useState, useEffect } from 'react';
import { apiFetch } from './apiInterceptor';

const globalCache = new Map<string, any>();
const listeners = new Map<string, Set<(data: any) => void>>();

export function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(url ? globalCache.get(url) || null : null);
  const [loading, setLoading] = useState<boolean>(!data);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!url) return;

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

    // Initial state based on cache
    if (globalCache.has(url)) {
      setLoading(false);
      setData(globalCache.get(url));
    } else {
      setLoading(true);
    }

    // Fetch data always to ensure freshness
    apiFetch(url)
      .then(res => res.json())
      .then(json => {
        const newData = json.data || json; // adjust based on API response structure
        globalCache.set(url, newData);
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
