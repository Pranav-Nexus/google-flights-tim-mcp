import { z } from "zod";
import { searchFlights } from "../google/client.js";
import { TripType, SeatType, SortBy, MaxStops, } from "../google/types.js";
import { formatPrice } from "../lib/format.js";
import { formatDuration } from "../lib/date.js";
import { ok } from "../lib/result.js";
export const compareCabinClassesSchema = z.object({
    origin: z.string().min(3).describe("Departure airport IATA code (e.g., 'JFK')"),
    destination: z.string().min(3).describe("Arrival airport IATA code (e.g., 'LHR')"),
    departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").describe("Departure date in YYYY-MM-DD format"),
    returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional().describe("Return date in YYYY-MM-DD format (omit for one-way)"),
    adults: z.number().int().min(1).optional().default(1).describe("Number of adult passengers"),
});
const CABINS = [
    { name: "Economy", type: SeatType.ECONOMY, multiplier: "1.0x baseline" },
    { name: "Premium Economy", type: SeatType.PREMIUM_ECONOMY, multiplier: "1.5x floor area" },
    { name: "Business", type: SeatType.BUSINESS, multiplier: "3.0x floor area" },
    { name: "First", type: SeatType.FIRST, multiplier: "4.0x floor area" },
];
export const handleCompareCabinClasses = async (params) => {
    const isRoundTrip = params.returnDate !== undefined;
    const outbound = {
        departureAirport: params.origin.toUpperCase(),
        arrivalAirport: params.destination.toUpperCase(),
        travelDate: params.departureDate,
    };
    const segments = isRoundTrip && params.returnDate
        ? [outbound, { departureAirport: params.destination.toUpperCase(), arrivalAirport: params.origin.toUpperCase(), travelDate: params.returnDate }]
        : [outbound];
    const results = await Promise.all(CABINS.map(async (cabin) => {
        const filters = {
            tripType: isRoundTrip ? TripType.ROUND_TRIP : TripType.ONE_WAY,
            passengers: { adults: params.adults ?? 1, children: 0, infantsOnLap: 0, infantsInSeat: 0 },
            segments,
            stops: MaxStops.ANY,
            seatType: cabin.type,
            sortBy: SortBy.CHEAPEST,
        };
        const res = await searchFlights(filters, 1);
        if (res.tag === "err")
            return { ...cabin, flight: null, error: res.error };
        const best = res.value.tag === "combos"
            ? res.value.combos[0]?.[0] ?? null
            : res.value.flights[0] ?? null;
        return { ...cabin, flight: best, error: null };
    }));
    const lines = results.map((r) => {
        if (!r.flight) {
            return `### ${r.name}\n  Status: No fares available (${r.error ?? "N/A"})`;
        }
        const f = r.flight;
        const price = formatPrice(f.price, f.currency);
        const co2Kg = f.carbonFootprint?.totalEmissionsKg ?? "N/A";
        const badge = f.carbonFootprint?.badge ?? "";
        const leg0 = f.legs[0];
        const carrier = leg0 ? `${leg0.airline} ${leg0.flightNumber}` : "";
        return `### ${r.name}
  • Lowest Fare: ${price} (${carrier} | ${formatDuration(f.duration)} | ${f.stops} stop)
  • TIM Carbon Footprint: ${co2Kg} kg CO2e (${badge})
  • Space / Emission Weighting: ${r.multiplier}`;
    });
    const tripLabel = isRoundTrip
        ? `${params.origin.toUpperCase()} <-> ${params.destination.toUpperCase()} (${params.departureDate} to ${params.returnDate})`
        : `${params.origin.toUpperCase()} -> ${params.destination.toUpperCase()} (${params.departureDate})`;
    const output = [
        `=== Cabin Class Comparison & Carbon Impact ===`,
        `Route: ${tripLabel}`,
        ``,
        ...lines,
        ``,
        `Environmental Note: Business and First class seats occupy significantly more physical cabin floor area and weight, resulting in 2x to 4x higher per-passenger carbon emissions under the Travel Impact Model.`,
    ].join("\n");
    return ok(output);
};
//# sourceMappingURL=compare-cabin-classes.js.map