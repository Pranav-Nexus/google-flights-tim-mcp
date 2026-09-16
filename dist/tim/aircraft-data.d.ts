export type AircraftEmissionsProfile = {
    readonly modelPattern: RegExp;
    readonly name: string;
    readonly fuelGramsPerPaxKm: number;
    readonly generation: "next-gen" | "current" | "legacy";
};
export declare const JET_A_CO2_PER_GRAM_FUEL = 3.16;
export declare const AIRCRAFT_PROFILES: readonly AircraftEmissionsProfile[];
export declare const DEFAULT_AIRCRAFT_FUEL_BURN = 31;
export declare const resolveAircraftProfile: (aircraftName: string | null | undefined) => AircraftEmissionsProfile | null;
//# sourceMappingURL=aircraft-data.d.ts.map