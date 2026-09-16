import { describe, it, expect } from "vitest";
import { handleGetFlightCarbon } from "../src/tools/get-flight-carbon.js";
import { handleGetRouteEmissions } from "../src/tools/get-route-emissions.js";
import { handleFlightUrl } from "../src/tools/flight-url.js";
import { handleLookupAirport } from "../src/tools/lookup-airport.js";
import { handleNearbyAirports } from "../src/tools/nearby-airports.js";
import { recordPrice, listTrackedRoutes } from "../src/lib/price-tracker.js";

describe("TIM and Flight Tool Handlers", () => {
  it("generates detailed Travel Impact Model report via handleGetFlightCarbon", async () => {
    const res = await handleGetFlightCarbon({
      origin: "BOM",
      destination: "MAA",
      airline: "6E",
      flightNumber: "5105",
      departureDate: "2026-11-13",
      aircraft: "Airbus A320neo",
      cabinClass: "economy",
    });

    expect(res.tag).toBe("ok");
    if (res.tag === "ok") {
      expect(res.value).toContain("Travel Impact Model (TIM) Carbon Footprint");
      expect(res.value).toContain("6E 5105");
      expect(res.value).toContain("BOM -> MAA");
      expect(res.value).toContain("Economy:");
      expect(res.value).toContain("Business Class:");
      expect(res.value).toContain("Airbus A320neo");
    }
  });

  it("computes route typical emissions via handleGetRouteEmissions", async () => {
    const res = await handleGetRouteEmissions({
      origin: "BOM",
      destination: "MAA",
    });

    expect(res.tag).toBe("ok");
    if (res.tag === "ok") {
      expect(res.value).toContain("Travel Impact Model (TIM) Route Baseline");
      expect(res.value).toContain("Great-Circle Distance:");
      expect(res.value).toContain("Typical Market Baseline Emissions");
      expect(res.value).toContain("Next-Gen Fleet");
    }
  });

  it("generates clickable booking links via handleFlightUrl", async () => {
    const res = await handleFlightUrl({
      origin: "BOM",
      destination: "MAA",
      departureDate: "2026-11-13",
      returnDate: "2026-11-15",
      cabinClass: "economy",
      currency: "INR",
    });

    expect(res.tag).toBe("ok");
    if (res.tag === "ok") {
      expect(res.value).toContain("https://www.google.com/travel/flights");
      expect(res.value).toContain("BOM");
      expect(res.value).toContain("MAA");
      expect(res.value).toContain("INR");
    }
  });

  it("handles airport queries cleanly", async () => {
    const res = await handleLookupAirport({ query: "Chennai" });
    expect(res.tag).toBe("ok");
    if (res.tag === "ok") {
      expect(res.value).toContain("MAA");
      expect(res.value).toContain("Chennai");
    }
  });

  it("tracks prices and retrieves tracked routes", async () => {
    recordPrice("BOM", "MAA", "2026-11-13", "2026-11-15", 5483, "INR");
    const listRes = listTrackedRoutes();
    expect(listRes.tag).toBe("ok");
    if (listRes.tag === "ok") {
      expect(listRes.value.some((r) => r.origin === "BOM" && r.destination === "MAA")).toBe(true);
    }
  });
});
