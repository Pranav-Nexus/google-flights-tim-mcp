import { ok, err, fromTryCatch, flatMap } from "../lib/result.js";
import { pipe } from "../lib/pipe.js";
import { formatDateTime } from "../lib/date.js";
import { logger } from "../lib/logger.js";
const KNOWN_CURRENCIES = new Set([
    "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "KRW",
    "SGD", "HKD", "NZD", "MXN", "BRL", "ZAR", "SEK", "NOK", "DKK", "PLN",
    "CZK", "THB", "MYR", "PHP", "IDR", "VND", "AED", "SAR", "QAR", "ILS",
    "TRY", "EGP", "KES", "NGN", "COP", "PEN", "CLP", "ARS", "TWD", "RUB",
]);
const findCurrencyInProtobuf = (buf) => {
    const limit = Math.max(0, buf.length - 4);
    return Array.from({ length: limit }).reduce((acc, _v, i) => {
        if (acc !== null)
            return acc;
        if (buf[i] === 0x1a && buf[i + 1] === 0x03) {
            const candidate = String.fromCharCode(buf[i + 2], buf[i + 3], buf[i + 4]);
            if (KNOWN_CURRENCIES.has(candidate))
                return candidate;
        }
        return null;
    }, null);
};
const findCurrencyByRegex = (decoded) => (decoded.match(/[A-Z]{3}/g) ?? []).find((m) => KNOWN_CURRENCIES.has(m)) ?? null;
const extractCurrencyFromToken = (token) => {
    const buf = Buffer.from(token, "base64");
    return findCurrencyInProtobuf(buf) ?? findCurrencyByRegex(buf.toString("latin1"));
};
const extractCurrency = (priceBlock) => priceBlock.length > 1 && typeof priceBlock[1] === "string"
    ? extractCurrencyFromToken(priceBlock[1])
    : null;
