// Aircraft fuel efficiency and emissions characteristics.
// Benchmarked against ICAO Engine Emissions Databank and ICCT Airline Fuel Efficiency Metrics.
// 1 gram of Jet-A fuel combustion emits 3.16 grams of CO2
export const JET_A_CO2_PER_GRAM_FUEL = 3.16;
export const AIRCRAFT_PROFILES = [
    // Ultra-efficient next-generation narrow-body (22-25 g fuel/pax-km)
    {
        modelPattern: /a32[01]neo|a20n|a21n|320n|321n/i,
        name: "Airbus A320neo/A321neo Family",
        fuelGramsPerPaxKm: 23.0,
        generation: "next-gen",
    },
    {
        modelPattern: /737\s*max|73[789]m|b38m|b39m|max\s*8|max\s*9/i,
        name: "Boeing 737 MAX Family",
        fuelGramsPerPaxKm: 23.5,
        generation: "next-gen",
    },
    {
        modelPattern: /a220|bcs[13]/i,
        name: "Airbus A220 Family",
        fuelGramsPerPaxKm: 24.0,
        generation: "next-gen",
    },
    // Ultra-efficient next-generation wide-body (25-28 g fuel/pax-km)
    {
        modelPattern: /a350|a359|a35k/i,
        name: "Airbus A350 Family",
        fuelGramsPerPaxKm: 26.0,
        generation: "next-gen",
    },
    {
        modelPattern: /787|b788|b789|b78x|dreamliner/i,
        name: "Boeing 787 Dreamliner Family",
        fuelGramsPerPaxKm: 26.8,
        generation: "next-gen",
    },
    {
        modelPattern: /a330neo|a339|a338/i,
        name: "Airbus A330neo",
        fuelGramsPerPaxKm: 27.2,
        generation: "next-gen",
    },
    // Current generation narrow-body (30-34 g fuel/pax-km)
    {
        modelPattern: /a319|a320|a321|320|321/i,
        name: "Airbus A320ceo Family",
        fuelGramsPerPaxKm: 31.5,
        generation: "current",
    },
    {
        modelPattern: /737-?[789]00|b738|b739|738|739/i,
        name: "Boeing 737 Next-Gen",
        fuelGramsPerPaxKm: 32.5,
        generation: "current",
    },
    // Current generation wide-body (34-38 g fuel/pax-km)
    {
        modelPattern: /a330-?[23]00|a332|a333|332|333/i,
        name: "Airbus A330 Family",
        fuelGramsPerPaxKm: 34.5,
        generation: "current",
    },
    {
        modelPattern: /777-?300er|b77w|77w/i,
        name: "Boeing 777-300ER",
        fuelGramsPerPaxKm: 35.8,
        generation: "current",
    },
    {
        modelPattern: /777|b772|b77l/i,
        name: "Boeing 777 Family",
        fuelGramsPerPaxKm: 37.0,
        generation: "current",
    },
    // Regional turboprops (efficient on short hops < 600km)
    {
        modelPattern: /atr\s*72|at76|at72/i,
        name: "ATR 72 Turboprop",
        fuelGramsPerPaxKm: 28.0,
        generation: "current",
    },
    {
        modelPattern: /q400|dh8d|dash\s*8/i,
        name: "De Havilland Dash 8 Q400",
        fuelGramsPerPaxKm: 29.5,
        generation: "current",
    },
    // Regional jets (36-40 g fuel/pax-km)
    {
        modelPattern: /e175|e190|e195|e-?jet/i,
        name: "Embraer E-Jets",
        fuelGramsPerPaxKm: 36.5,
        generation: "current",
    },
    {
        modelPattern: /crj|cl-600/i,
        name: "Bombardier CRJ Series",
        fuelGramsPerPaxKm: 38.0,
        generation: "current",
    },
    // Legacy heavy 4-engine wide-bodies (42-48 g fuel/pax-km)
    {
        modelPattern: /a380|a388/i,
        name: "Airbus A380-800",
        fuelGramsPerPaxKm: 42.0,
        generation: "legacy",
    },
    {
        modelPattern: /747|b744|b748/i,
        name: "Boeing 747 Queen of the Skies",
        fuelGramsPerPaxKm: 44.5,
        generation: "legacy",
    },
];
export const DEFAULT_AIRCRAFT_FUEL_BURN = 31.0; // g fuel / pax-km
export const resolveAircraftProfile = (aircraftName) => {
    if (!aircraftName)
        return null;
    const match = AIRCRAFT_PROFILES.find((p) => p.modelPattern.test(aircraftName));
    return match ?? null;
};
//# sourceMappingURL=aircraft-data.js.map