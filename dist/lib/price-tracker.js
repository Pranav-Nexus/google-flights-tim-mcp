// Zero-native-dependency price tracker using safe atomic JSON persistence.
// Runs smoothly across all platforms and Node versions without node-gyp build tools.
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { ok, err } from "./result.js";
const DB_FILE = process.env.FLIGHT_TRACKER_PATH ??
    path.join(os.homedir(), ".google-flights-tracker.json");
const loadRecords = () => {
    try {
        if (!fs.existsSync(DB_FILE))
            return [];
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
};
const saveRecords = (records) => {
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(records, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
};
const makeRouteKey = (origin, destination, departureDate, returnDate = null) => `${origin.toUpperCase()}_${destination.toUpperCase()}_${departureDate}_${returnDate ?? "OW"}`;
export const recordPrice = (origin, destination, departureDate, returnDate, price, currency = "USD") => {
    try {
        const records = loadRecords();
        const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newRecord = {
            id,
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            departureDate,
            returnDate: returnDate ?? null,
            price,
            currency,
            recordedAt: new Date().toISOString(),
        };
        records.push(newRecord);
        saveRecords(records);
        return ok(newRecord);
    }
    catch (e) {
        return err(e instanceof Error ? e.message : String(e));
    }
};
export const getRouteHistory = (origin, destination, departureDate, returnDate = null) => {
    try {
        const records = loadRecords();
        const targetKey = makeRouteKey(origin, destination, departureDate, returnDate);
        const history = records.filter((r) => makeRouteKey(r.origin, r.destination, r.departureDate, r.returnDate) ===
            targetKey);
        return ok(history.sort((a, b) => a.recordedAt.localeCompare(b.recordedAt)));
    }
    catch (e) {
        return err(e instanceof Error ? e.message : String(e));
    }
};
export const listTrackedRoutes = () => {
    try {
        const records = loadRecords();
        const map = new Map();
        for (const r of records) {
            const key = makeRouteKey(r.origin, r.destination, r.departureDate, r.returnDate);
            const existing = map.get(key) ?? [];
            existing.push(r);
            map.set(key, existing);
        }
        const tracked = [];
        for (const [key, group] of map.entries()) {
            group.sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
            const latest = group[group.length - 1];
            const prices = group.map((g) => g.price);
            tracked.push({
                routeKey: key,
                origin: latest.origin,
                destination: latest.destination,
                departureDate: latest.departureDate,
                returnDate: latest.returnDate,
                latestPrice: latest.price,
                lowestPrice: Math.min(...prices),
                highestPrice: Math.max(...prices),
                currency: latest.currency,
                lastChecked: latest.recordedAt,
                count: group.length,
            });
        }
        return ok(tracked);
    }
    catch (e) {
        return err(e instanceof Error ? e.message : String(e));
    }
};
//# sourceMappingURL=price-tracker.js.map