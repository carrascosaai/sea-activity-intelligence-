import type { Location } from "./types";

export type SeaBasin = "cantabrico" | "atlantico-galicia" | "atlantico-sur" | "mediterraneo" | "canarias";

const CANTABRICO_REGIONS = new Set(["Asturias", "Cantabria", "País Vasco"]);
const MEDITERRANEO_REGIONS = new Set([
  "Cataluña",
  "Comunidad Valenciana",
  "Región de Murcia",
  "Islas Baleares",
  "Ceuta",
  "Melilla",
]);
const INLAND_REGIONS = new Set([
  "Aragón",
  "Castilla y León",
  "Castilla-La Mancha",
  "Comunidad de Madrid",
  "Extremadura",
  "La Rioja",
  "Comunidad Foral de Navarra",
]);

/**
 * Cuenca marina real de una playa, a partir de su región y (para Andalucía,
 * que tiene costa en ambos mares) su longitud respecto al Estrecho —
 * frontera aproximada en Tarifa. No es una medición por playa, es geografía
 * conocida: sirve para dar conocimiento pesquero general de la zona
 * (ver lib/fishing.ts), nunca un dato específico de esa playa exacta.
 * `null` para playas de interior (fuera de alcance, ver AGENTS.md).
 */
export function seaBasinForLocation(loc: Location): SeaBasin | null {
  if (INLAND_REGIONS.has(loc.region)) return null;
  if (loc.region === "Canarias") return "canarias";
  if (loc.region === "Galicia") return "atlantico-galicia";
  if (CANTABRICO_REGIONS.has(loc.region)) return "cantabrico";
  if (MEDITERRANEO_REGIONS.has(loc.region)) return "mediterraneo";
  if (loc.region === "Andalucía") return loc.lon < -5.35 ? "atlantico-sur" : "mediterraneo";
  return null;
}
