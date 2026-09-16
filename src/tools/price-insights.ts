import { z } from "zod";
import { searchFlights } from "../google/client.js";
import {
  TripType,
  SeatType,
  SortBy,
  MaxStops,
  type FlightSearchFilters,
} from "../google/types.js";
import { formatPrice } from "../lib/format.js";
import { ok, type Result } from "../lib/result.js";

export const priceInsightsSchema = z.object({
  origin: z.string().min(3).describe("Departure airport IATA code (e.g., 'JFK')"),
  destination: z.string().min(3).describe("Arrival airport IATA code (e.g., 'LHR')"),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").describe("Departure date in YYYY-MM-DD format"),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional().describe("Return date in YYYY-MM-DD format (omit for one-way)"),
  cabinClass: z.enum(["economy", "premium_economy", "business", "first"]).optional().default("economy").describe("Cabin class"),
});

export const handlePriceInsights = async (
  params: z.infer<typeof priceInsightsSchema>
): Promise<Result<string>> => {
  const isRoundTrip = params.returnDate !== undefined;
  const outbound = {
    departureAirport: params.origin.toUpperCase(),
    arrivalAirport: params.destination.toUpperCase(),
    travelDate: params.departureDate,
  };
  const segments = isRoundTrip && params.returnDate
    ? [outbound, { departureAirport: params.destination.toUpperCase(), arrivalAirport: params.origin.toUpperCase(), travelDate: params.returnDate }]
    : [outbound];

  const filters: FlightSearchFilters = {
    tripType: isRoundTrip ? TripType.ROUND_TRIP : TripType.ONE_WAY,
    passengers: { adults: 1, children: 0, infantsOnLap: 0, infantsInSeat: 0 },
    segments,
    stops: MaxStops.ANY,
    seatType: SeatType.ECONOMY,
    sortBy: SortBy.CHEAPEST,
  };

  const res = await searchFlights(filters, 5);
  if (res.tag === "err") return res;

  const ctx = res.value.metadata.priceContext;
  if (!ctx) {
    return ok(`No historical price context currently available for ${params.origin.toUpperCase()} to ${params.destination.toUpperCase()}.`);
  }

  const advice =
    ctx.assessment === "low"
      ? "🎯 Prices are currently LOWER than usual. This is an excellent time to book."
      : ctx.assessment === "high"
      ? "⚠️ Prices are currently HIGHER than usual. If dates are flexible, consider tracking this route or delaying booking."
      : "⚖️ Prices are currently TYPICAL for this route.";

  const currency =
    res.value.tag === "flights"
      ? res.value.flights[0]?.currency
      : res.value.combos[0]?.[0]?.currency;

  const diffStr =
    ctx.priceDifference < 0
      ? `${formatPrice(Math.abs(ctx.priceDifference), currency)} cheaper than typical`
      : ctx.priceDifference > 0
      ? `${formatPrice(ctx.priceDifference, currency)} more expensive than typical`
      : "at the typical rate";

  const output = [
    `=== Google Flights Price Insights ===`,
    `Route: ${params.origin.toUpperCase()} -> ${params.destination.toUpperCase()} (${params.departureDate})`,
    `Current Price Assessment: ${ctx.assessment.toUpperCase()} (${diffStr})`,
    `Typical Market Price: ${formatPrice(ctx.typicalPrice, currency)}`,
    `Observed Price Range: ${formatPrice(ctx.lowPrice, currency)} - ${formatPrice(ctx.highPrice, currency)}`,
    ``,
    `Booking Recommendation:`,
    advice,
  ].join("\n");

  return ok(output);
};
