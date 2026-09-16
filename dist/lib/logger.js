// Structured JSON logger writing strictly to stderr.
// stdout is reserved exclusively for MCP JSON-RPC messages.
const LEVEL_PRIORITY = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
const currentLevel = process.env.LOG_LEVEL ?? "info";
const shouldLog = (level) => LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel];
const emit = (level, event, data) => {
    if (!shouldLog(level))
        return;
    const entry = {
        ts: new Date().toISOString(),
        lvl: level,
        evt: event,
        ...data,
    };
    process.stderr.write(JSON.stringify(entry) + "\n");
};
export const logger = {
    debug: (event, data) => emit("debug", event, data),
    info: (event, data) => emit("info", event, data),
    warn: (event, data) => emit("warn", event, data),
    error: (event, data) => emit("error", event, data),
};
export const startTimer = () => {
    const start = performance.now();
    return () => Math.round(performance.now() - start);
};
//# sourceMappingURL=logger.js.map