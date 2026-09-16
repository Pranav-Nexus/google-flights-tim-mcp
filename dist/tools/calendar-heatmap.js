import { z } from "zod";
import { searchFlights } from "../google/client.js";
import { TripType, SeatType, SortBy, MaxStops, } from "../google/types.js";
import { formatPrice } from "../lib/format.js";
import { ok } from "../lib/result.js";
export const calendarHeatmapSchema = z.object({
    origin: z.string().min(3).describe("Departure airport IATA code (e.g., 'JFK')"),
    destination: z.string().min(3).describe("Arrival airport IATA code (e.g., 'LHR')"),
    month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be YYYY-MM").describe("Target month in YYYY-MM format (e.g., '2026-11')"),
    cabinClass: z.enum(["economy", "premium_economy", "business", "first"]).optional().default("economy").describe("Cabin class"),
});
const SEAT_MAP = {
    economy: SeatType.ECONOMY, premium_economy: SeatType.PREMIUM_ECONOMY,
    business: SeatType.BUSINESS, first: SeatType.FIRST,
};
export const handleCalendarHeatmap = async (params) => {
    const travelDate = `${params.month}-15`;
    const filters = {
        tripType: TripType.ONE_WAY,
        passengers: { adults: 1, children: 0, infantsOnLap: 0, infantsInSeat: 0 },
        segments: [{ departureAirport: params.origin.toUpperCase(), arrivalAirport: params.destination.toUpperCase(), travelDate }],
        stops: MaxStops.ANY,
        seatType: SEAT_MAP[params.cabinClass ?? "economy"],
        sortBy: SortBy.CHEAPEST,
    };
    const res = await searchFlights(filters, 5);
    if (res.tag === "err")
        return res;
    const daily = res.value.metadata.dailyPrices;
    if (!daily || daily.length === 0) {
        return ok(`No calendar pricing data returned for ${params.month}. Try running a direct search for specific dates.`);
    }
    const currency = res.value.tag === "flights"
        ? res.value.flights[0]?.currency
        : res.value.combos[0]?.[0]?.currency;
    const prices = daily.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const entries = daily
        .filter((d) => d.date.startsWith(params.month))
        .map((d) => {
        let tag = "  ";
        if (d.price === minPrice)
            tag = "🟢 CHEAPEST";
        else if (d.price <= avgPrice)
            tag = "⚪ Great deal";
        else
            tag = "🔴 High";
        return `  ${d.date}: ${formatPrice(d.price, currency)} [${tag}]`;
    });
    const output = [
        `=== Fare Calendar Heatmap: ${params.origin.toUpperCase()} -> ${params.destination.toUpperCase()} (${params.month}) ===`,
        `Lowest Fare: ${formatPrice(minPrice, currency)} | Average: ${formatPrice(avgPrice, currency)} | Peak: ${formatPrice(maxPrice, currency)}`,
        ``,
        ...entries,
    ].join("\n");
    return ok(output);
};
//# sourceMappingURL=calendar-heatmap.js.map