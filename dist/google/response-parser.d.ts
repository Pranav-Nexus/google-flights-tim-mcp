import type { FlightResult, SearchMetadata } from "./types.js";
import { type Result } from "../lib/result.js";
type ParsedInner = {
    readonly flights: readonly FlightResult[];
    readonly metadata: SearchMetadata;
};
export declare const parseFlightsResponse: (rawText: string) => Result<ParsedInner>;
export {};
//# sourceMappingURL=response-parser.d.ts.map