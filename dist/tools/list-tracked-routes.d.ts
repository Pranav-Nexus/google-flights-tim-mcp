import { z } from "zod";
import { type Result } from "../lib/result.js";
export declare const listTrackedRoutesSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const handleListTrackedRoutes: (_params: z.infer<typeof listTrackedRoutesSchema>) => Promise<Result<string>>;
//# sourceMappingURL=list-tracked-routes.d.ts.map