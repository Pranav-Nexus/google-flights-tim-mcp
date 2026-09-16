import { z } from "zod";
import { buildGoogleFlightsUrl } from "../google/booking-urls.js";
import { ok, type Result } from "../lib/result.js";

export const flightUrlSchema = z.object({
  origin: z.string().min(3).describe("Departure airport IATA code (e.g., 'JFK')"),
  destination: z.string().min(3).describe("Arrival airport IATA code (e.g., 'LHR')"),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").describe("Departure date in YYYY-MM-DD format"),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional().describe("Return date in YYYY-MM-DD format (omit for one-way)"),
  cabinClass: z.enum(["economy", "premium_economy", "business", "first"]).optional().default("economy").describe("Cabin class"),
  currency: z.string().length(3).optional().default("USD").describe("Currency code for displayed prices (e.g., 'USD', 'EUR', 'INR')"),
});

export const handleFlightUrl = async (
  params: z.infer<typeof flightUrlSchema>
): Promise<Result<string>> => {
  const url = buildGoogleFlightsUrl(
    params.origin,
    params.destination,
    params.departureDate,
    params.returnDate ?? null,
    params.cabinClass ?? "economy",
    params.currency ?? "USD"
  );

  return ok(
    `Direct Google Flights Search Link:\n${url}\n\nThis shareable URL opens Google Flights directly with your selected route, dates, cabin class, and currency pre-loaded.`
  );
};
