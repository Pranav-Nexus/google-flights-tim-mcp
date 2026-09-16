import { z } from "zod";
import { getRouteHistory } from "../lib/price-tracker.js";
import { formatPrice } from "../lib/format.js";
import { ok, type Result } from "../lib/result.js";

export const priceHistorySchema = z.object({
  origin: z.string().min(3).describe("Departure airport IATA code (e.g., 'JFK')"),
  destination: z.string().min(3).describe("Arrival airport IATA code (e.g., 'LHR')"),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").describe("Departure date in YYYY-MM-DD format"),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional().describe("Return date in YYYY-MM-DD format (omit for one-way)"),
});

export const handlePriceHistory = async (
  params: z.infer<typeof priceHistorySchema>
): Promise<Result<string>> => {
  const historyRes = getRouteHistory(
    params.origin,
    params.destination,
    params.departureDate,
    params.returnDate ?? null
  );

  if (historyRes.tag === "err") return historyRes;
  const records = historyRes.value;

  if (records.length === 0) {
    return ok(`No tracked price records found for ${params.origin.toUpperCase()} to ${params.destination.toUpperCase()} on ${params.departureDate}. Use 'track_price' to start tracking.`);
  }

  const prices = records.map((r) => r.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const latest = records[records.length - 1]!;

  const lines = records.map((r) => {
    const time = r.recordedAt.replace("T", " ").substring(0, 16);
    return `  [${time}] ${formatPrice(r.price, r.currency)}`;
  });

  const output = [
    `=== Price History: ${params.origin.toUpperCase()} -> ${params.destination.toUpperCase()} ===`,
    `Dates: ${params.departureDate}${params.returnDate ? ` to ${params.returnDate}` : ""}`,
    `Latest: ${formatPrice(latest.price, latest.currency)} | Lowest Ever: ${formatPrice(minPrice, latest.currency)} | Highest Ever: ${formatPrice(maxPrice, latest.currency)}`,
    `Total Checkpoints: ${records.length}`,
    ``,
    ...lines,
  ].join("\n");

  return ok(output);
};
