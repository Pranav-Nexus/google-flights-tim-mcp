import { describe, it, expect } from "vitest";
import {
  lookupAirport,
  getAirportByCode,
  findNearbyAirports,
  haversineKm,
} from "../src/data/airports.js";

describe("Airport Lookup & Geo Calculations", () => {
  it("finds airports by exact IATA code", () => {
    const bom = lookupAirport("BOM");
    expect(bom.length).toBeGreaterThan(0);
    expect(bom[0]?.code).toBe("BOM");
    expect(bom[0]?.city).toBe("Mumbai");

    const jfk = lookupAirport("JFK");
    expect(jfk[0]?.code).toBe("JFK");
  });

  it("finds airports by city name", () => {
    const london = lookupAirport("London");
    expect(london.some((a) => a.code === "LHR")).toBe(true);
    expect(london.some((a) => a.code === "LGW")).toBe(true);
  });

  it("calculates accurate Haversine distance", () => {
    // SFO to LAX is approx 543 km
    const sfo = getAirportByCode("SFO");
    const lax = getAirportByCode("LAX");
    expect(sfo).toBeDefined();
    expect(lax).toBeDefined();

    const dist = Math.round(haversineKm(sfo!.lat!, sfo!.lon!, lax!.lat!, lax!.lon!));
    expect(dist).toBeGreaterThan(530);
    expect(dist).toBeLessThan(560);
  });

  it("finds nearby commercial airports within radius", () => {
    // Nearby NYC airports for JFK
    const nearby = findNearbyAirports("JFK", 100);
    expect(nearby.length).toBeGreaterThan(0);
    expect(nearby.some((a) => a.airport.code === "LGA")).toBe(true);
    expect(nearby.some((a) => a.airport.code === "EWR")).toBe(true);
  });
});
