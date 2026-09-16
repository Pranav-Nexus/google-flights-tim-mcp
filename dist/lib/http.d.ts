import { type Result } from "./result.js";
export declare const httpPost: (url: string, body: string, contentType?: string, customHeaders?: Record<string, string>, timeoutMs?: number) => Promise<Result<string>>;
export declare const httpGet: (url: string, customHeaders?: Record<string, string>, timeoutMs?: number) => Promise<Result<string>>;
//# sourceMappingURL=http.d.ts.map