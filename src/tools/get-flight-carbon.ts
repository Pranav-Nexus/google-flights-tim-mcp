import { z } from "zod";
import { computeLegEmissions, computeFlightCarbonFootprint } from "../tim/engine.js";
import { formatCarbonFootprintReport } from "../tim/formatter.js";
import { enrichFlightWithTIM } from "../tim/api.js";
import { ok, type Result } from "../lib/result.js";

export const getFlightCarbonSchema = z.object({
  origin: z
    .string()
    .length(3)
    .describe("Departure airport IATA code (e.g., 'BOM', 'JFK')"),
  destination: z
    .string()
    .length(3)
    .describe("Arrival airport IATA code (e.g., 'MAA', 'LHR')"),
  airline: z
    .string()
    .optional()
    .describe("Operating airline 2-character IATA code (e.g., '6E', 'AI', 'BA')"),
  flightNumber: z
    .string()
    .optional()
    .describe("Flight number (e.g., '5105' or '6E 5105')"),
  departureDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .describe("Flight departure date in YYYY-MM-DD format"),
  aircraft: z
    .string()
    .optional()
    .describe("Aircraft model name or code (e.g., 'Airbus A320neo', 'Boeing 787-9', 'A350')"),
  cabinClass: z
    .enum(["economy", "premium_economy", "business", "first"])
    .optional()
    .default("economy")
    .describe("Chosen cabin class for passenger seat allocation weighting"),
});

export const handleGetFlightCarbon = async (
  params: z.infer<typeof getFlightCarbonSchema>
): Promise<Result<string>> => {
  const origin = params.origin.toUpperCase();
  const destination = params.destination.toUpperCase();
  const flightTitle = `${params.airline ?? ""} ${params.flightNumber ?? ""} (${origin} -> ${destination}) on ${params.departureDate}`.trim();

  const legs = [
    {
      departureAirport: origin,
      arrivalAirport: destination,
      airline: params.airline ?? "XX",
      flightNumber: params.flightNumber ?? "000",
      departureTime: `${params.departureDate}T12:00:00`,
      aircraft: params.aircraft ?? null,
    },
  ];

  const footprint = await enrichFlightWithTIM(legs, params.cabinClass ?? "economy");
  const report = formatCarbonFootprintReport(flightTitle, footprint);

  return ok(report);
};
