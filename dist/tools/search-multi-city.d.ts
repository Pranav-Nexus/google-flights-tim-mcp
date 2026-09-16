import { z } from "zod";
import type { Result } from "../lib/result.js";
export declare const searchMultiCitySchema: z.ZodObject<{
    segments: z.ZodArray<z.ZodObject<{
        origin: z.ZodString;
        destination: z.ZodString;
        date: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        origin: string;
        destination: string;
        date: string;
    }, {
        origin: string;
        destination: string;
        date: string;
    }>, "many">;
    cabinClass: z.ZodDefault<z.ZodOptional<z.ZodEnum<["economy", "premium_economy", "business", "first"]>>>;
    adults: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    children: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    infants: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    maxStops: z.ZodOptional<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["best", "price", "duration"]>>>;
    maxResults: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    cabinClass: "economy" | "premium_economy" | "business" | "first";
    adults: number;
    children: number;
    infants: number;
    sortBy: "price" | "duration" | "best";
    maxResults: number;
    segments: {
        origin: string;
        destination: string;
        date: string;
    }[];
    maxStops?: number | undefined;
}, {
    segments: {
        origin: string;
        destination: string;
        date: string;
    }[];
    cabinClass?: "economy" | "premium_economy" | "business" | "first" | undefined;
    adults?: number | undefined;
    children?: number | undefined;
    infants?: number | undefined;
    maxStops?: number | undefined;
    sortBy?: "price" | "duration" | "best" | undefined;
    maxResults?: number | undefined;
}>;
export declare const handleSearchMultiCity: (params: z.infer<typeof searchMultiCitySchema>) => Promise<Result<string>>;
//# sourceMappingURL=search-multi-city.d.ts.map