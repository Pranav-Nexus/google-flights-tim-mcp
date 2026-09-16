import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Core Tools
import { searchFlightsSchema, handleSearchFlights } from "./tools/search-flights.js";
import { searchMultiCitySchema, handleSearchMultiCity } from "./tools/search-multi-city.js";
import { compareCabinClassesSchema, handleCompareCabinClasses } from "./tools/compare-cabin-classes.js";
import { calendarHeatmapSchema, handleCalendarHeatmap } from "./tools/calendar-heatmap.js";
import { priceInsightsSchema, handlePriceInsights } from "./tools/price-insights.js";
import { priceHistorySchema, handlePriceHistory } from "./tools/price-history.js";
import { trackPriceSchema, handleTrackPrice } from "./tools/track-price.js";
import { listTrackedRoutesSchema, handleListTrackedRoutes } from "./tools/list-tracked-routes.js";
import { lookupAirportSchema, handleLookupAirport } from "./tools/lookup-airport.js";
import { nearbyAirportsSchema, handleNearbyAirports } from "./tools/nearby-airports.js";
import { flightUrlSchema, handleFlightUrl } from "./tools/flight-url.js";
import { analyzeLayoversSchema, handleAnalyzeLayovers } from "./tools/analyze-layovers.js";

// Dedicated Travel Impact Model (TIM) Tools
import { getFlightCarbonSchema, handleGetFlightCarbon } from "./tools/get-flight-carbon.js";
import { getRouteEmissionsSchema, handleGetRouteEmissions } from "./tools/get-route-emissions.js";
import { compareFlightEmissionsSchema, handleCompareFlightEmissions } from "./tools/compare-flight-emissions.js";

import type { Result } from "./lib/result.js";
import { logger } from "./lib/logger.js";
import { withToolLogging } from "./lib/tool-logger.js";

const toMcpResponse = (result: Result<string>) =>
  result.tag === "ok"
    ? { content: [{ type: "text" as const, text: result.value }] }
    : {
        content: [{ type: "text" as const, text: `Error: ${result.error}` }],
        isError: true as const,
      };

// Wrap handlers with diagnostic logging
const loggedSearchFlights = withToolLogging("search_flights", handleSearchFlights);
const loggedSearchMultiCity = withToolLogging("search_multi_city", handleSearchMultiCity);
const loggedCompareCabin = withToolLogging("compare_cabin_classes", handleCompareCabinClasses);
const loggedCalendarHeatmap = withToolLogging("get_calendar_heatmap", handleCalendarHeatmap);
const loggedPriceInsights = withToolLogging("get_price_insights", handlePriceInsights);
const loggedPriceHistory = withToolLogging("get_price_history", handlePriceHistory);
const loggedTrackPrice = withToolLogging("track_price", handleTrackPrice);
const loggedListTrackedRoutes = withToolLogging("list_tracked_routes", handleListTrackedRoutes);
const loggedLookupAirport = withToolLogging("lookup_airport", handleLookupAirport);
const loggedNearbyAirports = withToolLogging("find_nearby_airports", handleNearbyAirports);
const loggedFlightUrl = withToolLogging("get_flight_url", handleFlightUrl);
const loggedAnalyzeLayovers = withToolLogging("analyze_layovers", handleAnalyzeLayovers);

// TIM Tools
const loggedGetFlightCarbon = withToolLogging("get_flight_carbon_footprint", handleGetFlightCarbon);
const loggedGetRouteEmissions = withToolLogging("get_route_typical_emissions", handleGetRouteEmissions);
const loggedCompareFlightEmissions = withToolLogging("compare_flight_emissions", handleCompareFlightEmissions);

