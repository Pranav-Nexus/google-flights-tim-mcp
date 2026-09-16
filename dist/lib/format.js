// Currency and text formatting utilities.
const CURRENCY_SYMBOLS = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
    CAD: "CA$",
    AUD: "A$",
    CHF: "CHF ",
    CNY: "CN¥",
};
export const formatPrice = (amount, currency = "USD") => {
    if (amount <= 0)
        return "Price unavailable";
    const curr = currency ?? "USD";
    const sym = CURRENCY_SYMBOLS[curr];
    if (sym) {
        return `${sym}${amount.toLocaleString("en-US")}`;
    }
    return `${amount.toLocaleString("en-US")} ${curr}`;
};
//# sourceMappingURL=format.js.map