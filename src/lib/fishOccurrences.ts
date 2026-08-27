import occurrencesData from "@/data/fishOccurrences.json";
import { haversineKm } from "./geo";
import { getFishSpecies } from "./fishSpecies";

interface OccurrencePoint {
  speciesId: string;
  lat: number;
  lon: number;
}

const OCCURRENCES: OccurrencePoint[] = occurrencesData as OccurrencePoint[];

export interface NearbySpecies {
  id: string;
  commonName: string;
  bait: string;
  observationCount: number;
  nearestKm: number;
}

/**
 * Especies con observaciones REALES de biodiversidad (GBIF/iNaturalist) cerca
 * de un punto — a diferencia de la lista general por cuenca marina
 * (lib/fishing.ts), esto es específico de la zona exacta, con datos
 * verificables, no una lista genérica. Si no hay ninguna observación real
 * cerca, devuelve vacío — no se rellena con la lista general para no mezclar
 * "observado aquí de verdad" con "conocimiento general de la región".
 */
export function speciesNear(lat: number, lon: number, radiusKm = 20, limit = 8): NearbySpecies[] {
  const bySpecies = new Map<string, { count: number; nearestKm: number }>();

  for (const p of OCCURRENCES) {
    const dist = haversineKm(lat, lon, p.lat, p.lon);
    if (dist > radiusKm) continue;
    const existing = bySpecies.get(p.speciesId);
    if (existing) {
      existing.count += 1;
      existing.nearestKm = Math.min(existing.nearestKm, dist);
    } else {
      bySpecies.set(p.speciesId, { count: 1, nearestKm: dist });
    }
  }

  const results: NearbySpecies[] = [];
  for (const [speciesId, info] of bySpecies.entries()) {
    const species = getFishSpecies(speciesId);
    if (!species) continue;
    results.push({
      id: speciesId,
      commonName: species.commonName,
      bait: species.bait,
      observationCount: info.count,
      nearestKm: Math.round(info.nearestKm * 10) / 10,
    });
  }

  return results.sort((a, b) => b.observationCount - a.observationCount).slice(0, limit);
}
