'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

interface CacheOptions<T> {
  ttl?: number;
  queryOptions?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn' | 'staleTime'>;
}

/**
 * Drop-in replacement for the previous manual cache hook.
 * Uses TanStack Query under the hood for caching, deduplication, and invalidation.
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions<T> = {},
) {
  const { ttl = 5 * 60 * 1000, queryOptions } = options;

  const {
    data = null,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<T>({
    queryKey: [key],
    queryFn: fetcher,
    staleTime: ttl,
    ...queryOptions,
  });

  return {
    data,
    loading,
    error: error as Error | null,
    refetch: () => refetch(),
    // Legacy aliases kept so existing call sites don't break
    fetchData: () => refetch(),
    invalidateCache: () => refetch(),
    clearCache: () => refetch(),
  };
}

/**
 * Drop-in replacement for the previous useApiCache hook.
 */
export function useApiCache<T>(
  url: string,
  options: CacheOptions<T> & {
    headers?: Record<string, string>;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
  } = {},
) {
  const { headers = {}, method = 'GET', body, ttl, queryOptions } = options;

  async function fetcher(): Promise<T> {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  return useCache<T>(url, fetcher, { ttl, queryOptions });
}
