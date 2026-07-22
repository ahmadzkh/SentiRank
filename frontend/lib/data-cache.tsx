"use client";

import { createContext, useContext, useRef, useCallback, useState } from "react";

/**
 * Minimal in-memory cache for API responses.
 * Lifetime: browser session tab. No persistence.
 * Purpose: instant re-navigation + SPA-like feel.
 */

type CacheMap = Map<string, unknown>;

const Ctx = createContext<CacheMap | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const cache = useRef<CacheMap>(new Map()).current;
  return <Ctx.Provider value={cache}>{children}</Ctx.Provider>;
}

/**
 * Fetch-or-cache hook. Returns {data, loading}.
 * First visit: fetcher runs, stores result, re-renders.
 * Subsequent: instant from cache.
 */
export function useCachedData<T>(key: string, fetcher: () => Promise<T>): {
  data: T | null;
  loading: boolean;
} {
  const cache = useContext(Ctx);
  if (!cache) throw new Error("useCachedData requires DataProvider");

  // Check cache synchronously
  if (cache.has(key)) {
    return { data: cache.get(key) as T, loading: false };
  }

  // Cache miss — return loading, trigger fetch
  // useState trick to trigger re-render when fetch completes
  const [, setTick] = useState(0);
  if (!(cache as CacheMap & {_fetching?: Set<string>})._fetching) {
    (cache as CacheMap & {_fetching?: Set<string>})._fetching = new Set();
  }
  const fetching = (cache as CacheMap & {_fetching: Set<string>})._fetching;

  if (!fetching.has(key)) {
    fetching.add(key);
    fetcher().then((result) => {
      cache.set(key, result);
      fetching.delete(key);
      setTick((n) => n + 1); // force re-render
    });
  }

  return { data: null, loading: true };
}

/**
 * Prefetch into cache. Call from sidebar onHover.
 * Returns void — fire-and-forget.
 */
export function useCachePreloader() {
  const cache = useContext(Ctx);
  if (!cache) return () => {};

  return <T,>(key: string, fetcher: () => Promise<T>) => {
    if (!cache.has(key)) {
      fetcher().then((data) => cache.set(key, data));
    }
  };
}
