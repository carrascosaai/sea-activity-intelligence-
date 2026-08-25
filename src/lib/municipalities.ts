import { LOCATIONS } from "./locations";
import type { Location } from "./types";

/** Igual que el slugify de scripts/generate-beaches.mjs, para que las URLs sean coherentes. */
function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface Municipality {
  slug: string;
  name: string;
  province: string;
  region: string;
  beaches: Location[];
}

const byMunicipality = new Map<string, Municipality>();
for (const loc of LOCATIONS) {
  if (!loc.municipality) continue;
  const slug = slugify(loc.municipality);
  const existing = byMunicipality.get(slug);
  if (existing) {
    existing.beaches.push(loc);
  } else {
    byMunicipality.set(slug, { slug, name: loc.municipality, province: loc.province, region: loc.region, beaches: [loc] });
  }
}

/** Municipios con al menos 2 playas — descarta hamlets con una única playa
 * fluvial suelta, que no son un destino real de búsqueda ("surf en X"). */
export const MUNICIPALITIES: Municipality[] = [...byMunicipality.values()]
  .filter((m) => m.beaches.length >= 2)
  .sort((a, b) => b.beaches.length - a.beaches.length);

const MUNICIPALITY_BY_SLUG = new Map(MUNICIPALITIES.map((m) => [m.slug, m]));

export function getMunicipalityBySlug(slug: string): Municipality | undefined {
  return MUNICIPALITY_BY_SLUG.get(slug);
}

/**
 * Actividades con volumen de búsqueda real ("surf Fuengirola", "paddle surf
 * Málaga"...) — deliberadamente un subconjunto de las 20, no todas: una
 * página "/coasteering/pueblo-de-40-habitantes" no la busca nadie, generar
 * miles de páginas así es justo lo que NO hay que hacer.
 */
export const SEO_ACTIVITIES = [
  "surf",
  "paddle-surf",
  "kayak",
  "kitesurf",
  "windsurf",
  "buceo",
  "snorkel",
  "bodyboard",
] as const;

/** Los municipios con más playas primero — para el sitemap.xml (no se
 * pre-renderizan en el build, ver app/[actividad]/[ciudad]/page.tsx, pero sí
 * conviene decirle a los buscadores cuáles son las combinaciones más
 * relevantes en vez de esperar a que las descubran solas). */
export const TOP_MUNICIPALITIES_FOR_SITEMAP = MUNICIPALITIES.slice(0, 40);
