import { logger, startTimer } from "./logger.js";
export const withToolLogging = (toolName, handler) => {
    return async (params) => {
        const elapsed = startTimer();
        logger.info("tool_call_start", { tool: toolName });
        try {
            const result = await handler(params);
            const durationMs = elapsed();
            if (result.tag === "ok") {
                logger.info("tool_call_success", { tool: toolName, durationMs });
            }
            else {
                logger.warn("tool_call_failed", { tool: toolName, error: result.error, durationMs });
            }
            return result;
        }
        catch (e) {
            const durationMs = elapsed();
            const error = e instanceof Error ? e.message : String(e);
            logger.error("tool_call_exception", { tool: toolName, error, durationMs });
            return { tag: "err", error };
        }
    };
};
//# sourceMappingURL=tool-logger.js.map