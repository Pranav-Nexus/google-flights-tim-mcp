// Generates shareable Google Flights search and booking deep-links.

export const buildGoogleFlightsUrl = (
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string | null,
  cabinClass: string = "economy",
  currency: string = "USD"
): string => {
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

export const buildFlightSpecificBookingUrl = (
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string | null,
  airlineCode: string,
  flightNumber: string,
  currency: string = "USD"
): string => {
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
