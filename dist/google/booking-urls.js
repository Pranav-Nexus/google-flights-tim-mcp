// Generates shareable Google Flights search and booking deep-links.
export const buildGoogleFlightsUrl = (origin, destination, departureDate, returnDate, cabinClass = "economy", currency = "USD") => {
    const orig = origin.toUpperCase().trim();
    const dest = destination.toUpperCase().trim();
    const base = "https://www.google.com/travel/flights";
    const queryParts = [`Flights to ${dest} from ${orig} on ${departureDate}`];
    if (returnDate) {
        queryParts.push(`through ${returnDate}`);
    }
    const params = new URLSearchParams({
        q: queryParts.join(" "),
        curr: currency,
    });
    if (cabinClass && cabinClass !== "economy") {
        params.set("cabin", cabinClass.toLowerCase());
    }
    return `${base}?${params.toString()}`;
};
export const buildFlightSpecificBookingUrl = (origin, destination, departureDate, returnDate, airlineCode, flightNumber, currency = "USD") => {
    const orig = origin.toUpperCase().trim();
    const dest = destination.toUpperCase().trim();
    const query = `${airlineCode} ${flightNumber} from ${orig} to ${dest} on ${departureDate}`;
    const params = new URLSearchParams({
        q: query,
        curr: currency,
    });
    if (returnDate) {
        params.append("ret", returnDate);
    }
    return `https://www.google.com/travel/flights?${params.toString()}`;
};
//# sourceMappingURL=booking-urls.js.map