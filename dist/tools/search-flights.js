import { z } from "zod";
import { searchFlights } from "../google/client.js";
import { TripType, SeatType, SortBy, MaxStops, } from "../google/types.js";
import { formatPrice } from "../lib/format.js";
import { formatDuration } from "../lib/date.js";
export const searchFlightsSchema = z.object({
    origin: z
        .string()
        .min(3)
        .describe("Departure airport IATA code or comma-separated list of airport codes (e.g., 'JFK' or 'JFK,LGA')"),
    destination: z
        .string()
        .min(3)
        .describe("Arrival airport IATA code or comma-separated list of airport codes (e.g., 'LHR' or 'LHR,LGW')"),
    departureDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
        .describe("Departure date in YYYY-MM-DD format"),
    returnDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
        .optional()
        .describe("Return date in YYYY-MM-DD format (makes it round-trip)"),
    cabinClass: z
        .enum(["economy", "premium_economy", "business", "first"])
        .optional()
        .default("economy")
        .describe("Cabin class for seats and carbon footprint weighting"),
    adults: z
        .number()
        .int()
        .min(1)
        .optional()
        .default(1)
        .describe("Number of adult passengers"),
    children: z
        .number()
        .int()
        .min(0)
        .optional()
        .default(0)
        .describe("Number of child passengers"),
    infants: z
        .number()
        .int()
        .min(0)
        .optional()
        .default(0)
        .describe("Number of infant passengers"),
    maxStops: z
        .number()
        .int()
        .min(0)
        .max(2)
        .optional()
        .describe("Maximum number of stops (0=nonstop, 1, 2). Omit for any."),
    sortBy: z
        .enum(["best", "price", "duration", "departure", "arrival", "emissions"])
        .optional()
        .default("best")
        .describe("Sort results by best, price, duration, departure, arrival, or emissions"),
    departureWindow: z
        .string()
        .optional()
        .describe("Preferred departure time window in 'HH-HH' 24-hour format (e.g., '6-12' for morning, '18-24' for evening)"),
    airlines: z
        .array(z.string())
        .optional()
        .describe("Filter by airline IATA codes (e.g., ['6E', 'AI', 'BA'])"),
    maxResults: z
        .number()
        .int()
        .min(1)
        .max(20)
        .optional()
        .default(5)
        .describe("Maximum number of results to return"),
});
const SEAT_MAP = {
    economy: SeatType.ECONOMY,
    premium_economy: SeatType.PREMIUM_ECONOMY,
    business: SeatType.BUSINESS,
    first: SeatType.FIRST,
};
const SORT_MAP = {
    best: SortBy.BEST,
    price: SortBy.CHEAPEST,
    duration: SortBy.DURATION,
    departure: SortBy.DEPARTURE_TIME,
    arrival: SortBy.ARRIVAL_TIME,
    emissions: SortBy.EMISSIONS,
};
const STOPS_MAP = {
    0: MaxStops.NON_STOP,
    1: MaxStops.ONE_OR_FEWER,
    2: MaxStops.TWO_OR_FEWER,
};
const formatLeg = (leg) => {
    const dep = leg.departureTime.replace("T", " ");
    const arr = leg.arrivalTime.replace("T", " ");
    const extras = [
        leg.aircraft ? `aircraft: ${leg.aircraft}` : null,
        leg.seatPitch ? `seat pitch: ${leg.seatPitch}` : null,
    ].filter(Boolean);
    const extraStr = extras.length > 0 ? ` [${extras.join(", ")}]` : "";
    return `    ${leg.airline} ${leg.flightNumber}: ${leg.departureAirport} ${dep} -> ${leg.arrivalAirport} ${arr} (${formatDuration(leg.duration)})${extraStr}`;
};
const formatFlightResult = (flight, index) => {
    const legs = flight.legs.map(formatLeg).join("\n");
    const price = formatPrice(flight.price, flight.currency);
    let carbonTag = "";
    if (flight.carbonFootprint) {
        carbonTag = ` | 🌿 CO2: ${flight.carbonFootprint.totalEmissionsKg}kg (${flight.carbonFootprint.badge})`;
    }
    else if (flight.totalEmissionsGrams) {
        carbonTag = ` | CO2: ${Math.round(flight.totalEmissionsGrams / 1000)}kg`;
    }
    const booking = flight.bookingUrl ? `\n    Booking: ${flight.bookingUrl}` : "";
    return `Flight ${index + 1}: ${price} | ${formatDuration(flight.duration)} | ${flight.stops} stop(s)${carbonTag}\n${legs}${booking}`;
};
const formatPriceContext = (ctx) => {
    const diff = ctx.priceDifference < 0
        ? `$${Math.abs(ctx.priceDifference)} below typical`
        : ctx.priceDifference > 0
            ? `$${ctx.priceDifference} above typical`
            : "at typical price";
    return `Price assessment: ${ctx.assessment.toUpperCase()} (${diff}). Range: $${ctx.lowPrice} - $${ctx.highPrice}, typical: $${ctx.typicalPrice}`;
};
const buildFilters = (params) => {
    const isRoundTrip = params.returnDate !== undefined;
    const outbound = {
        departureAirport: params.origin.toUpperCase(),
        arrivalAirport: params.destination.toUpperCase(),
        travelDate: params.departureDate,
        departureWindow: params.departureWindow,
    };
    const segments = isRoundTrip && params.returnDate
        ? [
            outbound,
            {
                departureAirport: params.destination.toUpperCase(),
                arrivalAirport: params.origin.toUpperCase(),
                travelDate: params.returnDate,
            },
        ]
        : [outbound];
    return {
        tripType: isRoundTrip ? TripType.ROUND_TRIP : TripType.ONE_WAY,
        passengers: {
            adults: params.adults ?? 1,
            children: params.children ?? 0,
            infantsOnLap: params.infants ?? 0,
            infantsInSeat: 0,
        },
        segments,
        stops: params.maxStops !== undefined ? STOPS_MAP[params.maxStops] : MaxStops.ANY,
        seatType: SEAT_MAP[params.cabinClass ?? "economy"],
        sortBy: SORT_MAP[params.sortBy ?? "best"],
        airlines: params.airlines,
    };
};
const sortFlights = (flights, sortBy) => {
    const copy = [...flights];
    switch (sortBy) {
        case "price":
            return copy.sort((a, b) => a.price - b.price);
        case "duration":
            return copy.sort((a, b) => a.duration - b.duration);
        case "emissions":
            return copy.sort((a, b) => {
                const emA = a.carbonFootprint?.totalEmissionsKg ?? a.totalEmissionsGrams ?? 999999;
                const emB = b.carbonFootprint?.totalEmissionsKg ?? b.totalEmissionsGrams ?? 999999;
                return emA - emB;
            });
        case "departure":
            return copy.sort((a, b) => (a.legs[0]?.departureTime ?? "").localeCompare(b.legs[0]?.departureTime ?? ""));
        case "arrival":
            return copy.sort((a, b) => (a.legs[a.legs.length - 1]?.arrivalTime ?? "").localeCompare(b.legs[b.legs.length - 1]?.arrivalTime ?? ""));
        default:
            return flights;
    }
};
const formatSearchResult = (result, params) => {
    const max = params.maxResults ?? 5;
    const priceCtx = result.metadata.priceContext
        ? `\n${formatPriceContext(result.metadata.priceContext)}\n`
        : "";
    if (result.tag === "combos") {
        const lines = result.combos.slice(0, max).map((combo, i) => {
            const parts = combo.map((flight, j) => {
                const label = j === 0 ? "Outbound" : "Return";
                return `  ${label}:\n${formatFlightResult(flight, 0)}`;
            });
            return `--- Option ${i + 1} ---\n${parts.join("\n")}`;
        });
        return `Round-trip flights: ${params.origin} <-> ${params.destination}\nDates: ${params.departureDate} to ${params.returnDate}${priceCtx}\n${lines.join("\n\n")}`;
    }
    const sortedFlights = sortFlights(result.flights, params.sortBy ?? "best");
    const lines = sortedFlights.slice(0, max).map(formatFlightResult);
    return `Flights from ${params.origin} to ${params.destination} on ${params.departureDate}:${priceCtx}\n${lines.join("\n\n")}`;
};
export const handleSearchFlights = async (params) => {
    const filters = buildFilters(params);
    const result = await searchFlights(filters, params.maxResults ?? 5);
    return result.tag === "ok"
        ? { tag: "ok", value: formatSearchResult(result.value, params) }
        : result;
};
//# sourceMappingURL=search-flights.js.map