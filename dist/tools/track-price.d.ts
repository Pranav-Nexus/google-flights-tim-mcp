import { z } from "zod";
import { type Result } from "../lib/result.js";
export declare const trackPriceSchema: z.ZodObject<{
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
export declare const handleTrackPrice: (params: z.infer<typeof trackPriceSchema>) => Promise<Result<string>>;
//# sourceMappingURL=track-price.d.ts.map