const safeArray = (v) => Array.isArray(v) ? v : [];
const safeNumber = (v, fallback = 0) => typeof v === "number" ? v : fallback;
const safeString = (v, fallback = "") => typeof v === "string" ? v : fallback;
const safeNumberArray = (v) => Array.isArray(v) ? v.map((x) => safeNumber(x)) : [];
const safeNumberOrNull = (v) => typeof v === "number" ? v : null;
const ENTRY = {
    FLIGHT_DATA: 0,
    PRICE_BLOCK: 1,
};
const FLIGHT = {
    LEGS: 2,
    TOTAL_DURATION: 9,
};
const LEG = {
    MIN_LENGTH: 23,
    DEPARTURE_AIRPORT: 3,
    ARRIVAL_AIRPORT: 6,
    DEPARTURE_TIME: 8,
    ARRIVAL_TIME: 10,
    DURATION: 11,
    SEAT_PITCH_LEGACY: 14,
    AIRCRAFT: 17,
    DEPARTURE_DATE: 20,
    ARRIVAL_DATE: 21,
    AIRLINE_INFO: 22,
    SEAT_PITCH: 30,
    EMISSIONS_GRAMS: 31,
};
const AIRLINE = {
    CODE: 0,
    FLIGHT_NUMBER: 1,
    NAME: 3,
};
const validateFlightEntry = (data) => {
    const flightData = data[ENTRY.FLIGHT_DATA];
    if (!Array.isArray(flightData)) {
        return err("Malformed flight entry: [0] is not an array");
    }
    const legs = flightData[FLIGHT.LEGS];
    if (!Array.isArray(legs) || legs.length === 0) {
        return err("Malformed flight entry: legs data is not an array");
    }
    return ok(data);
};
const validateLegEntry = (legData) => {
    if (legData.length < LEG.MIN_LENGTH)
        return false;
    if (typeof legData[LEG.DEPARTURE_AIRPORT] !== "string" || typeof legData[LEG.ARRIVAL_AIRPORT] !== "string") {
        return false;
    }
    return true;
};
const parseLeg = (legData) => {
    const airlineData = safeArray(legData[LEG.AIRLINE_INFO]);
    const aircraftRaw = legData[LEG.AIRCRAFT];
    const seatPitchRaw = legData[LEG.SEAT_PITCH];
    const seatPitchLegacyRaw = legData[LEG.SEAT_PITCH_LEGACY];
    return {
        airline: safeString(airlineData[AIRLINE.CODE], "Unknown"),
        airlineName: safeString(airlineData[AIRLINE.NAME], safeString(airlineData[AIRLINE.CODE], "Unknown")),
        flightNumber: safeString(airlineData[AIRLINE.FLIGHT_NUMBER]),
        departureAirport: safeString(legData[LEG.DEPARTURE_AIRPORT]),
        arrivalAirport: safeString(legData[LEG.ARRIVAL_AIRPORT]),
        departureTime: formatDateTime(safeNumberArray(legData[LEG.DEPARTURE_DATE]), safeNumberArray(legData[LEG.DEPARTURE_TIME])),
        arrivalTime: formatDateTime(safeNumberArray(legData[LEG.ARRIVAL_DATE]), safeNumberArray(legData[LEG.ARRIVAL_TIME])),
        duration: safeNumber(legData[LEG.DURATION]),
        aircraft: typeof aircraftRaw === "string" ? aircraftRaw : null,
        seatPitch: typeof seatPitchRaw === "string"
            ? seatPitchRaw
            : typeof seatPitchLegacyRaw === "string"
                ? seatPitchLegacyRaw
                : null,
        emissionsGrams: safeNumberOrNull(legData[LEG.EMISSIONS_GRAMS]),
    };
};
const parseFlight = (data) => {
    const validation = validateFlightEntry(data);
    if (validation.tag === "err")
        return validation;
    const flightData = safeArray(data[ENTRY.FLIGHT_DATA]);
    const rawLegs = safeArray(flightData[FLIGHT.LEGS]);
    const validLegs = rawLegs.filter((leg) => validateLegEntry(safeArray(leg)));
    if (validLegs.length === 0) {
        return err("No valid legs found in flight entry");
    }
    const totalDuration = safeNumber(flightData[FLIGHT.TOTAL_DURATION]);
    const priceBlockRaw = data[ENTRY.PRICE_BLOCK];
    const priceBlock = Array.isArray(priceBlockRaw) ? priceBlockRaw : null;
    const priceArr = priceBlock && Array.isArray(priceBlock[0]) ? priceBlock[0] : null;
    const legs = validLegs.map((leg) => parseLeg(safeArray(leg)));
    const totalEmissions = legs.every((l) => l.emissionsGrams !== null)
        ? legs.reduce((sum, l) => sum + (l.emissionsGrams ?? 0), 0)
        : null;
    return ok({
        price: priceArr ? safeNumber(priceArr[1]) : 0,
        currency: priceBlock ? extractCurrency(priceBlock) : null,
        duration: totalDuration,
        stops: Math.max(0, legs.length - 1),
        legs,
        totalEmissionsGrams: totalEmissions,
    });
};
const parsePriceContext = (inner) => {
    const priceData = safeArray(inner[5]);
    if (priceData.length < 6)
        return null;
    const current = safeNumber(safeArray(priceData[1])[1], 0);
    const typical = safeNumber(safeArray(priceData[2])[1], 0);
    const low = safeNumber(safeArray(priceData[4])[1], 0);
    const high = safeNumber(safeArray(priceData[5])[1], 0);
    if (current === 0 || typical === 0)
        return null;
    const assessment = current <= low ? "low" : current >= high ? "high" : "typical";
    return {
        currentPrice: current,
        typicalPrice: typical,
        priceDifference: current - typical,
        lowPrice: low,
        highPrice: high,
        assessment,
    };
};
const parseDailyPrices = (inner) => {
    const priceData = safeArray(inner[5]);
    const dailyArr = safeArray(safeArray(priceData[10])[0]);
    return dailyArr.flatMap((entry) => {
        const pair = safeArray(entry);
        const ts = safeNumber(pair[0], 0);
        const price = safeNumber(pair[1], 0);
        if (ts === 0 || price === 0)
            return [];
        const date = new Date(ts).toISOString().split("T")[0];
        return [{ date, price }];
    });
};
const parseAvailableAirlines = (inner) => {
    const airlineData = safeArray(inner[7]);
    const carriers = safeArray(safeArray(airlineData[1]));
    return carriers.flatMap((entry) => {
        const pair = safeArray(entry);
        const code = safeString(pair[0]);
        const name = safeString(pair[1]);
        return code && name ? [{ code, name }] : [];
    });
};
const parseMetadata = (inner) => ({
    priceContext: parsePriceContext(inner),
    dailyPrices: parseDailyPrices(inner),
    availableAirlines: parseAvailableAirlines(inner),
});
const stripXssiPrefix = (raw) => raw.replace(/^\)\]\}'/, "");
const validateOuterResponse = (parsed) => {
    if (!Array.isArray(parsed)) {
        return err("Response format changed: expected outer array, got " + typeof parsed);
    }
    if (parsed.length === 0) {
        return err("Response format changed: outer array is empty");
    }
    return ok(parsed);
};
const findFlightEntry = (outer) => safeArray(outer).find((entry) => {
    if (!Array.isArray(entry) || typeof entry[2] !== "string")
        return false;
    const parsed = fromTryCatch(() => JSON.parse(entry[2]));
    if (parsed.tag === "err")
        return false;
    const inner = parsed.value;
    return Array.isArray(inner) && (Array.isArray(inner[2]) || Array.isArray(inner[3]));
});
const parseFlightEntry = (entry) => {
    const inner = JSON.parse(entry[2]);
    const raw = [2, 3].flatMap((idx) => {
        const bucket = inner[idx];
        return Array.isArray(bucket) && Array.isArray(bucket[0]) ? bucket[0] : [];
    });
    if (raw.length === 0) {
        logger.warn("parse_empty_flights", { innerLength: inner.length });
        return err("No flights in response data");
    }
    const results = raw.map((d) => parseFlight(safeArray(d)));
    const flights = results.flatMap((r) => (r.tag === "ok" ? [r.value] : []));
    if (flights.length === 0) {
        return err(`All ${results.length} flight entries failed validation`);
    }
    return ok({ flights, metadata: parseMetadata(inner) });
};
const findAndParseFlightData = (outer) => {
    const isStatus13 = safeArray(outer).some((entry) => Array.isArray(entry) && Array.isArray(entry[5]) && entry[5][0] === 13);
    if (isStatus13) {
        return err("Google Flights RPC Status 13 (unauthenticated query throttled by Google WAF/bot defenses). Try again in a few moments, or use get_flight_url to view live fares directly.");
    }
    const entry = findFlightEntry(outer);
    if (!entry) {
        return err("No flight data found in response");
    }
    return parseFlightEntry(entry);
};
export const parseFlightsResponse = (rawText) => pipe(fromTryCatch(() => JSON.parse(stripXssiPrefix(rawText)), (e) => `Failed to parse Google Flights response as JSON: ${e instanceof Error ? e.message : String(e)}`), flatMap(validateOuterResponse), flatMap(findAndParseFlightData));
//# sourceMappingURL=response-parser.js.map