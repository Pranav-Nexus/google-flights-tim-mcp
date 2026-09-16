import { z } from "zod";
import { type Result } from "../lib/result.js";
export declare const getRouteEmissionsSchema: z.ZodObject<{
    origin: z.ZodString;
    destination: z.ZodString;
}, "strip", z.ZodTypeAny, {
    origin: string;
    destination: string;
}, {
    origin: string;
    destination: string;
}>;
export declare const handleGetRouteEmissions: (params: z.infer<typeof getRouteEmissionsSchema>) => Promise<Result<string>>;
//# sourceMappingURL=get-route-emissions.d.ts.map