import type { FlightCarbonFootprint } from "../tim/types.js";
export declare const TripType: {
    readonly ROUND_TRIP: 1;
    readonly ONE_WAY: 2;
    readonly MULTI_CITY: 3;
};
export type TripType = (typeof TripType)[keyof typeof TripType];
export declare const SeatType: {
    readonly ECONOMY: 1;
    readonly PREMIUM_ECONOMY: 2;
    readonly BUSINESS: 3;
    readonly FIRST: 4;
};
export type SeatType = (typeof SeatType)[keyof typeof SeatType];
export declare const SortBy: {
    readonly TOP_FLIGHTS: 0;
    readonly BEST: 1;
    readonly CHEAPEST: 2;
    readonly DEPARTURE_TIME: 3;
    readonly ARRIVAL_TIME: 4;
    readonly DURATION: 5;
    readonly EMISSIONS: 6;
};
export type SortBy = (typeof SortBy)[keyof typeof SortBy];
export declare const MaxStops: {
    readonly ANY: 0;
    readonly NON_STOP: 1;
    readonly ONE_OR_FEWER: 2;
    readonly TWO_OR_FEWER: 3;
};
export type MaxStops = (typeof MaxStops)[keyof typeof MaxStops];
export type PassengerInfo = {
    readonly adults: number;
    readonly children: number;
    readonly infantsOnLap: number;
    readonly infantsInSeat: number;
};
export type FlightSegment = {
    readonly departureAirport: string | readonly string[];
    readonly arrivalAirport: string | readonly string[];
    readonly travelDate: string;
    readonly departureWindow?: string;
    readonly selectedFlight?: FlightResult;
};
export type FlightSearchFilters = {
    readonly tripType: TripType;
    readonly passengers: PassengerInfo;
    readonly segments: readonly FlightSegment[];
    readonly stops: MaxStops;
    readonly seatType: SeatType;
    readonly sortBy: SortBy;
    readonly maxPrice?: number;
    readonly airlines?: readonly string[];
    readonly excludeAirlines?: readonly string[];
    readonly alliance?: "ONEWORLD" | "SKYTEAM" | "STAR_ALLIANCE";
    readonly maxDuration?: number;
    readonly excludeBasicEconomy?: boolean;
};
export type FlightLeg = {
    readonly airline: string;
    readonly airlineName: string;
    readonly flightNumber: string;
    readonly departureAirport: string;
    readonly arrivalAirport: string;
    readonly departureTime: string;
    readonly arrivalTime: string;
    readonly duration: number;
    readonly aircraft: string | null;
    readonly seatPitch: string | null;
    readonly emissionsGrams: number | null;
};
export type FlightResult = {
    readonly price: number;
    readonly currency: string | null;
    readonly duration: number;
    readonly stops: number;
    readonly legs: readonly FlightLeg[];
    readonly totalEmissionsGrams: number | null;
    readonly carbonFootprint?: FlightCarbonFootprint;
    readonly bookingUrl?: string;
};
export type PriceContext = {
    readonly currentPrice: number;
    readonly typicalPrice: number;
    readonly priceDifference: number;
    readonly lowPrice: number;
    readonly highPrice: number;
    readonly assessment: "low" | "typical" | "high";
};
export type DailyPrice = {
    readonly date: string;
    readonly price: number;
};
export type SearchMetadata = {
    readonly priceContext: PriceContext | null;
    readonly dailyPrices: readonly DailyPrice[];
    readonly availableAirlines: readonly {
        readonly code: string;
        readonly name: string;
    }[];
};
export type FlightCombo = readonly FlightResult[];
export type FetchResult = {
    readonly flights: readonly FlightResult[];
    readonly metadata: SearchMetadata;
};
export type SearchResult = {
    readonly tag: "flights";
    readonly flights: readonly FlightResult[];
    readonly metadata: SearchMetadata;
} | {
    readonly tag: "combos";
    readonly combos: readonly FlightCombo[];
    readonly metadata: SearchMetadata;
};
//# sourceMappingURL=types.d.ts.map