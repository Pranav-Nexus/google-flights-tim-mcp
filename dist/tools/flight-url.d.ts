import { z } from "zod";
import { type Result } from "../lib/result.js";
export declare const flightUrlSchema: z.ZodObject<{
    origin: z.ZodString;
    destination: z.ZodString;
    departureDate: z.ZodString;
    returnDate: z.ZodOptional<z.ZodString>;
    cabinClass: z.ZodDefault<z.ZodOptional<z.ZodEnum<["economy", "premium_economy", "business", "first"]>>>;
    currency: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    origin: string;
    destination: string;
    departureDate: string;
    cabinClass: "economy" | "premium_economy" | "business" | "first";
    returnDate?: string | undefined;
}, {
    origin: string;
    destination: string;
    departureDate: string;
    currency?: string | undefined;
    returnDate?: string | undefined;
    cabinClass?: "economy" | "premium_economy" | "business" | "first" | undefined;
}>;
export declare const handleFlightUrl: (params: z.infer<typeof flightUrlSchema>) => Promise<Result<string>>;
//# sourceMappingURL=flight-url.d.ts.map