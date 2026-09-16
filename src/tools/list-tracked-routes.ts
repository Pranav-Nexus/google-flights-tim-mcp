import { z } from "zod";
import { listTrackedRoutes } from "../lib/price-tracker.js";
import { formatPrice } from "../lib/format.js";
import { ok, type Result } from "../lib/result.js";

export const listTrackedRoutesSchema = z.object({}).describe("Lists all actively tracked flight routes and summary price statistics.");

export const handleListTrackedRoutes = async (
  _params: z.infer<typeof listTrackedRoutesSchema>
): Promise<Result<string>> => {
  const routesRes = listTrackedRoutes();
  if (routesRes.tag === "err") return routesRes;

  const routes = routesRes.value;
  if (routes.length === 0) {
    return ok("No flight routes are currently tracked. Use 'track_price' to start tracking routes.");
  }

  const lines = routes.map((r, i) => {
    const dates = r.returnDate
      ? `${r.departureDate} to ${r.returnDate} (Round-Trip)`
      : `${r.departureDate} (One-Way)`;
    const lastTime = r.lastChecked.replace("T", " ").substring(0, 16);

    return `Route #${i + 1}: ${r.origin} -> ${r.destination} [${dates}]
  • Current: ${formatPrice(r.latestPrice, r.currency)}
  • Range: ${formatPrice(r.lowestPrice, r.currency)} (lowest) - ${formatPrice(r.highestPrice, r.currency)} (highest)
  • Checkpoints: ${r.count} | Last Checked: ${lastTime}`;
  });

  const output = [
    `=== Actively Tracked Flight Routes (${routes.length}) ===`,
    ``,
    ...lines,
  ].join("\n\n");

  return ok(output);
};
