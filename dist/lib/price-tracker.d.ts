import { type Result } from "./result.js";
export type PriceRecord = {
    readonly id: string;
    readonly origin: string;
    readonly destination: string;
    readonly departureDate: string;
    readonly returnDate: string | null;
    readonly price: number;
    readonly currency: string;
    readonly recordedAt: string;
};
export type TrackedRoute = {
    readonly routeKey: string;
    readonly origin: string;
    readonly destination: string;
    readonly departureDate: string;
    readonly returnDate: string | null;
    readonly latestPrice: number;
    readonly lowestPrice: number;
    readonly highestPrice: number;
    readonly currency: string;
    readonly lastChecked: string;
    readonly count: number;
};
export declare const recordPrice: (origin: string, destination: string, departureDate: string, returnDate: string | null, price: number, currency?: string) => Result<PriceRecord>;
export declare const getRouteHistory: (origin: string, destination: string, departureDate: string, returnDate?: string | null) => Result<readonly PriceRecord[]>;
export declare const listTrackedRoutes: () => Result<readonly TrackedRoute[]>;
//# sourceMappingURL=price-tracker.d.ts.map