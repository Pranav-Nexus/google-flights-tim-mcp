import type { GoogleTIMFlightInput, GoogleTIMComputeResponse, CabinClass, FlightCarbonFootprint } from "./types.js";
export declare const getGoogleApiKey: () => string | null;
export declare const queryGoogleTIMApi: (flights: readonly GoogleTIMFlightInput[]) => Promise<GoogleTIMComputeResponse | null>;
export declare const enrichFlightWithTIM: (legs: readonly {
    departureAirport: string;
    arrivalAirport: string;
    airline: string;
    flightNumber: string;
    departureTime: string;
    aircraft: string | null;
    emissionsGrams?: number | null;
}[], chosenCabin?: CabinClass) => Promise<FlightCarbonFootprint>;
//# sourceMappingURL=api.d.ts.map