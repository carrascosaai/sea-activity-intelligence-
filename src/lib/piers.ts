import piersData from "@/data/piers.json";
import { haversineKm } from "./geo";

export interface Pier {
  slug: string;
  name: string;
  kind: "breakwater" | "groyne";
  lat: number;
  lon: number;
}

/**
 * Espigones/diques reales de España (OpenStreetMap, ver
 * scripts/generate-piers.mjs) — puntos donde de verdad existe la
 * estructura, no una sugerencia genérica. Solo server-side.
 */
export const PIERS: Pier[] = piersData as Pier[];

export function piersNear(lat: number, lon: number, { radiusKm = 10, limit = 5 } = {}): (Pier & { distanceKm: number })[] {
  return PIERS.map((p) => ({ ...p, distanceKm: haversineKm(lat, lon, p.lat, p.lon) }))
    .filter((p) => p.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
