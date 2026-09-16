// Embedded Travel Impact Model (TIM) calculation engine.
// Implements science-based methodology developed by Google, Travalyst, and ICCT.

import { getFlightDistanceKm } from "../data/airports.js";
import {
  JET_A_CO2_PER_GRAM_FUEL,
  DEFAULT_AIRCRAFT_FUEL_BURN,
  resolveAircraftProfile,
} from "./aircraft-data.js";
import type {
  CabinClass,
  CabinEmissionsGrams,
  LegEmissions,
  FlightCarbonFootprint,
} from "./types.js";

// Cabin weighting factors reflecting floor area allocation per passenger
const CABIN_MULTIPLIERS: Readonly<Record<CabinClass, number>> = {
  economy: 1.0,
  premium_economy: 1.5,
  business: 3.0,
  first: 4.0,
};

// Route typical baseline fuel consumption (weighted global average fleet mix)
const TYPICAL_FLEET_FUEL_BURN = 32.0; // g fuel / pax-km

export const computeRouteDistanceKm = (
  origin: string,
  destination: string
): number => {
  const direct = getFlightDistanceKm(origin, destination);
  if (direct !== null) return direct;
  // Fallback distance for unindexed pairs: 1,500km medium-haul
  return 1500;
};

// ICAO standard routing factor (terminal routing, climb/descent holding)
export const computeEffectiveDistanceKm = (directKm: number): number => {
  if (directKm < 550) return directKm + 50;
  return directKm + 100;
};

export const computeLegEmissions = (
  origin: string,
  destination: string,
  aircraft: string | null,
  chosenCabin: CabinClass = "economy",
  googleProvidedEmissionsGrams?: number | null
): LegEmissions => {
  const directDistance = computeRouteDistanceKm(origin, destination);
  const effectiveDistance = computeEffectiveDistanceKm(directDistance);

  // Determine aircraft efficiency
  const profile = resolveAircraftProfile(aircraft);
  const fuelBurnPerKm = profile ? profile.fuelGramsPerPaxKm : DEFAULT_AIRCRAFT_FUEL_BURN;

  let economyGrams: number;
  let dataSource: LegEmissions["dataSource"] = "tim_science_engine";

  if (googleProvidedEmissionsGrams && googleProvidedEmissionsGrams > 0) {
    // If Google Flights already returned server-side TIM grams, use it directly
    economyGrams = googleProvidedEmissionsGrams;
    dataSource = "google_flights_payload";
  } else {
    // Calculate via TIM scientific model
    const fuelGrams = effectiveDistance * fuelBurnPerKm;
    economyGrams = Math.round(fuelGrams * JET_A_CO2_PER_GRAM_FUEL);
  }

  const emissionsGramsPerPax: CabinEmissionsGrams = {
    economy: economyGrams,
    premiumEconomy: Math.round(economyGrams * CABIN_MULTIPLIERS.premium_economy),
    business: Math.round(economyGrams * CABIN_MULTIPLIERS.business),
    first: Math.round(economyGrams * CABIN_MULTIPLIERS.first),
  };

  const getCabinEmissions = (emissions: CabinEmissionsGrams, cabin: CabinClass): number => {
    switch (cabin) {
      case "premium_economy":
        return emissions.premiumEconomy;
      case "business":
        return emissions.business;
      case "first":
        return emissions.first;
      default:
        return emissions.economy;
    }
  };

  const chosenEmissions = getCabinEmissions(emissionsGramsPerPax, chosenCabin);

  // Compute typical market baseline for this route
  const typicalFuelGrams = effectiveDistance * TYPICAL_FLEET_FUEL_BURN;
  const typicalEconomyGrams = Math.round(typicalFuelGrams * JET_A_CO2_PER_GRAM_FUEL);
  const typicalRouteGrams = Math.round(
    typicalEconomyGrams * CABIN_MULTIPLIERS[chosenCabin]
  );

  // Delta percentage: negative is better (e.g. -18% means cleaner)
  const delta = Math.round(
    ((chosenEmissions - typicalRouteGrams) / typicalRouteGrams) * 100
  );

  let ecoRating: LegEmissions["ecoRating"] = "B";
  if (delta <= -15) ecoRating = "A+";
  else if (delta <= -5) ecoRating = "A";
  else if (delta <= 10) ecoRating = "B";
  else if (delta <= 25) ecoRating = "C";
  else ecoRating = "D";

  return {
    departureAirport: origin.toUpperCase(),
    arrivalAirport: destination.toUpperCase(),
    distanceKm: directDistance,
    aircraftType: aircraft,
    emissionsGramsPerPax,
    chosenCabinEmissionsGrams: chosenEmissions,
    chosenCabinClass: chosenCabin,
    typicalRouteEmissionsGrams: typicalRouteGrams,
    deltaPercentage: delta,
    ecoRating,
    dataSource,
  };
};

export const computeFlightCarbonFootprint = (
  legs: readonly {
    departureAirport: string;
    arrivalAirport: string;
    aircraft: string | null;
    emissionsGrams?: number | null;
  }[],
  chosenCabin: CabinClass = "economy"
): FlightCarbonFootprint => {
  const legEmissions = legs.map((leg) =>
    computeLegEmissions(
      leg.departureAirport,
      leg.arrivalAirport,
      leg.aircraft,
      chosenCabin,
      leg.emissionsGrams
    )
  );

  const totalGrams = legEmissions.reduce(
    (sum, l) => sum + l.chosenCabinEmissionsGrams,
    0
  );
  const typicalGrams = legEmissions.reduce(
    (sum, l) => sum + l.typicalRouteEmissionsGrams,
    0
  );

  const totalKg = Math.round(totalGrams / 1000);
  const typicalKg = Math.round(typicalGrams / 1000);

  // Savings % vs typical
  const diff = typicalKg - totalKg;
  const savingsPct = typicalKg > 0 ? Math.round((diff / typicalKg) * 100) : 0;

  let badge: string;
  if (savingsPct >= 15) {
    badge = `🌱 -${savingsPct}% vs route avg (Eco-Choice)`;
  } else if (savingsPct > 0) {
    badge = `🌿 -${savingsPct}% vs route avg`;
  } else if (savingsPct === 0) {
    badge = `⚖️ Typical emissions for this route`;
  } else {
    badge = `⚠️ +${Math.abs(savingsPct)}% higher emissions than route avg`;
  }

  const cabinBreakdownKg = {
    economy: Math.round(
      legEmissions.reduce((s, l) => s + l.emissionsGramsPerPax.economy, 0) / 1000
    ),
    premiumEconomy: Math.round(
      legEmissions.reduce(
        (s, l) => s + l.emissionsGramsPerPax.premiumEconomy,
        0
      ) / 1000
    ),
    business: Math.round(
      legEmissions.reduce((s, l) => s + l.emissionsGramsPerPax.business, 0) / 1000
    ),
    first: Math.round(
      legEmissions.reduce((s, l) => s + l.emissionsGramsPerPax.first, 0) / 1000
    ),
  };

  return {
    totalEmissionsKg: totalKg,
    typicalEmissionsKg: typicalKg,
    savingsPercentage: savingsPct,
    badge,
    cabinBreakdownKg,
    legs: legEmissions,
  };
};
