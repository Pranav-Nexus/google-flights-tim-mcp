// Travel Impact Model (TIM) type definitions and data contracts.
// Follows Google, Travalyst, and ICCT (International Council on Clean Transportation) standards.

export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export type CabinEmissionsGrams = {
  readonly economy: number;
  readonly premiumEconomy: number;
  readonly business: number;
  readonly first: number;
};

export type LegEmissions = {
  readonly departureAirport: string;
  readonly arrivalAirport: string;
  readonly distanceKm: number;
  readonly aircraftType: string | null;
  readonly emissionsGramsPerPax: CabinEmissionsGrams;
  readonly chosenCabinEmissionsGrams: number;
  readonly chosenCabinClass: CabinClass;
  readonly typicalRouteEmissionsGrams: number;
  readonly deltaPercentage: number; // e.g. -18 means 18% lower than typical
  readonly ecoRating: "A+" | "A" | "B" | "C" | "D";
  readonly dataSource: "google_tim_api" | "tim_science_engine" | "google_flights_payload";
};

export type FlightCarbonFootprint = {
  readonly totalEmissionsKg: number;
  readonly typicalEmissionsKg: number;
  readonly savingsPercentage: number; // positive = cleaner/lower emissions
  readonly badge: string; // e.g. "🌱 -18% vs typical (Eco-Choice)"
  readonly cabinBreakdownKg: {
    readonly economy: number;
    readonly premiumEconomy: number;
    readonly business: number;
    readonly first: number;
  };
  readonly legs: readonly LegEmissions[];
};

// Google Travel Impact Model API payload contracts
export type GoogleTIMFlightInput = {
  readonly origin: string;
  readonly destination: string;
  readonly operatingCarrierCode?: string;
  readonly flightNumber?: string | number;
  readonly departureDate: {
    readonly year: number;
    readonly month: number;
    readonly day: number;
  };
};

export type GoogleTIMComputeResponse = {
  readonly flightEmissions?: readonly {
    readonly flight?: {
      readonly origin?: string;
      readonly destination?: string;
      readonly operatingCarrierCode?: string;
      readonly flightNumber?: number;
      readonly departureDate?: {
        readonly year?: number;
        readonly month?: number;
        readonly day?: number;
      };
    };
    readonly emissionsGramsPerPax?: {
      readonly first?: number;
      readonly business?: number;
      readonly premiumEconomy?: number;
      readonly economy?: number;
    };
  }[];
  readonly modelVersion?: {
    readonly major?: number;
    readonly minor?: number;
    readonly patch?: number;
  };
};
