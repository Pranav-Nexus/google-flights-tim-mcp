export type Ok<T> = {
    readonly tag: "ok";
    readonly value: T;
};
export type Err<E> = {
    readonly tag: "err";
    readonly error: E;
};
export type Result<T, E = string> = Ok<T> | Err<E>;
export declare const ok: <T>(value: T) => Ok<T>;
export declare const err: <E = string>(error: E) => Err<E>;
export declare const isOk: <T, E>(r: Result<T, E>) => r is Ok<T>;
export declare const isErr: <T, E>(r: Result<T, E>) => r is Err<E>;
export declare const mapResult: <T, U, E>(r: Result<T, E>, fn: (val: T) => U) => Result<U, E>;
export declare const flatMap: <T, U, E>(fn: (val: T) => Result<U, E>) => ((r: Result<T, E>) => Result<U, E>);
export declare const mapError: <T, E, F>(r: Result<T, E>, fn: (err: E) => F) => Result<T, F>;
export declare const unwrapOr: <T, E>(r: Result<T, E>, fallback: T) => T;
export declare const fromTryCatch: <T>(fn: () => T, onError?: (e: unknown) => string) => Result<T>;
export declare const fromAsyncTryCatch: <T>(fn: () => Promise<T>, onError?: (e: unknown) => string) => Promise<Result<T>>;
//# sourceMappingURL=result.d.ts.map