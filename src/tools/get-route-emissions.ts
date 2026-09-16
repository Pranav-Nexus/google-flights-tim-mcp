import { z } from "zod";
import {
  computeRouteDistanceKm,
  computeEffectiveDistanceKm,
  computeLegEmissions,
} from "../tim/engine.js";
import { getAirportByCode } from "../data/airports.js";
import { ok, type Result } from "../lib/result.js";

export const getRouteEmissionsSchema = z.object({
  origin: z
    .string()
    .length(3)
    .describe("Departure airport IATA code (e.g., 'BOM', 'JFK')"),
  destination: z
    .string()
    .length(3)
    .describe("Arrival airport IATA code (e.g., 'MAA', 'LHR')"),
});

export const handleGetRouteEmissions = async (
  params: z.infer<typeof getRouteEmissionsSchema>
): Promise<Result<string>> => {
  const originCode = params.origin.toUpperCase();
  const destCode = params.destination.toUpperCase();

  const originApt = getAirportByCode(originCode);
  const destApt = getAirportByCode(destCode);

  const directKm = computeRouteDistanceKm(originCode, destCode);
  const directMiles = Math.round(directKm * 0.621371);
  const effectiveKm = computeEffectiveDistanceKm(directKm);

  // Baseline typical emissions
  const typicalEconomy = computeLegEmissions(originCode, destCode, null, "economy");
  const nextGenEco = computeLegEmissions(originCode, destCode, "Airbus A320neo", "economy");
  const heavyLegacy = computeLegEmissions(originCode, destCode, "Boeing 777-300ER", "economy");

  const ecoSavingsKg = Math.round(
    (typicalEconomy.typicalRouteEmissionsGrams - nextGenEco.chosenCabinEmissionsGrams) / 1000
  );
  const ecoSavingsPct = Math.round(
    ((typicalEconomy.typicalRouteEmissionsGrams - nextGenEco.chosenCabinEmissionsGrams) /
      typicalEconomy.typicalRouteEmissionsGrams) *
      100
  );

  const originName = originApt ? `${originApt.name} (${originApt.city}, ${originApt.country})` : originCode;
  const destName = destApt ? `${destApt.name} (${destApt.city}, ${destApt.country})` : destCode;

  const lines = [
    `=== Travel Impact Model (TIM) Route Baseline ===`,
    `Route: ${originCode} (${originName}) <-> ${destCode} (${destName})`,
    `Great-Circle Distance: ${directKm} km (${directMiles} miles)`,
    `ICAO Operational Trajectory Distance: ${effectiveKm} km (incl. terminal climb/approach procedures)`,
    ``,
    `Typical Market Baseline Emissions (Per Passenger):`,
    `  • Economy Class:          ${Math.round(typicalEconomy.typicalRouteEmissionsGrams / 1000)} kg CO2e`,
    `  • Premium Economy Class:  ${Math.round(typicalEconomy.emissionsGramsPerPax.premiumEconomy / 1000)} kg CO2e`,
    `  • Business Class:         ${Math.round(typicalEconomy.emissionsGramsPerPax.business / 1000)} kg CO2e`,
    `  • First Class:            ${Math.round(typicalEconomy.emissionsGramsPerPax.first / 1000)} kg CO2e`,
    ``,
    `Fleet Impact Benchmark on this Route:`,
    `  • Next-Gen Fleet (e.g. A320neo / 737 MAX / A350): ${Math.round(nextGenEco.chosenCabinEmissionsGrams / 1000)} kg CO2e (${ecoSavingsPct > 0 ? "-" : "+"}${ecoSavingsPct}% vs typical, saves ~${ecoSavingsKg}kg CO2e)`,
    `  • Legacy / Heavy Fleet (e.g. 777-300ER / older jets): ${Math.round(heavyLegacy.chosenCabinEmissionsGrams / 1000)} kg CO2e (+${heavyLegacy.deltaPercentage}% higher emissions)`,
    ``,
    `Recommendation: Flying on airlines operating Airbus A320neo/A321neo or Boeing 737 MAX on this corridor reduces personal carbon footprint by up to ${ecoSavingsPct}%.`,
    `Data Standard: Google Travel Impact Model & ICCT Aviation Global Matrix.`,
  ];

  return ok(lines.join("\n"));
};
