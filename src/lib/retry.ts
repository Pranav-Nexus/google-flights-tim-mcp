// Circuit breaker and retry mechanisms for outbound HTTP requests.

import { ok, err, type Result } from "./result.js";
import { logger } from "./logger.js";

export type CircuitBreakerOptions = {
  readonly failureThreshold: number;
  readonly resetTimeoutMs: number;
};

export type CircuitBreaker = {
  readonly execute: <T>(action: () => Promise<Result<T>>) => Promise<Result<T>>;
  readonly getState: () => "closed" | "open" | "half-open";
};

export const createCircuitBreaker = (
  options: CircuitBreakerOptions = {
    failureThreshold: 5,
    resetTimeoutMs: 30_000,
  }
): CircuitBreaker => {
  let state: "closed" | "open" | "half-open" = "closed";
  let failureCount = 0;
  let lastFailureTime = 0;

  return {
    getState: () => state,
    execute: async <T>(action: () => Promise<Result<T>>): Promise<Result<T>> => {
      const now = Date.now();
      if (state === "open") {
        if (now - lastFailureTime > options.resetTimeoutMs) {
          state = "half-open";
          logger.info("circuit_breaker_half_open");
        } else {
          return err("Circuit breaker is OPEN — upstream service temporarily unavailable");
        }
      }

      try {
        const result = await action();
        if (result.tag === "ok") {
          if (state === "half-open") {
            state = "closed";
            failureCount = 0;
            logger.info("circuit_breaker_closed");
          }
          return result;
        }

        // Action returned application-level error
        failureCount++;
        lastFailureTime = now;
        if (failureCount >= options.failureThreshold) {
          state = "open";
          logger.warn("circuit_breaker_opened", { failureCount });
        }
        return result;
      } catch (e) {
        failureCount++;
        lastFailureTime = now;
        if (failureCount >= options.failureThreshold) {
          state = "open";
          logger.warn("circuit_breaker_opened", { failureCount });
        }
        return err(e instanceof Error ? e.message : String(e));
      }
    },
  };
};
