// Pure functional Result type (Ok | Err).
// No exceptions thrown in business logic — errors are data.
export const ok = (value) => ({ tag: "ok", value });
export const err = (error) => ({ tag: "err", error });
export const isOk = (r) => r.tag === "ok";
export const isErr = (r) => r.tag === "err";
export const mapResult = (r, fn) => (r.tag === "ok" ? ok(fn(r.value)) : r);
export const flatMap = (fn) => (r) => (r.tag === "ok" ? fn(r.value) : r);
export const mapError = (r, fn) => (r.tag === "err" ? err(fn(r.error)) : r);
export const unwrapOr = (r, fallback) => r.tag === "ok" ? r.value : fallback;
export const fromTryCatch = (fn, onError = (e) => e instanceof Error ? e.message : String(e)) => {
    try {
        return ok(fn());
    }
    catch (e) {
        return err(onError(e));
    }
};
export const fromAsyncTryCatch = async (fn, onError = (e) => e instanceof Error ? e.message : String(e)) => {
    try {
        return ok(await fn());
    }
    catch (e) {
        return err(onError(e));
    }
};
//# sourceMappingURL=result.js.map