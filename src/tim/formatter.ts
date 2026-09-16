// Formatting utilities for Travel Impact Model carbon footprint reports.

import type { FlightCarbonFootprint, LegEmissions } from "./types.js";

export const formatFlightEmissionsTag = (
  footprint: FlightCarbonFootprint
): string => {
  return `CO2: ${footprint.totalEmissionsKg}kg (${footprint.badge})`;
};

export const formatLegEmissions = (leg: LegEmissions): string => {
  const eco =
    leg.deltaPercentage <= -15
      ? "🌱 Low emissions"
      : leg.deltaPercentage > 15
      ? "⚠️ High emissions"
      : "Typical";
  return `CO2: ${Math.round(leg.chosenCabinEmissionsGrams / 1000)}kg [${leg.chosenCabinClass}, ${eco}]`;
};

export const formatCarbonFootprintReport = (
  flightTitle: string,
  footprint: FlightCarbonFootprint
): string => {
  const legsText = footprint.legs
    .map(
      (l, i) =>
        `  Leg ${i + 1} (${l.departureAirport} -> ${l.arrivalAirport}, ${l.distanceKm}km): ` +
        `${Math.round(l.chosenCabinEmissionsGrams / 1000)} kg CO2e ` +
        `[${l.aircraftType ?? "Standard Fleet"} | Rating: ${l.ecoRating} | ${l.dataSource}]`
    )
    .join("\n");

  return `=== Travel Impact Model (TIM) Carbon Footprint ===
Route: ${flightTitle}
Overall Status: ${footprint.badge}
Estimated Passenger Emissions: ${footprint.totalEmissionsKg} kg CO2e
Typical Route Baseline: ${footprint.typicalEmissionsKg} kg CO2e
Efficiency Delta: ${footprint.savingsPercentage >= 0 ? "-" : "+"}${Math.abs(footprint.savingsPercentage)}% vs typical

Cabin Class Impact (Per Passenger):
  • Economy:          ${footprint.cabinBreakdownKg.economy} kg CO2e (1.0x baseline)
  • Premium Economy:  ${footprint.cabinBreakdownKg.premiumEconomy} kg CO2e (1.5x floor area)
  • Business Class:   ${footprint.cabinBreakdownKg.business} kg CO2e (3.0x floor area)
  • First Class:      ${footprint.cabinBreakdownKg.first} kg CO2e (4.0x floor area)

Leg Breakdown:
${legsText}

Methodology: Google Travel Impact Model (TIM) & ICCT Aviation Emissions Standards.`;
};
