// Pure function composition via pipe.
// Evaluates left-to-right: pipe(x, f, g) === g(f(x)).
export function pipe(value, ...fns) {
    return fns.reduce((acc, fn) => fn(acc), value);
}
//# sourceMappingURL=pipe.js.map