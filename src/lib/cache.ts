// In-memory cache with TTL and deterministic recursive key serialization.

export type CacheEntry<T> = {
  readonly value: T;
  readonly expiresAt: number;
};

export type Cache<T> = Map<string, CacheEntry<T>>;

export const createCache = <T>(): Cache<T> => new Map();

export const get = <T>(cache: Cache<T>, key: string): T | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

export const set = <T>(
  cache: Cache<T>,
  key: string,
  value: T,
  ttlMs: number = 300_000 // 5 minutes default
): void => {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

// Deeply sort object keys to ensure deterministic JSON serialization
// without triggering ECMAScript replacer array recursion erasure.
const sortObjectKeys = (val: unknown): unknown => {
  if (val === null || typeof val !== "object") return val;
  if (Array.isArray(val)) return val.map(sortObjectKeys);
  const sortedEntries = Object.entries(val as Record<string, unknown>)
    .sort(([k1], [k2]) => k1.localeCompare(k2))
    .map(([k, v]) => [k, sortObjectKeys(v)]);
  return Object.fromEntries(sortedEntries);
};

export const buildCacheKey = (filters: unknown): string => {
  const sorted = sortObjectKeys(filters);
  return JSON.stringify(sorted);
};

export const clear = <T>(cache: Cache<T>): void => {
  cache.clear();
};
