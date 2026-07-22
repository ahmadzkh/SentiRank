"use client";

import { createContext, useContext, useRef, useState, useEffect, type ReactNode } from "react";

type CacheMap = Map<string, unknown>;
const Ctx = createContext<CacheMap | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const cache = useRef<CacheMap>(new Map()).current;
  return <Ctx.Provider value={cache}>{children}</Ctx.Provider>;
}

export function useCache() {
  const cache = useContext(Ctx);
  if (!cache) throw new Error("useCache must be inside DataProvider");
  return cache;
}

/**
 * Fetch-or-cache hook. Falls back to plain useEffect+useState on error.
 * 
 * - Cache hit: returns data immediately, loading=false
 * - Cache miss: fires fetcher, stores result on success, returns {data:null, loading:true}
 * - Error: does NOT cache the error, user can retry by re-mounting
 */
export function useCachedData<T>(key: string, fetcher: () => Promise<T>): {
  data: T | null;
  loading: boolean;
} {
  const cache = useCache();
  const [data, setData] = useState<T | null>(cache.get(key) as T | null);
  const [loading, setLoading] = useState(() => !cache.has(key));
  const inflight = useRef<Promise<T> | null>(null);

  useEffect(() => {
    // Always prefer cache (set by preloader or previous fetch)
    if (cache.has(key)) {
      setData(cache.get(key) as T);
      setLoading(false);
      inflight.current = null;
      return;
    }

    // Already in flight — don't duplicate
    if (inflight.current) return;

    setLoading(true);
    const promise = fetcher()
      .then((result) => {
        cache.set(key, result);
        setData(result);
        setLoading(false);
        inflight.current = null;
      })
      .catch(() => {
        setLoading(false);
        inflight.current = null;
      });
    inflight.current = promise as Promise<T>;
  }, [key, fetcher, cache]);

  return { data, loading };
}

/**
 * Prefetch. Fire-and-forget. Uses cache to avoid re-fetch.
 */
export function useCachePreloader() {
  const cache = useCache();

  return <T,>(key: string, fetcher: () => Promise<T>) => {
    if (cache.has(key)) return;
    fetcher()
      .then((data) => cache.set(key, data))
      .catch(() => {}); // silent
  };
}
