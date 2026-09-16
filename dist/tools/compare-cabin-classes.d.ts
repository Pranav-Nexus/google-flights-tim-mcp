import { z } from "zod";
import { type Result } from "../lib/result.js";
export declare const compareCabinClassesSchema: z.ZodObject<{
    origin: z.ZodString;
    destination: z.ZodString;
    departureDate: z.ZodString;
    returnDate: z.ZodOptional<z.ZodString>;
    adults: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    origin: string;
    destination: string;
    departureDate: string;
    adults: number;
    returnDate?: string | undefined;
}, {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string | undefined;
    adults?: number | undefined;
}>;
export declare const handleCompareCabinClasses: (params: z.infer<typeof compareCabinClassesSchema>) => Promise<Result<string>>;
//# sourceMappingURL=compare-cabin-classes.d.ts.map