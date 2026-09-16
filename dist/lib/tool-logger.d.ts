import type { Result } from "./result.js";
export declare const withToolLogging: <TParams, TReturn>(toolName: string, handler: (params: TParams) => Promise<Result<TReturn>>) => ((params: TParams) => Promise<Result<TReturn>>);
//# sourceMappingURL=tool-logger.d.ts.map