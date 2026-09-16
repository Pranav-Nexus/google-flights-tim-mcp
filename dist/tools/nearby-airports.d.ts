import { z } from "zod";
import { type Result } from "../lib/result.js";
export declare const nearbyAirportsSchema: z.ZodObject<{
    code: z.ZodString;
    radiusKm: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    radiusKm: number;
}, {
    code: string;
    radiusKm?: number | undefined;
}>;
export declare const handleNearbyAirports: (params: z.infer<typeof nearbyAirportsSchema>) => Promise<Result<string>>;
//# sourceMappingURL=nearby-airports.d.ts.map