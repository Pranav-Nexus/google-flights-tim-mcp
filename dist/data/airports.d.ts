export type Airport = {
    readonly code: string;
    readonly name: string;
    readonly city: string;
    readonly country: string;
    readonly lat?: number;
    readonly lon?: number;
};
declare const AIRPORTS: readonly Airport[];
export declare const getAirportByCode: (code: string) => Airport | undefined;
export declare const lookupAirport: (query: string) => readonly Airport[];
export declare const haversineKm: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
export declare const getFlightDistanceKm: (originCode: string, destinationCode: string) => number | null;
export declare const findNearbyAirports: (code: string, radiusKm?: number) => readonly {
    readonly airport: Airport;
    readonly distanceKm: number;
}[];
export { AIRPORTS };
//# sourceMappingURL=airports.d.ts.map