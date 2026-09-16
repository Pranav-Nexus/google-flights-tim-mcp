// Structured JSON logger writing strictly to stderr.
// stdout is reserved exclusively for MCP JSON-RPC messages.

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Readonly<Record<LogLevel, number>> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ?? "info";

const shouldLog = (level: LogLevel): boolean =>
  LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel];

const emit = (
  level: LogLevel,
  event: string,
  data?: Readonly<Record<string, unknown>>
): void => {
  if (!shouldLog(level)) return;
  const entry = {
    ts: new Date().toISOString(),
    lvl: level,
    evt: event,
    ...data,
  };
  process.stderr.write(JSON.stringify(entry) + "\n");
};

export const logger = {
  debug: (event: string, data?: Readonly<Record<string, unknown>>) =>
    emit("debug", event, data),
  info: (event: string, data?: Readonly<Record<string, unknown>>) =>
    emit("info", event, data),
  warn: (event: string, data?: Readonly<Record<string, unknown>>) =>
    emit("warn", event, data),
  error: (event: string, data?: Readonly<Record<string, unknown>>) =>
    emit("error", event, data),
};

export const startTimer = (): (() => number) => {
  const start = performance.now();
  return () => Math.round(performance.now() - start);
};
