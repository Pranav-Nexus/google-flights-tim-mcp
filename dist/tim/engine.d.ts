import type { CabinClass, LegEmissions, FlightCarbonFootprint } from "./types.js";
export declare const computeRouteDistanceKm: (origin: string, destination: string) => number;
export declare const computeEffectiveDistanceKm: (directKm: number) => number;
export declare const computeLegEmissions: (origin: string, destination: string, aircraft: string | null, chosenCabin?: CabinClass, googleProvidedEmissionsGrams?: number | null) => LegEmissions;
export declare const computeFlightCarbonFootprint: (legs: readonly {
    departureAirport: string;
    arrivalAirport: string;
    aircraft: string | null;
    emissionsGrams?: number | null;
}[], chosenCabin?: CabinClass) => FlightCarbonFootprint;
//# sourceMappingURL=engine.d.ts.map