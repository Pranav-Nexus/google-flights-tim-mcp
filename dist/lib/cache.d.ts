export type CacheEntry<T> = {
    readonly value: T;
    readonly expiresAt: number;
};
export type Cache<T> = Map<string, CacheEntry<T>>;
export declare const createCache: <T>() => Cache<T>;
export declare const get: <T>(cache: Cache<T>, key: string) => T | null;
export declare const set: <T>(cache: Cache<T>, key: string, value: T, ttlMs?: number) => void;
export declare const buildCacheKey: (filters: unknown) => string;
export declare const clear: <T>(cache: Cache<T>) => void;
//# sourceMappingURL=cache.d.ts.map