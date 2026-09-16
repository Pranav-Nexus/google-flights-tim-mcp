// Client for official Google Travel Impact Model API.
// Endpoint: https://travelimpactmodel.googleapis.com/v1/flights:computeFlightEmissions

import { httpPost } from "../lib/http.js";
import { logger } from "../lib/logger.js";
import type {
  GoogleTIMFlightInput,
  GoogleTIMComputeResponse,
  CabinClass,
  FlightCarbonFootprint,
} from "./types.js";
import { computeFlightCarbonFootprint } from "./engine.js";

const TIM_API_URL =
  "https://travelimpactmodel.googleapis.com/v1/flights:computeFlightEmissions";

export const getGoogleApiKey = (): string | null =>
  process.env.TIM_API_KEY ?? process.env.GOOGLE_API_KEY ?? null;

export const queryGoogleTIMApi = async (
  flights: readonly GoogleTIMFlightInput[]
): Promise<GoogleTIMComputeResponse | null> => {
  const apiKey = getGoogleApiKey();
  if (!apiKey) return null;

  try {
    const url = `${TIM_API_URL}?key=${apiKey}`;
    const body = JSON.stringify({ flights });
    const res = await httpPost(url, body, "application/json");

    if (res.tag === "err") {
      logger.warn("tim_api_failed", { error: res.error });
      return null;
    }

    return JSON.parse(res.value) as GoogleTIMComputeResponse;
  } catch (e) {
    logger.warn("tim_api_exception", { error: String(e) });
    return null;
  }
};

export const enrichFlightWithTIM = async (
  legs: readonly {
    departureAirport: string;
    arrivalAirport: string;
    airline: string;
    flightNumber: string;
    departureTime: string;
    aircraft: string | null;
    emissionsGrams?: number | null;
  }[],
  chosenCabin: CabinClass = "economy"
): Promise<FlightCarbonFootprint> => {
  const apiKey = getGoogleApiKey();

  if (apiKey) {
    // Attempt live Google TIM API call
    const timInputs: GoogleTIMFlightInput[] = legs.map((l) => {
      const depDate = l.departureTime.split("T")[0] ?? "2026-09-16";
      const [year = 2026, month = 9, day = 16] = depDate
        .split("-")
        .map((x) => parseInt(x, 10));
      const cleanFlightNum = l.flightNumber.replace(/\D/g, "");

      return {
        origin: l.departureAirport.toUpperCase(),
        destination: l.arrivalAirport.toUpperCase(),
        operatingCarrierCode: l.airline.toUpperCase(),
        flightNumber: cleanFlightNum ? parseInt(cleanFlightNum, 10) : undefined,
        departureDate: { year, month, day },
      };
    });

    const timRes = await queryGoogleTIMApi(timInputs);
    if (timRes && timRes.flightEmissions && timRes.flightEmissions.length > 0) {
      // Map back Google TIM results to legs
      const enrichedLegs = legs.map((leg, i) => {
        const timLeg = timRes.flightEmissions?.[i];
        const apiEmissions = timLeg?.emissionsGramsPerPax?.economy;
        return {
          ...leg,
          emissionsGrams: apiEmissions ?? leg.emissionsGrams ?? null,
        };
      });
      return computeFlightCarbonFootprint(enrichedLegs, chosenCabin);
    }
  }

  // Fallback to high-precision embedded TIM scientific engine
  return computeFlightCarbonFootprint(legs, chosenCabin);
};
