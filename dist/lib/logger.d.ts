export type LogLevel = "debug" | "info" | "warn" | "error";
export declare const logger: {
    debug: (event: string, data?: Readonly<Record<string, unknown>>) => void;
    info: (event: string, data?: Readonly<Record<string, unknown>>) => void;
    warn: (event: string, data?: Readonly<Record<string, unknown>>) => void;
    error: (event: string, data?: Readonly<Record<string, unknown>>) => void;
};
export declare const startTimer: () => (() => number);
//# sourceMappingURL=logger.d.ts.map