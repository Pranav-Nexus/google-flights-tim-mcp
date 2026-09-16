import { describe, it, expect } from "vitest";
import { buildCacheKey, createCache, get, set } from "../src/lib/cache.js";

describe("Deterministic Cache Key & Collision Prevention", () => {
  it("produces identical keys regardless of property ordering", () => {
    const objA = { origin: "JFK", destination: "LHR", date: "2026-11-13" };
    const objB = { date: "2026-11-13", destination: "LHR", origin: "JFK" };

    expect(buildCacheKey(objA)).toBe(buildCacheKey(objB));
  });

  it("differentiates nested segment queries without dropping inner keys", () => {
    const flight1 = {
      tripType: 1,
      passengers: { adults: 1, children: 0 },
      segments: [
        { departureAirport: "BOM", arrivalAirport: "MAA", travelDate: "2026-11-13" },
      ],
    };

    const flight2 = {
      tripType: 1,
      passengers: { adults: 1, children: 0 },
      segments: [
        { departureAirport: "JFK", arrivalAirport: "LHR", travelDate: "2026-11-13" },
      ],
    };

    const key1 = buildCacheKey(flight1);
    const key2 = buildCacheKey(flight2);

    expect(key1).not.toBe(key2);
    expect(key1).toContain("BOM");
    expect(key1).toContain("MAA");
    expect(key2).toContain("JFK");
    expect(key2).toContain("LHR");
  });

  it("stores and retrieves cached values with TTL", () => {
    const cache = createCache<string>();
    set(cache, "test-key", "flight-data", 1000);

    expect(get(cache, "test-key")).toBe("flight-data");
    expect(get(cache, "non-existent")).toBeNull();
  });
});
