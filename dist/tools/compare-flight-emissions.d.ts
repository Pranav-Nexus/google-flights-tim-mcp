import { z } from "zod";
import { type Result } from "../lib/result.js";
export declare const compareFlightEmissionsSchema: z.ZodObject<{
    origin: z.ZodString;
    destination: z.ZodString;
    departureDate: z.ZodString;
    cabinClass: z.ZodDefault<z.ZodOptional<z.ZodEnum<["economy", "premium_economy", "business", "first"]>>>;
    maxResults: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    origin: string;
    destination: string;
    departureDate: string;
    cabinClass: "economy" | "premium_economy" | "business" | "first";
    maxResults: number;
}, {
    origin: string;
    destination: string;
    departureDate: string;
    cabinClass?: "economy" | "premium_economy" | "business" | "first" | undefined;
    maxResults?: number | undefined;
}>;
export declare const handleCompareFlightEmissions: (params: z.infer<typeof compareFlightEmissionsSchema>) => Promise<Result<string>>;
//# sourceMappingURL=compare-flight-emissions.d.ts.map