import { z } from "zod";
import { type Result } from "../lib/result.js";
export declare const getFlightCarbonSchema: z.ZodObject<{
    origin: z.ZodString;
    destination: z.ZodString;
    airline: z.ZodOptional<z.ZodString>;
    flightNumber: z.ZodOptional<z.ZodString>;
    departureDate: z.ZodString;
    aircraft: z.ZodOptional<z.ZodString>;
    cabinClass: z.ZodDefault<z.ZodOptional<z.ZodEnum<["economy", "premium_economy", "business", "first"]>>>;
}, "strip", z.ZodTypeAny, {
    origin: string;
    destination: string;
    departureDate: string;
    cabinClass: "economy" | "premium_economy" | "business" | "first";
    airline?: string | undefined;
    flightNumber?: string | undefined;
    aircraft?: string | undefined;
}, {
    origin: string;
    destination: string;
    departureDate: string;
    cabinClass?: "economy" | "premium_economy" | "business" | "first" | undefined;
    airline?: string | undefined;
    flightNumber?: string | undefined;
    aircraft?: string | undefined;
}>;
export declare const handleGetFlightCarbon: (params: z.infer<typeof getFlightCarbonSchema>) => Promise<Result<string>>;
//# sourceMappingURL=get-flight-carbon.d.ts.map