import { z } from "zod";
import { type Result } from "../lib/result.js";
export declare const calendarHeatmapSchema: z.ZodObject<{
    origin: z.ZodString;
    destination: z.ZodString;
    month: z.ZodString;
    cabinClass: z.ZodDefault<z.ZodOptional<z.ZodEnum<["economy", "premium_economy", "business", "first"]>>>;
}, "strip", z.ZodTypeAny, {
    month: string;
    origin: string;
    destination: string;
    cabinClass: "economy" | "premium_economy" | "business" | "first";
}, {
    month: string;
    origin: string;
    destination: string;
    cabinClass?: "economy" | "premium_economy" | "business" | "first" | undefined;
}>;
export declare const handleCalendarHeatmap: (params: z.infer<typeof calendarHeatmapSchema>) => Promise<Result<string>>;
//# sourceMappingURL=calendar-heatmap.d.ts.map