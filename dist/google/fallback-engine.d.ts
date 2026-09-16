import type { FlightSearchFilters, FlightResult, SearchResult, FetchResult } from "./types.js";
export declare const generateSingleLegFlights: (originCode: string, destCode: string, travelDate: string, filters: FlightSearchFilters, returnDateForBooking?: string | null) => readonly FlightResult[];
export declare const generateFallbackFetchResult: (filters: FlightSearchFilters) => FetchResult;
export declare const generateFallbackSearchResult: (filters: FlightSearchFilters, topN?: number) => SearchResult;
//# sourceMappingURL=fallback-engine.d.ts.map