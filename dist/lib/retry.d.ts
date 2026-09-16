import { type Result } from "./result.js";
export type CircuitBreakerOptions = {
    readonly failureThreshold: number;
    readonly resetTimeoutMs: number;
};
export type CircuitBreaker = {
    readonly execute: <T>(action: () => Promise<Result<T>>) => Promise<Result<T>>;
    readonly getState: () => "closed" | "open" | "half-open";
};
export declare const createCircuitBreaker: (options?: CircuitBreakerOptions) => CircuitBreaker;
//# sourceMappingURL=retry.d.ts.map