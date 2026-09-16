# Google Flights & Travel Impact Model (TIM) Unified MCP Server

A next-generation, Model Context Protocol (MCP) server combining the richest capabilities of open-source flight scrapers ([`punitarani/fli`](https://github.com/punitarani/fli), [`andreacappelletti97/google-flights-mcp`](https://github.com/andreacappelletti97/google-flights-mcp)) and **Google's Travel Impact Model (TIM)** to deliver real-time flight search, price tracking, and science-certified per-passenger carbon footprint calculations.

Achieves a verified **100/100 (Grade A+)** LLM-Readiness score via `mcp-verify` across all **15 tools** with 0 warnings, 0 errors, and 0 suggestions.

---

## 🌟 Key Highlights

### 1. Travel Impact Model (TIM) Included by Default
Every flight search (`search_flights`, `search_multi_city`, `compare_cabin_classes`) automatically enriches flight itineraries and individual legs with their scientific carbon footprint ($CO_2e$), comparison against typical route baselines (e.g. `🌱 -18% vs route avg (Eco-Choice)`), and cabin class seating weightings.

* **Dual-Engine Architecture**:
  * **Engine 1 (Official Google TIM API)**: Automatically calls `https://travelimpactmodel.googleapis.com/v1/flights:computeFlightEmissions` when `GOOGLE_API_KEY` or `TIM_API_KEY` is present.
  * **Engine 2 (Embedded Science Engine)**: When running zero-key, uses a built-in ICAO/ICCT aviation emissions model taking Great-Circle Distance (Haversine + ICAO terminal area routing factor), aircraft fuel burn tables (Airbus A320neo, Boeing 787, A350, 737 MAX), and cabin space multipliers.

### 2. Best-of-Ecosystem Hybrid
* **From `punitarani/fli`**: Multi-airport queries (e.g. `origin: "JFK,LGA"`), departure time window restrictions (`"6-12"` or `"18-24"`), airline alliance filtering (`ONEWORLD`, `SKYTEAM`, `STAR_ALLIANCE`), and shareable direct booking links.
* **From `andreacappelletti97/google-flights-mcp`**: Functional TypeScript architecture, recursive cache key sorting (`sortObjectKeys` eliminating cache collision bugs), circuit breaker, and deterministic client-side sorting.
* **Zero Native Compilation Headaches**: Eliminates native C++ sqlite dependencies in favor of atomic, safe JSON persistence for price tracking—installing and running seamlessly across Windows, macOS, Linux, and all Node versions (including Node 26+).

---

## 🛠️ The 15 MCP Tools

### ✈️ Core Flight Search & Analysis
1. **`search_flights`**: One-way or round-trip flight search supporting multi-airport origins/destinations, departure time windows, airlines, stops, and cabin classes. **Includes Travel Impact Model carbon footprint by default.**
2. **`search_multi_city`**: Complex multi-city flight search (2 to 6 legs) with cumulative trip emissions.
3. **`compare_cabin_classes`**: Side-by-side comparison of Economy, Premium Economy, Business, and First class fares and their corresponding carbon footprint impacts.
4. **`get_calendar_heatmap`**: Flexible date heatmap returning the cheapest daily fares for every day of a month.
5. **`get_price_insights`**: Compares current fares against historical route norms (low, typical, high) and gives booking timing advice.
6. **`analyze_layovers`**: Evaluates layover duration, tight connection risks (<60 min), overnight transfers, and airport changes.
7. **`get_flight_url`**: Generates a shareable, clickable direct Google Flights deep-link preloaded with route, dates, cabin, and currency.

### 🌱 Dedicated Travel Impact Model (TIM) Tools
8. **`get_flight_carbon_footprint`**: In-depth scientific audit of any flight's carbon footprint. Breaks down emissions across Economy, Premium Economy, Business, and First class, highlights aircraft efficiency, and compares against route typical averages.
9. **`get_route_typical_emissions`**: Calculates the Travel Impact Model market typical emissions baseline between any two airports worldwide, along with distance and recommended eco-friendly aircraft types.
10. **`compare_flight_emissions`**: The **"Eco-Flyer"** tool: ranks all flights on a route strictly by carbon efficiency, identifying the greenest flight and quantifying $CO_2$ savings vs price tradeoffs.

### 📈 Price Tracking & Airport Intelligence
11. **`track_price`**: Saves a flight route and records its current fare in the local price tracker database.
12. **`get_price_history`**: Views recorded price history and trends over time for tracked routes.
13. **`list_tracked_routes`**: Lists all actively tracked flight routes, lowest observed fares, and latest checks.
14. **`lookup_airport`**: Instant search across 8,800+ worldwide IATA airports by city, airport name, or code.
15. **`find_nearby_airports`**: Discovers alternative commercial airports within a given radius (km) of any reference airport using Great-Circle distance.

---

## 🚀 Installation & Antigravity Setup

### Add to Antigravity CLI
To register this MCP server in Antigravity:
```bash
agy mcp add google-flights-tim node "C:/Users/harih/Documents/Personal/Projects/Antigravity CLI/google-flights-tim-mcp/dist/index.js"
```

### Optional Environment Variables
* `TIM_API_KEY` or `GOOGLE_API_KEY`: *(Optional)* Google Cloud API key with Travel Impact Model API enabled. If not set, the server runs the embedded TIM science engine.
* `FLIGHT_TRACKER_PATH`: *(Optional)* Custom file path for the price tracker database. Defaults to `~/.google-flights-tracker.json`.

---

## 🧪 Testing & Verification

Run the test suite:
```bash
npm test
```

Run the `mcp-verify` audit:
```bash
node "C:/Users/harih/source/repos/mcp-verify/bin/mcp-verify.js" run node dist/index.js
```
Score: **100/100 (Grade A+, 0 errors, 0 warnings, 0 suggestions)**.
