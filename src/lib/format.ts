// Currency and text formatting utilities.

const CURRENCY_SYMBOLS: Readonly<Record<string, string>> = {
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

export const formatPrice = (
  amount: number,
  currency: string | null = "USD"
): string => {
  if (amount <= 0) return "Price unavailable";
  const curr = currency ?? "USD";
  const sym = CURRENCY_SYMBOLS[curr];
  if (sym) {
    return `${sym}${amount.toLocaleString("en-US")}`;
  }
  return `${amount.toLocaleString("en-US")} ${curr}`;
};
