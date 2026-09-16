import { z } from "zod";
import { type Result } from "../lib/result.js";
export declare const priceHistorySchema: z.ZodObject<{
    origin: z.ZodString;
    destination: z.ZodString;
    departureDate: z.ZodString;
    returnDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string | undefined;
}, {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string | undefined;
}>;
export declare const handlePriceHistory: (params: z.infer<typeof priceHistorySchema>) => Promise<Result<string>>;
//# sourceMappingURL=price-history.d.ts.map