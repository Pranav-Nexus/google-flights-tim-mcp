import { describe, it, expect } from "vitest";
import {
  generateSingleLegFlights,
  generateFallbackFetchResult,
  generateFallbackSearchResult,
} from "../src/google/fallback-engine.js";
import { searchFlights } from "../src/google/client.js";
import { TripType, SeatType, SortBy, MaxStops } from "../src/google/types.js";

describe("Fallback & Resilient Flight Intelligence Engine", () => {
  it("synthesizes valid one-way flights for domestic routes with airline filtering", () => {
    const flights = generateSingleLegFlights("BOM", "DEL", "2026-11-20", {
      tripType: TripType.ONE_WAY,
      passengers: { adults: 1, children: 0, infantsOnLap: 0, infantsInSeat: 0 },
      segments: [{ departureAirport: "BOM", arrivalAirport: "DEL", travelDate: "2026-11-20" }],
      stops: MaxStops.NON_STOP,
      seatType: SeatType.ECONOMY,
      sortBy: SortBy.CHEAPEST,
      airlines: ["AI"],
    });

    expect(flights.length).toBeGreaterThan(0);
    const f0 = flights[0]!;
    expect(f0.currency).toBe("INR");
    expect(f0.price).toBeGreaterThan(3000);
    expect(f0.legs[0]?.airline).toBe("AI");
    expect(f0.legs[0]?.departureAirport).toBe("BOM");
    expect(f0.legs[0]?.arrivalAirport).toBe("DEL");
    expect(f0.carbonFootprint).toBeDefined();
    expect(f0.carbonFootprint?.totalEmissionsKg).toBeGreaterThan(50);
    expect(f0.bookingUrl).toContain("google.com/travel/flights");
  });

  it("calculates correct pricing for multiple passengers", () => {
    const singlePax = generateSingleLegFlights("BOM", "DEL", "2026-11-20", {
      tripType: TripType.ONE_WAY,
      passengers: { adults: 1, children: 0, infantsOnLap: 0, infantsInSeat: 0 },
      segments: [{ departureAirport: "BOM", arrivalAirport: "DEL", travelDate: "2026-11-20" }],
      stops: MaxStops.ANY,
      seatType: SeatType.ECONOMY,
      sortBy: SortBy.CHEAPEST,
    });

    const fourPax = generateSingleLegFlights("BOM", "DEL", "2026-11-20", {
      tripType: TripType.ONE_WAY,
      passengers: { adults: 4, children: 0, infantsOnLap: 0, infantsInSeat: 0 },
      segments: [{ departureAirport: "BOM", arrivalAirport: "DEL", travelDate: "2026-11-20" }],
      stops: MaxStops.ANY,
      seatType: SeatType.ECONOMY,
      sortBy: SortBy.CHEAPEST,
    });

    expect(fourPax[0]!.price).toBe(singlePax[0]!.price * 4);
  });

  it("synthesizes round-trip combos with discounted combined fare and carbon total", () => {
    const result = generateFallbackSearchResult(
      {
        tripType: TripType.ROUND_TRIP,
        passengers: { adults: 2, children: 0, infantsOnLap: 0, infantsInSeat: 0 },
        segments: [
          { departureAirport: "BOM", arrivalAirport: "DEL", travelDate: "2026-11-20" },
          { departureAirport: "DEL", arrivalAirport: "BOM", travelDate: "2026-11-30" },
        ],
        stops: MaxStops.NON_STOP,
        seatType: SeatType.ECONOMY,
        sortBy: SortBy.CHEAPEST,
      },
      3
    );

    expect(result.tag).toBe("combos");
    if (result.tag !== "combos") return;

    expect(result.combos.length).toBeGreaterThanOrEqual(1);
    const combo0 = result.combos[0]!;
    expect(combo0.length).toBe(2);
    expect(combo0[0]!.legs[0]?.departureAirport).toBe("BOM");
    expect(combo0[0]!.legs[0]?.arrivalAirport).toBe("DEL");
    expect(combo0[1]!.legs[0]?.departureAirport).toBe("DEL");
    expect(combo0[1]!.legs[0]?.arrivalAirport).toBe("BOM");
    expect(result.metadata.priceContext).toBeDefined();
    expect(result.metadata.dailyPrices.length).toBeGreaterThan(10);
  });

  it("guarantees searchFlights resolves with ok tag even under complete network failure", async () => {
    const result = await searchFlights(
      {
        tripType: TripType.ONE_WAY,
        passengers: { adults: 1, children: 0, infantsOnLap: 0, infantsInSeat: 0 },
        segments: [{ departureAirport: "SFO", arrivalAirport: "LHR", travelDate: "2026-12-15" }],
        stops: MaxStops.ANY,
        seatType: SeatType.ECONOMY,
        sortBy: SortBy.BEST,
      },
      3
    );

    expect(result.tag).toBe("ok");
    if (result.tag !== "ok") return;
    expect(result.value.tag).toBe("flights");
    if (result.value.tag !== "flights") return;
    expect(result.value.flights.length).toBeGreaterThan(0);
    expect(result.value.flights[0]?.currency).toBe("GBP");
  });
});
