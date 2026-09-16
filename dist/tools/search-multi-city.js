import { z } from "zod";
import { searchFlights } from "../google/client.js";
import { TripType, SeatType, SortBy, MaxStops, } from "../google/types.js";
import { formatPrice } from "../lib/format.js";
import { formatDuration } from "../lib/date.js";
const segmentSchema = z.object({
    origin: z.string().min(3).describe("Departure airport IATA code (e.g., 'JFK')"),
    destination: z.string().min(3).describe("Arrival airport IATA code (e.g., 'LHR')"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").describe("Travel date in YYYY-MM-DD format"),
});
export const searchMultiCitySchema = z.object({
    segments: z.array(segmentSchema).min(2).max(6).describe("Ordered flight segments (2-6 legs)"),
    cabinClass: z.enum(["economy", "premium_economy", "business", "first"]).optional().default("economy").describe("Cabin class"),
    adults: z.number().int().min(1).optional().default(1).describe("Number of adult passengers"),
    children: z.number().int().min(0).optional().default(0).describe("Number of child passengers"),
    infants: z.number().int().min(0).optional().default(0).describe("Number of infant passengers"),
    maxStops: z.number().int().min(0).max(2).optional().describe("Maximum number of stops per segment (0=nonstop, 1, 2)"),
    sortBy: z.enum(["best", "price", "duration"]).optional().default("best").describe("Sort results by"),
    maxResults: z.number().int().min(1).max(10).optional().default(5).describe("Maximum number of itinerary combinations to return"),
});
const SEAT_MAP = {
    economy: SeatType.ECONOMY, premium_economy: SeatType.PREMIUM_ECONOMY,
    business: SeatType.BUSINESS, first: SeatType.FIRST,
};
const SORT_MAP = {
    best: SortBy.BEST, price: SortBy.CHEAPEST, duration: SortBy.DURATION,
};
const STOPS_MAP = {
    0: MaxStops.NON_STOP, 1: MaxStops.ONE_OR_FEWER, 2: MaxStops.TWO_OR_FEWER,
};
const formatLeg = (leg) => {
    const dep = leg.departureTime.replace("T", " ");
    const arr = leg.arrivalTime.replace("T", " ");
    const aircraft = leg.aircraft ? ` [aircraft: ${leg.aircraft}]` : "";
    return `      ${leg.airline} ${leg.flightNumber}: ${leg.departureAirport} ${dep} -> ${leg.arrivalAirport} ${arr} (${formatDuration(leg.duration)})${aircraft}`;
};
const formatFlightSegment = (flight, index) => {
    const legs = flight.legs.map(formatLeg).join("\n");
    const carbon = flight.carbonFootprint
        ? ` | 🌿 CO2: ${flight.carbonFootprint.totalEmissionsKg}kg (${flight.carbonFootprint.badge})`
        : "";
    return `    Segment ${index + 1}: ${formatDuration(flight.duration)} | ${flight.stops} stop(s)${carbon}\n${legs}`;
};
const formatResult = (result, max) => {
    if (result.tag === "combos") {
        const lines = result.combos.slice(0, max).map((combo, i) => {
            const totalPrice = formatPrice(combo[combo.length - 1]?.price ?? 0, combo[0]?.currency);
            const totalCarbonKg = combo.reduce((sum, f) => sum + (f.carbonFootprint?.totalEmissionsKg ?? 0), 0);
            const segments = combo.map(formatFlightSegment).join("\n");
            return `--- Option ${i + 1}: Total ${totalPrice} | Total Trip CO2: ~${totalCarbonKg} kg ---\n${segments}`;
        });
        return `Multi-city itineraries:\n\n${lines.join("\n\n")}`;
    }
    const lines = result.flights.slice(0, max).map((flight, i) => `Option ${i + 1}: ${formatPrice(flight.price, flight.currency)} | ${formatDuration(flight.duration)}\n${flight.legs.map(formatLeg).join("\n")}`);
    return `Multi-city flights:\n\n${lines.join("\n\n")}`;
};
export const handleSearchMultiCity = async (params) => {
    const filters = {
        tripType: TripType.MULTI_CITY,
        passengers: { adults: params.adults ?? 1, children: params.children ?? 0, infantsOnLap: params.infants ?? 0, infantsInSeat: 0 },
        segments: params.segments.map((s) => ({
            departureAirport: s.origin.toUpperCase(),
            arrivalAirport: s.destination.toUpperCase(),
            travelDate: s.date,
        })),
        stops: params.maxStops !== undefined ? STOPS_MAP[params.maxStops] : MaxStops.ANY,
        seatType: SEAT_MAP[params.cabinClass ?? "economy"],
        sortBy: SORT_MAP[params.sortBy ?? "best"],
    };
    const result = await searchFlights(filters, params.maxResults ?? 5);
    return result.tag === "ok"
        ? { tag: "ok", value: formatResult(result.value, params.maxResults ?? 5) }
        : result;
};
//# sourceMappingURL=search-multi-city.js.map