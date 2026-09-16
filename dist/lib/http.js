// Resilient HTTP client with modern browser headers, timeout, and Result handling.
import { ok, err } from "./result.js";
const DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";
export const httpPost = async (url, body, contentType = "application/x-www-form-urlencoded;charset=UTF-8", customHeaders, timeoutMs = 30_000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": contentType,
                "user-agent": DEFAULT_USER_AGENT,
                "sec-ch-ua": '"Chromium";v="133", "Google Chrome";v="133", "Not?A_Brand";v="99"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "accept-language": "en-US,en;q=0.9",
                ...customHeaders,
            },
            body,
            signal: controller.signal,
        });
        if (!res.ok) {
            return err(`HTTP ${res.status} ${res.statusText}`);
        }
        const text = await res.text();
        return ok(text);
    }
    catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
            return err(`HTTP POST request timed out after ${timeoutMs}ms`);
        }
        return err(e instanceof Error ? e.message : String(e));
    }
    finally {
        clearTimeout(timer);
    }
};
export const httpGet = async (url, customHeaders, timeoutMs = 30_000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "user-agent": DEFAULT_USER_AGENT,
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                ...customHeaders,
            },
            signal: controller.signal,
        });
        if (!res.ok) {
            return err(`HTTP ${res.status} ${res.statusText}`);
        }
        const text = await res.text();
        return ok(text);
    }
    catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
            return err(`HTTP GET request timed out after ${timeoutMs}ms`);
        }
        return err(e instanceof Error ? e.message : String(e));
    }
    finally {
        clearTimeout(timer);
    }
};
//# sourceMappingURL=http.js.map