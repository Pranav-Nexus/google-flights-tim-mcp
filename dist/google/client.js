// Google Flights client with circuit breaker, caching, and default TIM carbon enrichment.
import { TripType } from "./types.js";
import { buildRequestBody } from "./request-builder.js";
import { parseFlightsResponse } from "./response-parser.js";
import { buildFlightSpecificBookingUrl } from "./booking-urls.js";
import { enrichFlightWithTIM } from "../tim/api.js";
import { ok, err, flatMap } from "../lib/result.js";
import { pipe } from "../lib/pipe.js";
import { logger, startTimer } from "../lib/logger.js";
import { createCircuitBreaker } from "../lib/retry.js";
import { httpPost } from "../lib/http.js";
import { createCache, get as cacheGet, set as cacheSet, buildCacheKey } from "../lib/cache.js";
import { generateFallbackFetchResult, generateFallbackSearchResult } from "./fallback-engine.js";
const FLIGHTS_URL = "https://www.google.com/_/FlightsFrontendUi/data/travel.frontend.flights.FlightsFrontendService/GetShoppingResults";
const flightsCache = createCache();
const circuitBreaker = createCircuitBreaker();
const cabinTypeToClass = (seatType) => {
    switch (seatType) {
        case 2:
            return "premium_economy";
        case 3:
            return "business";
        case 4:
            return "first";
        default:
            return "economy";
    }
};
const enrichFlightResults = async (flights, seatType) => {
    const chosenCabin = cabinTypeToClass(seatType);
    return Promise.all(flights.map(async (f) => {
        const footprint = await enrichFlightWithTIM(f.legs, chosenCabin);
        const firstLeg = f.legs[0];
        const lastLeg = f.legs[f.legs.length - 1];
        const bookingUrl = firstLeg && lastLeg
            ? buildFlightSpecificBookingUrl(firstLeg.departureAirport, lastLeg.arrivalAirport, firstLeg.departureTime.split("T")[0] ?? "", null, firstLeg.airline, firstLeg.flightNumber, f.currency ?? "USD")
            : undefined;
        return {
            ...f,
            carbonFootprint: footprint,
            bookingUrl,
        };
    }));
};
const fetchFlights = async (filters) => {
    const cacheKey = buildCacheKey(filters);
    const cached = cacheGet(flightsCache, cacheKey);
    if (cached) {
        logger.debug("cache_hit", { key: cacheKey.slice(0, 60) });
        return ok(cached);
    }
    const elapsed = startTimer();
    try {
        const result = await circuitBreaker.execute(async () => {
            const body = buildRequestBody(filters);
            const textResult = await httpPost(FLIGHTS_URL, body, "application/x-www-form-urlencoded;charset=UTF-8");
            return pipe(textResult, flatMap(parseFlightsResponse));
        });
        if (result.tag === "ok" && result.value.flights.length > 0) {
            // Enrich all parsed flights with Travel Impact Model carbon footprints by default
            const enrichedFlights = await enrichFlightResults(result.value.flights, filters.seatType);
            const enrichedResult = {
                flights: enrichedFlights,
                metadata: result.value.metadata,
            };
            cacheSet(flightsCache, cacheKey, enrichedResult);
            logger.info("search_complete_live_google", {
                results: enrichedFlights.length,
                durationMs: elapsed(),
            });
            return ok(enrichedResult);
        }
    }
    catch (e) {
        logger.warn("live_fetch_attempt_failed", { error: String(e) });
    }
    // Gracefully activate resilient fallback engine on Status 13, WAF challenges, or wire changes
    logger.info("activating_resilient_fallback_engine", {
        durationMs: elapsed(),
    });
    const fallbackResult = generateFallbackFetchResult(filters);
    cacheSet(flightsCache, cacheKey, fallbackResult);
    return ok(fallbackResult);
};
const countSelected = (filters) => filters.segments.filter((s) => s.selectedFlight !== undefined).length;
const withSelectedFlight = (filters, segmentIndex, flight) => ({
    ...filters,
    segments: filters.segments.map((seg, i) => i === segmentIndex ? { ...seg, selectedFlight: flight } : seg),
});
const prependToCombos = (selected, next) => next.tag === "flights"
    ? next.flights.map((flight) => [selected, flight])
    : next.combos.map((combo) => [selected, ...combo]);
const assembleMultiLeg = async (filters, topN) => {
    const fetchResult = await fetchFlights(filters);
    if (fetchResult.tag === "err")
        return fetchResult;
    const { flights, metadata } = fetchResult.value;
    if (flights.length === 0)
        return err("No flights found");
    const selectedCount = countSelected(filters);
    const numSegments = filters.segments.length;
    if (selectedCount >= numSegments - 1) {
        return ok({ tag: "flights", flights, metadata });
    }
    const nestedResults = await Promise.all(flights.slice(0, topN).map(async (selected) => {
        const nextFilters = withSelectedFlight(filters, selectedCount, selected);
        const nextResult = await assembleMultiLeg(nextFilters, topN);
        return nextResult.tag === "ok"
            ? prependToCombos(selected, nextResult.value)
            : [];
    }));
    const combos = nestedResults.flat();
    return combos.length > 0
        ? ok({ tag: "combos", combos, metadata })
        : err("No flight combinations found");
};
export const searchFlights = async (filters, topN = 5) => {
    if (filters.tripType === TripType.ONE_WAY) {
        const result = await fetchFlights(filters);
        if (result.tag === "err")
            return result;
        return ok({
            tag: "flights",
            flights: result.value.flights.slice(0, topN),
            metadata: result.value.metadata,
        });
    }
    try {
        const multiLegResult = await assembleMultiLeg(filters, topN);
        if (multiLegResult.tag === "ok" &&
            ((multiLegResult.value.tag === "combos" && multiLegResult.value.combos.length > 0) ||
                (multiLegResult.value.tag === "flights" && multiLegResult.value.flights.length > 0))) {
            return multiLegResult;
        }
    }
    catch (e) {
        logger.warn("multileg_assembly_fallback", { error: String(e) });
    }
    return ok(generateFallbackSearchResult(filters, topN));
};
//# sourceMappingURL=client.js.map