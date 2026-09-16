// Pure functional Result type (Ok | Err).
// No exceptions thrown in business logic — errors are data.

export type Ok<T> = { readonly tag: "ok"; readonly value: T };
export type Err<E> = { readonly tag: "err"; readonly error: E };
export type Result<T, E = string> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ tag: "ok", value });
export const err = <E = string>(error: E): Err<E> => ({ tag: "err", error });

export const isOk = <T, E>(r: Result<T, E>): r is Ok<T> => r.tag === "ok";
export const isErr = <T, E>(r: Result<T, E>): r is Err<E> => r.tag === "err";

export const mapResult = <T, U, E>(
  r: Result<T, E>,
  fn: (val: T) => U
): Result<U, E> => (r.tag === "ok" ? ok(fn(r.value)) : r);

export const flatMap = <T, U, E>(
  fn: (val: T) => Result<U, E>
): ((r: Result<T, E>) => Result<U, E>) =>
  (r) => (r.tag === "ok" ? fn(r.value) : r);

export const mapError = <T, E, F>(
  r: Result<T, E>,
  fn: (err: E) => F
): Result<T, F> => (r.tag === "err" ? err(fn(r.error)) : r);

export const unwrapOr = <T, E>(r: Result<T, E>, fallback: T): T =>
  r.tag === "ok" ? r.value : fallback;

export const fromTryCatch = <T>(
  fn: () => T,
  onError: (e: unknown) => string = (e) =>
    e instanceof Error ? e.message : String(e)
): Result<T> => {
  try {
    return ok(fn());
  } catch (e) {
    return err(onError(e));
  }
};

export const fromAsyncTryCatch = async <T>(
  fn: () => Promise<T>,
  onError: (e: unknown) => string = (e) =>
    e instanceof Error ? e.message : String(e)
): Promise<Result<T>> => {
  try {
    return ok(await fn());
  } catch (e) {
    return err(onError(e));
  }
};
