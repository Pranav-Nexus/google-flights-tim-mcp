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
import { formatDuration } from "../lib/date.js";
import { ok, err, type Result } from "../lib/result.js";

export const analyzeLayoversSchema = z.object({
  origin: z.string().min(3).describe("Departure airport IATA code (e.g., 'JFK')"),
  destination: z.string().min(3).describe("Arrival airport IATA code (e.g., 'SIN')"),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").describe("Departure date in YYYY-MM-DD format"),
  cabinClass: z.enum(["economy", "premium_economy", "business", "first"]).optional().default("economy").describe("Cabin class"),
  maxResults: z.number().int().min(1).max(10).optional().default(5).describe("Maximum connecting flights to analyze"),
});

const calculateLayoverMinutes = (arrTime: string, nextDepTime: string): number => {
  const arr = new Date(arrTime).getTime();
  const dep = new Date(nextDepTime).getTime();
  return Math.round((dep - arr) / (1000 * 60));
};

export const handleAnalyzeLayovers = async (
  params: z.infer<typeof analyzeLayoversSchema>
): Promise<Result<string>> => {
  const filters: FlightSearchFilters = {
    tripType: TripType.ONE_WAY,
    passengers: { adults: 1, children: 0, infantsOnLap: 0, infantsInSeat: 0 },
    segments: [{ departureAirport: params.origin.toUpperCase(), arrivalAirport: params.destination.toUpperCase(), travelDate: params.departureDate }],
    stops: MaxStops.ANY,
    seatType: SeatType.ECONOMY,
    sortBy: SortBy.BEST,
  };

  const res = await searchFlights(filters, 15);
  if (res.tag === "err") return res;
  if (res.value.tag !== "flights") return err("Unsupported search result structure");

  const connectingFlights = res.value.flights.filter((f) => f.stops > 0);

  if (connectingFlights.length === 0) {
    return ok(`All available flights for ${params.origin.toUpperCase()} to ${params.destination.toUpperCase()} on ${params.departureDate} are non-stop (0 layovers).`);
  }

  const lines = connectingFlights.slice(0, params.maxResults ?? 5).map((f, i) => {
    const flightPrice = formatPrice(f.price, f.currency);
    const flightDuration = formatDuration(f.duration);

    const layoverDetails = f.legs.slice(0, -1).map((leg, idx) => {
      const nextLeg = f.legs[idx + 1]!;
      const layoverMins = calculateLayoverMinutes(leg.arrivalTime, nextLeg.departureTime);
      const airport = leg.arrivalAirport;
      const isOvernight = new Date(leg.arrivalTime).getDate() !== new Date(nextLeg.departureTime).getDate();

      let riskAssessment = "Standard connection";
      if (layoverMins < 60) riskAssessment = "⚠️ TIGHT CONNECTION (High risk of missed flight)";
      else if (layoverMins >= 60 && layoverMins <= 180) riskAssessment = "✅ Comfortable transfer window";
      else if (layoverMins > 360) riskAssessment = "⏳ Long layover";

      const overnightStr = isOvernight ? " [Overnight stay required]" : "";

      return `      • Layover at ${airport}: ${formatDuration(layoverMins)} (${riskAssessment})${overnightStr}
        Incoming: ${leg.airline} ${leg.flightNumber} (lands ${leg.arrivalTime.replace("T", " ")})
        Outgoing: ${nextLeg.airline} ${nextLeg.flightNumber} (departs ${nextLeg.departureTime.replace("T", " ")})`;
    }).join("\n");

    return `Option #${i + 1}: ${flightPrice} | Total Journey: ${flightDuration} (${f.stops} stop(s))\n${layoverDetails}`;
  });

  const output = [
    `=== Connecting Flight & Layover Analysis ===`,
    `Route: ${params.origin.toUpperCase()} -> ${params.destination.toUpperCase()} (${params.departureDate})`,
    ``,
    ...lines,
    ``,
    `Connection Guidelines:`,
    `  • International-to-domestic transfers usually require clearing immigration and re-checking luggage (allow minimum 90-120 minutes).`,
    `  • European/US domestic gate-to-gate connections can be made in 45-60 minutes if terminals do not change.`,
  ].join("\n");

  return ok(output);
};
