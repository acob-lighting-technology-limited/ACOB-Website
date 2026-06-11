/**
 * Lightweight TTL cache for chatbot Sanity fetches.
 *
 * General-query handling fetches all content types (updates, projects,
 * products, jobs) up front. Those datasets change rarely, so caching them in
 * module memory for a short window avoids re-querying Sanity on every message
 * while a serverless instance stays warm. Reads still go through Sanity's CDN;
 * this just removes the per-request round-trips.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/** Default cache lifetime — long enough to help, short enough to stay fresh. */
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Return a cached value for `key`, or run `fetcher` and cache its result.
 * If the fetch fails, the error propagates and nothing is cached.
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  const existing = store.get(key);
  if (existing && existing.expiresAt > Date.now()) {
    return existing.value as T;
  }

  const value = await fetcher();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

/** Clear a single key, or the whole cache when no key is given. */
export function clearChatDataCache(key?: string): void {
  if (key) {
    store.delete(key);
  } else {
    store.clear();
  }
}
