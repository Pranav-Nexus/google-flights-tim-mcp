import { z } from "zod";
import { lookupAirport } from "../data/airports.js";
import { ok } from "../lib/result.js";
export const lookupAirportSchema = z.object({
    query: z
        .string()
        .min(1)
        .describe("Search query: airport IATA code (e.g., 'JFK', 'BOM'), city name (e.g., 'Tokyo', 'London'), or airport name"),
});
export const handleLookupAirport = async (params) => {
    const matches = lookupAirport(params.query);
    if (matches.length === 0) {
        return ok(`No airports found matching query '${params.query}'.`);
    }
    const lines = matches.map((a) => `  • [${a.code}] ${a.name} — ${a.city}, ${a.country}${a.lat !== undefined ? ` (Coords: ${a.lat.toFixed(2)}, ${a.lon?.toFixed(2)})` : ""}`);
    return ok(`Airports matching '${params.query}' (${matches.length} found):\n${lines.join("\n")}`);
};
//# sourceMappingURL=lookup-airport.js.map