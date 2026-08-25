import beachesData from "@/data/beaches.json";
import { haversineKm } from "./geo";
import type { Location } from "./types";

/**
 * Cobertura nacional: ~3.600 playas de España generadas desde datos reales de
 * OpenStreetMap (natural=beach) — ver scripts/generate-beaches.mjs. Se genera
 * en build-time, no se consulta Overpass en producción (ver README,
 * "Escalabilidad").
 */
export const LOCATIONS: Location[] = beachesData as Location[];

const BY_SLUG = new Map(LOCATIONS.map((l) => [l.slug, l]));

export function getLocationBySlug(slug: string): Location | undefined {
  return BY_SLUG.get(slug);
}

export const POPULAR_LOCATIONS: Location[] = LOCATIONS.filter((l) => l.popular);

export const REGIONS: string[] = [...new Set(LOCATIONS.map((l) => l.region))].sort((a, b) =>
  a.localeCompare(b, "es")
);

/** Quita acentos/diacríticos para que "malaga" encuentre "Málaga". */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Texto de búsqueda normalizado precalculado una vez (no en cada tecla).
const SEARCH_TEXT = new Map<string, string>(
  LOCATIONS.map((loc) => [loc.slug, normalize(`${loc.name} ${loc.municipality ?? ""} ${loc.province} ${loc.region}`)])
);

/**
 * Búsqueda simple por nombre de playa, municipio o provincia (sin distinguir
 * acentos). Pensada para listas de miles de elementos: SIEMPRE limitar el
 * número de resultados renderizados en la UI (ver components/LocationSearch.tsx)
 * — nunca volcar las 3.600 playas al DOM de golpe.
 */
export function searchLocations(query: string, limit = 25): Location[] {
  const q = normalize(query.trim());
  if (q.length < 2) return POPULAR_LOCATIONS.slice(0, limit);

  const results: Location[] = [];
  for (const loc of LOCATIONS) {
    if (SEARCH_TEXT.get(loc.slug)!.includes(q)) {
      results.push(loc);
      if (results.length >= limit) break;
    }
  }
  return results;
}

export function locationsInBounds(
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
  limit = 80
): Location[] {
  const inBounds = LOCATIONS.filter(
    (l) => l.lat >= bounds.minLat && l.lat <= bounds.maxLat && l.lon >= bounds.minLon && l.lon <= bounds.maxLon
  );
  if (inBounds.length <= limit) return inBounds;
  // Si hay demasiadas en el viewport, prioriza destacadas y luego el resto hasta el límite.
  const popular = inBounds.filter((l) => l.popular);
  const rest = inBounds.filter((l) => !l.popular);
  return [...popular, ...rest].slice(0, limit);
}

/**
 * Playas más cercanas a un punto, ordenadas por distancia. Si hay menos de
 * `minResults` dentro del radio inicial, lo va ampliando (España tiene zonas
 * de costa con playas muy dispersas — un radio fijo pequeño dejaría a esos
 * usuarios sin ningún resultado).
 */
export function locationsNear(
  lat: number,
  lon: number,
  { initialRadiusKm = 20, maxRadiusKm = 100, minResults = 5, limit = 25 } = {}
): (Location & { distanceKm: number })[] {
  let radius = initialRadiusKm;
  let withDistance: (Location & { distanceKm: number })[] = [];

  while (radius <= maxRadiusKm) {
    withDistance = LOCATIONS.map((l) => ({ ...l, distanceKm: haversineKm(lat, lon, l.lat, l.lon) })).filter(
      (l) => l.distanceKm <= radius
    );
    if (withDistance.length >= minResults) break;
    radius *= 2;
  }

  return withDistance.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, limit);
}

export function displayName(location: Location): string {
  return location.municipality && location.municipality !== location.name
    ? `${location.name} — ${location.municipality}`
    : location.name;
}
