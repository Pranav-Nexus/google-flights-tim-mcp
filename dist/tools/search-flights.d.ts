import { z } from "zod";
import type { Result } from "../lib/result.js";
export declare const searchFlightsSchema: z.ZodObject<{
    origin: z.ZodString;
    destination: z.ZodString;
    departureDate: z.ZodString;
    returnDate: z.ZodOptional<z.ZodString>;
    cabinClass: z.ZodDefault<z.ZodOptional<z.ZodEnum<["economy", "premium_economy", "business", "first"]>>>;
    adults: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    children: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    infants: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    maxStops: z.ZodOptional<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["best", "price", "duration", "departure", "arrival", "emissions"]>>>;
    departureWindow: z.ZodOptional<z.ZodString>;
    airlines: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    maxResults: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    origin: string;
    destination: string;
    departureDate: string;
    cabinClass: "economy" | "premium_economy" | "business" | "first";
    adults: number;
    children: number;
    infants: number;
    sortBy: "price" | "duration" | "best" | "departure" | "arrival" | "emissions";
    maxResults: number;
    returnDate?: string | undefined;
    maxStops?: number | undefined;
    departureWindow?: string | undefined;
    airlines?: string[] | undefined;
}, {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string | undefined;
    cabinClass?: "economy" | "premium_economy" | "business" | "first" | undefined;
    adults?: number | undefined;
    children?: number | undefined;
    infants?: number | undefined;
    maxStops?: number | undefined;
    sortBy?: "price" | "duration" | "best" | "departure" | "arrival" | "emissions" | undefined;
    departureWindow?: string | undefined;
    airlines?: string[] | undefined;
    maxResults?: number | undefined;
}>;
export declare const handleSearchFlights: (params: z.infer<typeof searchFlightsSchema>) => Promise<Result<string>>;
//# sourceMappingURL=search-flights.d.ts.map