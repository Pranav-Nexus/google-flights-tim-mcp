import { z } from "zod";
import { type Result } from "../lib/result.js";
export declare const lookupAirportSchema: z.ZodObject<{
    query: z.ZodString;
}, "strip", z.ZodTypeAny, {
    query: string;
}, {
    query: string;
}>;
export declare const handleLookupAirport: (params: z.infer<typeof lookupAirportSchema>) => Promise<Result<string>>;
//# sourceMappingURL=lookup-airport.d.ts.map