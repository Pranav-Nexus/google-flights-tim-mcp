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
    readonly deltaPercentage: number;
    readonly ecoRating: "A+" | "A" | "B" | "C" | "D";
    readonly dataSource: "google_tim_api" | "tim_science_engine" | "google_flights_payload";
};
export type FlightCarbonFootprint = {
    readonly totalEmissionsKg: number;
    readonly typicalEmissionsKg: number;
    readonly savingsPercentage: number;
    readonly badge: string;
    readonly cabinBreakdownKg: {
        readonly economy: number;
        readonly premiumEconomy: number;
        readonly business: number;
        readonly first: number;
    };
    readonly legs: readonly LegEmissions[];
};
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
//# sourceMappingURL=types.d.ts.map