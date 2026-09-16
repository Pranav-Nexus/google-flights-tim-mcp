import { z } from "zod";
import { searchFlights } from "../google/client.js";
import { TripType, SeatType, SortBy, MaxStops, } from "../google/types.js";
import { formatPrice } from "../lib/format.js";
import { formatDuration } from "../lib/date.js";
import { ok, err } from "../lib/result.js";
export const compareFlightEmissionsSchema = z.object({
    origin: z
        .string()
        .length(3)
        .describe("Departure airport IATA code (e.g., 'BOM', 'JFK')"),
    destination: z
        .string()
        .length(3)
        .describe("Arrival airport IATA code (e.g., 'MAA', 'LHR')"),
    departureDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
        .describe("Departure date in YYYY-MM-DD format"),
    cabinClass: z
        .enum(["economy", "premium_economy", "business", "first"])
        .optional()
        .default("economy")
        .describe("Cabin class for emissions weighting"),
    maxResults: z
        .number()
        .int()
        .min(2)
        .max(15)
        .optional()
        .default(6)
        .describe("Number of flight options to compare"),
});
const SEAT_MAP = {
    economy: SeatType.ECONOMY,
    premium_economy: SeatType.PREMIUM_ECONOMY,
    business: SeatType.BUSINESS,
    first: SeatType.FIRST,
};
export const handleCompareFlightEmissions = async (params) => {
    const filters = {
        tripType: TripType.ONE_WAY,
        passengers: { adults: 1, children: 0, infantsOnLap: 0, infantsInSeat: 0 },
        segments: [
            {
                departureAirport: params.origin.toUpperCase(),
                arrivalAirport: params.destination.toUpperCase(),
                travelDate: params.departureDate,
            },
        ],
        stops: MaxStops.ANY,
        seatType: SEAT_MAP[params.cabinClass ?? "economy"],
        sortBy: SortBy.BEST,
    };
    const res = await searchFlights(filters, 15);
    if (res.tag === "err")
        return res;
    if (res.value.tag !== "flights" || res.value.flights.length === 0) {
        return err("No flights found on this route to compare.");
    }
    // Sort strictly by emissions ascending (lowest carbon first)
    const sortedByCarbon = [...res.value.flights].sort((a, b) => {
        const emA = a.carbonFootprint?.totalEmissionsKg ?? 9999;
        const emB = b.carbonFootprint?.totalEmissionsKg ?? 9999;
        return emA - emB;
    });
    const greenest = sortedByCarbon[0];
    const leastGreen = sortedByCarbon[sortedByCarbon.length - 1];
    const greenestKg = greenest.carbonFootprint?.totalEmissionsKg ?? 0;
    const highestKg = leastGreen.carbonFootprint?.totalEmissionsKg ?? 0;
    const maxSavingsKg = Math.max(0, highestKg - greenestKg);
    const lines = sortedByCarbon
        .slice(0, params.maxResults ?? 6)
        .map((flight, idx) => {
        const leg0 = flight.legs[0];
        const lastLeg = flight.legs[flight.legs.length - 1];
        const dep = leg0.departureTime.split("T")[1] ?? "";
        const arr = lastLeg.arrivalTime.split("T")[1] ?? "";
        const price = formatPrice(flight.price, flight.currency);
        const kg = flight.carbonFootprint?.totalEmissionsKg ?? 0;
        const badge = flight.carbonFootprint?.badge ?? "";
        const aircraft = leg0.aircraft ? `[${leg0.aircraft}]` : "";
        const rankBadge = idx === 0
            ? "🏆 GREENEST OPTION"
            : idx === 1
                ? "🥈 2nd Cleanest"
                : `Option #${idx + 1}`;
        return `[${rankBadge}] ${leg0.airline} ${leg0.flightNumber} (${dep} -> ${arr}) | ${formatDuration(flight.duration)} | ${flight.stops} stop(s)
  • Carbon: ${kg} kg CO2e (${badge}) ${aircraft}
  • Fare: ${price}
  • Booking: ${flight.bookingUrl ?? "Google Flights"}`;
    });
    const summaryHeader = [
        `=== Travel Impact Model (TIM) Eco-Flyer Comparison ===`,
        `Route: ${params.origin.toUpperCase()} -> ${params.destination.toUpperCase()} on ${params.departureDate} (${params.cabinClass?.toUpperCase()})`,
        `Ranked by Carbon Efficiency (Lowest CO2e First):`,
        `Potential Environmental Impact: Choosing the greenest option saves up to ${maxSavingsKg} kg CO2e per passenger on this journey.`,
        ``,
    ];
    return ok([...summaryHeader, ...lines].join("\n\n"));
};
//# sourceMappingURL=compare-flight-emissions.js.map