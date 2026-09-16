import { z } from "zod";
import { findNearbyAirports, getAirportByCode } from "../data/airports.js";
import { ok, err, type Result } from "../lib/result.js";

export const nearbyAirportsSchema = z.object({
  code: z
    .string()
    .length(3)
    .describe("Reference airport 3-letter IATA code (e.g., 'SFO', 'LHR', 'BOM')"),
  radiusKm: z
    .number()
    .int()
    .min(10)
    .max(1000)
    .optional()
    .default(200)
    .describe("Search radius in kilometers (default: 200km)"),
});

export const handleNearbyAirports = async (
  params: z.infer<typeof nearbyAirportsSchema>
): Promise<Result<string>> => {
  const airport = getAirportByCode(params.code);
  if (!airport) {
    return err(`Airport code '${params.code}' not recognized.`);
  }

  const nearby = findNearbyAirports(params.code, params.radiusKm ?? 200);

  if (nearby.length === 0) {
    return ok(`No other commercial airports found within ${params.radiusKm ?? 200}km of ${airport.name} (${params.code.toUpperCase()}).`);
  }

  const lines = nearby.map((entry) => {
    const miles = Math.round(entry.distanceKm * 0.621371);
    return `  • [${entry.airport.code}] ${entry.airport.name} (${entry.airport.city}) — ${entry.distanceKm}km (${miles} miles) away`;
  });

  return ok(
    `Airports within ${params.radiusKm ?? 200}km of ${airport.name} [${params.code.toUpperCase()}]:\n${lines.join("\n")}`
  );
};