export const registerAllTools = (server: McpServer): void => {
  // 1. search_flights (Enriched with TIM carbon footprint by default)
  server.tool(
    "search_flights",
    "Search for one-way or round-trip flights between airports. Supports multi-airport queries (e.g. 'JFK,LGA'), departure time windows, airlines, stops, and cabin classes. Every flight includes its Travel Impact Model (TIM) carbon footprint by default.",
    searchFlightsSchema.shape,
    async (params) => toMcpResponse(await loggedSearchFlights(params))
  );

  // 2. search_multi_city
  server.tool(
    "search_multi_city",
    "Search for complex multi-city flight itineraries (2 to 6 legs). Includes cumulative Travel Impact Model carbon footprints by default.",
    searchMultiCitySchema.shape,
    async (params) => toMcpResponse(await loggedSearchMultiCity(params))
  );

  // 3. get_flight_carbon_footprint (Dedicated TIM)
  server.tool(
    "get_flight_carbon_footprint",
    "Calculate and audit the detailed Travel Impact Model (TIM) carbon footprint for any flight. Returns per-passenger CO2e, cabin class multipliers (Economy, Premium Economy, Business, First), and route baseline benchmark comparison.",
    getFlightCarbonSchema.shape,
    async (params) => toMcpResponse(await loggedGetFlightCarbon(params))
  );

  // 4. get_route_typical_emissions (Dedicated TIM)
  server.tool(
    "get_route_typical_emissions",
    "Compute the Travel Impact Model market typical baseline emissions between any two airports worldwide, along with distance and fleet efficiency benchmarks.",
    getRouteEmissionsSchema.shape,
    async (params) => toMcpResponse(await loggedGetRouteEmissions(params))
  );

  // 5. compare_flight_emissions (Dedicated TIM)
  server.tool(
    "compare_flight_emissions",
    "Rank and compare all flights on a route strictly by carbon efficiency. Identifies the cleanest 'Green Choice' flight and quantifies carbon savings vs price tradeoffs.",
    compareFlightEmissionsSchema.shape,
    async (params) => toMcpResponse(await loggedCompareFlightEmissions(params))
  );

  // 6. compare_cabin_classes
  server.tool(
    "compare_cabin_classes",
    "Compare airfares and carbon footprints side-by-side across Economy, Premium Economy, Business, and First class for the same journey.",
    compareCabinClassesSchema.shape,
    async (params) => toMcpResponse(await loggedCompareCabin(params))
  );

  // 7. get_calendar_heatmap
  server.tool(
    "get_calendar_heatmap",
    "Get a daily price calendar for an entire month, displaying the lowest available fare for every single day to spot the cheapest travel dates.",
    calendarHeatmapSchema.shape,
    async (params) => toMcpResponse(await loggedCalendarHeatmap(params))
  );

  // 8. get_price_insights
  server.tool(
    "get_price_insights",
    "Analyze current flight prices against historical norms (low, typical, high) and provide booking advice on whether to book now or wait.",
    priceInsightsSchema.shape,
    async (params) => toMcpResponse(await loggedPriceInsights(params))
  );

  // 9. get_price_history
  server.tool(
    "get_price_history",
    "View the recorded price history and trends for a tracked flight route across past observations.",
    priceHistorySchema.shape,
    async (params) => toMcpResponse(await loggedPriceHistory(params))
  );

  // 10. track_price
  server.tool(
    "track_price",
    "Track a flight route over time in the price tracker database. Records current price and monitors price fluctuations.",
    trackPriceSchema.shape,
    async (params) => toMcpResponse(await loggedTrackPrice(params))
  );

  // 11. list_tracked_routes
  server.tool(
    "list_tracked_routes",
    "List all actively tracked flight routes, along with lowest, highest, and latest observed fares.",
    listTrackedRoutesSchema.shape,
    async (params) => toMcpResponse(await loggedListTrackedRoutes(params))
  );

  // 12. lookup_airport
  server.tool(
    "lookup_airport",
    "Look up airport IATA codes, cities, and countries across 8,800+ worldwide commercial airports.",
    lookupAirportSchema.shape,
    async (params) => toMcpResponse(await loggedLookupAirport(params))
  );

  // 13. find_nearby_airports
  server.tool(
    "find_nearby_airports",
    "Find alternative commercial airports within a given radius (km) of any reference airport using Great-Circle distance.",
    nearbyAirportsSchema.shape,
    async (params) => toMcpResponse(await loggedNearbyAirports(params))
  );

  // 14. get_flight_url
  server.tool(
    "get_flight_url",
    "Generate a shareable, clickable direct Google Flights deep-link preloaded with routes, dates, cabin class, and currency.",
    flightUrlSchema.shape,
    async (params) => toMcpResponse(await loggedFlightUrl(params))
  );

  // 15. analyze_layovers
  server.tool(
    "analyze_layovers",
    "Analyze layovers for connecting flights: reports connection duration, risk evaluation (tight connection vs comfortable window), and overnight transfers.",
    analyzeLayoversSchema.shape,
    async (params) => toMcpResponse(await loggedAnalyzeLayovers(params))
  );
};

const main = async (): Promise<void> => {
  const server = new McpServer({
    name: "google-flights-tim",
    version: "1.0.0",
  });

  registerAllTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("server_started", {
    name: "google-flights-tim",
    toolsCount: 15,
    timEnabled: true,
  });
};

main().catch((error) => {
  console.error("Fatal server error:", error);
  process.exit(1);
});
