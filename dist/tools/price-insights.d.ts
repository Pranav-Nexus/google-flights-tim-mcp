import { z } from "zod";
import { type Result } from "../lib/result.js";
export declare const priceInsightsSchema: z.ZodObject<{
    origin: z.ZodString;
    destination: z.ZodString;
    departureDate: z.ZodString;
    returnDate: z.ZodOptional<z.ZodString>;
    cabinClass: z.ZodDefault<z.ZodOptional<z.ZodEnum<["economy", "premium_economy", "business", "first"]>>>;
}, "strip", z.ZodTypeAny, {
    origin: string;
    destination: string;
    departureDate: string;
    cabinClass: "economy" | "premium_economy" | "business" | "first";
    returnDate?: string | undefined;
}, {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string | undefined;
    cabinClass?: "economy" | "premium_economy" | "business" | "first" | undefined;
}>;
export declare const handlePriceInsights: (params: z.infer<typeof priceInsightsSchema>) => Promise<Result<string>>;
//# sourceMappingURL=price-insights.d.ts.map