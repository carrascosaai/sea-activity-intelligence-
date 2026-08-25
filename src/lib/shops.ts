import shopsData from "@/data/shops.json";
import { haversineKm } from "./geo";
import type { ActivityId } from "./types";

export interface Shop {
  slug: string;
  name: string;
  lat: number;
  lon: number;
  activities: ActivityId[];
  phone: string | null;
  website: string | null;
  openingHours: string | null;
}

/**
 * Tiendas/centros de deportes acuáticos reales de España, generados desde
 * OpenStreetMap (ver scripts/generate-shops.mjs) — igual que el dataset de
 * playas, en build-time, no en cada request. Solo se usa server-side (no se
 * manda al cliente entero, ver componentes que lo consumen).
 */
export const SHOPS: Shop[] = shopsData as Shop[];

/** Enlace a la ficha real de la tienda en Google Maps (sus valoraciones de verdad). */
export function googleMapsSearchUrl(shop: Shop): string {
  const query = encodeURIComponent(`${shop.name} ${shop.lat},${shop.lon}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Tiendas cerca de un punto que ofrecen una actividad concreta. Filtro
 * estricto a propósito: mostrar una tienda de buceo como si alquilara tablas
 * de kite sería engañoso, aunque esté cerca. Si no hay ninguna, se devuelve
 * vacío — mejor no mostrar nada que mostrar algo que no encaja.
 */
export function shopsNear(
  lat: number,
  lon: number,
  { radiusKm = 12, limit = 6, activityId }: { radiusKm?: number; limit?: number; activityId?: ActivityId } = {}
): (Shop & { distanceKm: number })[] {
  const candidates = activityId ? SHOPS.filter((s) => s.activities.includes(activityId)) : SHOPS;
  return candidates
    .map((s) => ({ ...s, distanceKm: haversineKm(lat, lon, s.lat, s.lon) }))
    .filter((s) => s.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
