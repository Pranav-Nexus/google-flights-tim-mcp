import { describe, it, expect } from "vitest";
import {
  computeRouteDistanceKm,
  computeEffectiveDistanceKm,
  computeLegEmissions,
  computeFlightCarbonFootprint,
} from "../src/tim/engine.js";
import { resolveAircraftProfile } from "../src/tim/aircraft-data.js";

describe("Travel Impact Model (TIM) Engine", () => {
  it("computes accurate Great Circle distance between BOM and MAA", () => {
    const distanceKm = computeRouteDistanceKm("BOM", "MAA");
    // BOM (Mumbai) to MAA (Chennai) is approx 1,020 - 1,040 km
    expect(distanceKm).toBeGreaterThan(1000);
    expect(distanceKm).toBeLessThan(1060);
  });

  it("adds ICAO standard routing factor for trajectory", () => {
    const directKm = 1030;
    const effective = computeEffectiveDistanceKm(directKm);
    // Over 550km should add 100km
    expect(effective).toBe(1130);

    const shortHop = 400;
    expect(computeEffectiveDistanceKm(shortHop)).toBe(450);
  });

  it("resolves next-gen aircraft profiles accurately", () => {
    const a320neo = resolveAircraftProfile("Airbus A320neo");
    expect(a320neo).not.toBeNull();
    expect(a320neo?.generation).toBe("next-gen");
    expect(a320neo?.fuelGramsPerPaxKm).toBe(23.0);

    const b737max = resolveAircraftProfile("Boeing 737 MAX 8");
    expect(b737max).not.toBeNull();
    expect(b737max?.generation).toBe("next-gen");

    const a350 = resolveAircraftProfile("Airbus A350-900");
    expect(a350?.fuelGramsPerPaxKm).toBe(26.0);
  });

  it("computes per-passenger emissions across cabin classes", () => {
    const leg = computeLegEmissions("BOM", "MAA", "Airbus A320neo", "economy");
    expect(leg.distanceKm).toBeGreaterThan(1000);
    expect(leg.emissionsGramsPerPax.economy).toBeGreaterThan(50_000); // > 50kg
    expect(leg.emissionsGramsPerPax.economy).toBeLessThan(120_000); // < 120kg

    // Cabin class multipliers:
    // Premium Economy = 1.5x Economy
    expect(leg.emissionsGramsPerPax.premiumEconomy).toBe(
      Math.round(leg.emissionsGramsPerPax.economy * 1.5)
    );
    // Business = 3.0x Economy
    expect(leg.emissionsGramsPerPax.business).toBe(
      Math.round(leg.emissionsGramsPerPax.economy * 3.0)
    );
    // First = 4.0x Economy
    expect(leg.emissionsGramsPerPax.first).toBe(
      Math.round(leg.emissionsGramsPerPax.economy * 4.0)
    );

    // Airbus A320neo is ~28% cleaner than baseline typical fleet
    expect(leg.deltaPercentage).toBeLessThan(0);
    expect(["A+", "A"]).toContain(leg.ecoRating);
  });

  it("computes complete flight carbon footprint and badge", () => {
    const footprint = computeFlightCarbonFootprint([
      {
        departureAirport: "BOM",
        arrivalAirport: "MAA",
        aircraft: "Airbus A320neo",
      },
    ]);

    expect(footprint.totalEmissionsKg).toBeGreaterThan(50);
    expect(footprint.totalEmissionsKg).toBeLessThan(120);
    expect(footprint.savingsPercentage).toBeGreaterThan(0);
    expect(footprint.badge).toContain("🌱");
  });
});
