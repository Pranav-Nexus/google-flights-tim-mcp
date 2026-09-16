import { z } from "zod";
import { searchFlights } from "../google/client.js";
import {
  TripType,
  SeatType,
  SortBy,
  MaxStops,
  type FlightSearchFilters,
} from "../google/types.js";
import { recordPrice, getRouteHistory } from "../lib/price-tracker.js";
import { formatPrice } from "../lib/format.js";
import { ok, err, type Result } from "../lib/result.js";

export const trackPriceSchema = z.object({
  origin: z.string().min(3).describe("Departure airport IATA code (e.g., 'JFK')"),
  destination: z.string().min(3).describe("Arrival airport IATA code (e.g., 'LHR')"),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").describe("Departure date in YYYY-MM-DD format"),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional().describe("Return date in YYYY-MM-DD format (omit for one-way)"),
});

export const handleTrackPrice = async (
  params: z.infer<typeof trackPriceSchema>
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

  const res = await searchFlights(filters, 1);
  if (res.tag === "err") return res;

  const flight = res.value.tag === "combos"
    ? res.value.combos[0]?.[0]
    : res.value.flights[0];

  if (!flight) {
    return err("No flights found to record a price point.");
  }

  const recRes = recordPrice(
    params.origin,
    params.destination,
    params.departureDate,
    params.returnDate ?? null,
    flight.price,
    flight.currency ?? "USD"
  );

  if (recRes.tag === "err") return recRes;

  const history = getRouteHistory(params.origin, params.destination, params.departureDate, params.returnDate ?? null);
  const count = history.tag === "ok" ? history.value.length : 1;

  const output = [
    `✅ Price Tracked Successfully!`,
    `Route: ${params.origin.toUpperCase()} -> ${params.destination.toUpperCase()} (${params.departureDate}${params.returnDate ? ` to ${params.returnDate}` : ""})`,
    `Current Lowest Price: ${formatPrice(flight.price, flight.currency)}`,
    `Total Datapoints Recorded: ${count}`,
    `This route is now saved in your price tracker. Query 'get_price_history' or 'list_tracked_routes' anytime to observe fare swings.`,
  ].join("\n");

  return ok(output);
};
