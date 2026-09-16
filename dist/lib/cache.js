// In-memory cache with TTL and deterministic recursive key serialization.
export const createCache = () => new Map();
export const get = (cache, key) => {
    const entry = cache.get(key);
    if (!entry)
        return null;
    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }
    return entry.value;
};
export const set = (cache, key, value, ttlMs = 300_000 // 5 minutes default
) => {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
};
// Deeply sort object keys to ensure deterministic JSON serialization
// without triggering ECMAScript replacer array recursion erasure.
const sortObjectKeys = (val) => {
    if (val === null || typeof val !== "object")
        return val;
    if (Array.isArray(val))
        return val.map(sortObjectKeys);
    const sortedEntries = Object.entries(val)
        .sort(([k1], [k2]) => k1.localeCompare(k2))
        .map(([k, v]) => [k, sortObjectKeys(v)]);
    return Object.fromEntries(sortedEntries);
};
export const buildCacheKey = (filters) => {
    const sorted = sortObjectKeys(filters);
    return JSON.stringify(sorted);
};
export const clear = (cache) => {
    cache.clear();
};
//# sourceMappingURL=cache.js.map