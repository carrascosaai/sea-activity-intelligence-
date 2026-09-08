import type { VisibilityInfo, WaterClarityLabel } from "../types";
import type { VisibilityProvider } from "./types";
import { haversineKm } from "../geo";

/**
 * Proveedor de claridad del agua a partir de Kd490 (coeficiente de atenuación
 * de luz a 490nm), un producto de color del océano por satélite servido por
 * NOAA CoastWatch vía ERDDAP — gratuito, sin API key, cobertura mundial a
 * 2km, "gap-filled" (DINEOF) para minimizar huecos por nubes.
 * https://coastwatch.pfeg.noaa.gov/erddap/griddap/noaacwNPPN20S3AkdSCIDINEOF2kmDaily.html
 *
 * Alternativas investigadas (de nuevo, sep. 2026) para "una fuente mejor" y
 * descartadas — siguen sin encajar mejor que esta:
 * - Copernicus Marine Service SÍ tiene turbidez a más resolución (100m),
 *   pero su API (`copernicusmarine` CLI/Python) solo sirve subconjuntos como
 *   NetCDF/Zarr/CSV pensados para clientes Python con cuenta registrada —
 *   no hay un endpoint HTTP simple tipo "dame el valor en este punto" que
 *   encaje en un backend Next.js/TypeScript sin infraestructura adicional.
 * - NOAA CoastWatch SÍ tiene productos regionales a 750m ("Sector" ZY/UX/VX),
 *   pero son sectores de EE. UU. (costa este/oeste) — no cubren España.
 * La causa real de los fallos no era la fuente en sí, era pedir un único
 * píxel exacto: en el grid de 2km, cualquier cala estrecha o playa muy
 * pegada a tierra cae a menudo justo en un píxel contaminado por tierra
 * (`null`), aunque el píxel de al lado (a 2-4 km) sí tenga una lectura real
 * de mar abierto — verificado en directo con Playa Charco del Musgo
 * (Tenerife): el píxel exacto da `null`, pero un cuadro de ~6x11 km
 * alrededor tiene varias lecturas válidas a 2-5 km. Por eso ahora se pide
 * una pequeña caja alrededor del punto y se usa el píxel válido más cercano
 * en vez de solo el más próximo exacto (esté vacío o no) — misma fuente,
 * mismo endpoint, sin coste ni dependencia nueva, muchos menos "no
 * disponible" en la práctica.
 *
 * IMPORTANTE — límites reales de este dato (no ocultarlos en la UI):
 * - Es un proxy regional (turbidez/clorofila de la columna de agua vista
 *   desde satélite), NO una medición de visibilidad de un buceador. Se
 *   convierte a un rango orientativo con la fórmula empírica clásica
 *   profundidad_secchi ≈ 1.7 / Kd490 (Holmes 1970), que es una aproximación.
 * - Tiene retraso: normalmente el dato más reciente disponible es de hace
 *   1-2 semanas (revisita del satélite + procesado), no es "ahora mismo".
 * - Es menos fiable en aguas muy someras con fondo arenoso claro (la
 *   reflectancia del fondo puede sesgar la estimación) — calas y lagunas
 *   de aguas turquesas pueden salir peor puntuadas de lo que están en
 *   realidad. Por eso esto NO se resta de la puntuación 0-100: se muestra
 *   como información adicional para que el usuario decida.
 */

const ERDDAP_URL = "https://coastwatch.pfeg.noaa.gov/erddap/griddap/noaacwNPPN20S3AkdSCIDINEOF2kmDaily.json";

// Media distancia del cuadro de búsqueda alrededor del punto, en grados. El
// grid nativo es de ~2km (~0.0208º de latitud), así que 0.06º/0.08º cubre
// varios píxeles vecinos en cada dirección — suficiente para saltar un
// píxel de costa contaminado sin salirse de la misma zona costera.
const SEARCH_BOX_LAT_DEG = 0.06;
const SEARCH_BOX_LON_DEG = 0.08;
// Si el píxel válido más cercano queda más lejos que esto, ya no es "esta
// playa" de verdad — mejor decir que no hay dato que dar una lectura de una
// zona distinta.
const MAX_VALID_PIXEL_DISTANCE_KM = 12;

interface ClarityBucket {
  maxKd: number;
  label: WaterClarityLabel;
  rangeLabel: string;
}

// Umbrales derivados de profundidad_secchi = 1.7 / kd490.
const CLARITY_BUCKETS: ClarityBucket[] = [
  { maxKd: 0.085, label: "Excepcional", rangeLabel: "más de 20 m orientativos" },
  { maxKd: 0.1417, label: "Muy buena", rangeLabel: "12-20 m orientativos" },
  { maxKd: 0.2125, label: "Buena", rangeLabel: "8-12 m orientativos" },
  { maxKd: 0.425, label: "Moderada", rangeLabel: "4-8 m orientativos" },
  { maxKd: 0.85, label: "Reducida", rangeLabel: "2-4 m orientativos" },
  { maxKd: Infinity, label: "Baja", rangeLabel: "menos de 2 m orientativos" },
];

function classify(kd490: number): { label: WaterClarityLabel; rangeLabel: string } {
  const bucket = CLARITY_BUCKETS.find((b) => kd490 <= b.maxKd) ?? CLARITY_BUCKETS[CLARITY_BUCKETS.length - 1];
  return { label: bucket.label, rangeLabel: bucket.rangeLabel };
}

type ErddapRow = [string, number, number, number, number | null];

export class NoaaVisibilityProvider implements VisibilityProvider {
  async getInfo(lat: number, lon: number): Promise<VisibilityInfo> {
    const latMin = (lat - SEARCH_BOX_LAT_DEG).toFixed(4);
    const latMax = (lat + SEARCH_BOX_LAT_DEG).toFixed(4);
    const lonMin = (lon - SEARCH_BOX_LON_DEG).toFixed(4);
    const lonMax = (lon + SEARCH_BOX_LON_DEG).toFixed(4);
    const query = `kd_490[(last)][(0.0)][(${latMin}):(${latMax})][(${lonMin}):(${lonMax})]`;
    // NOAA bloquea (403) peticiones sin User-Agent reconocible.
    const res = await fetch(`${ERDDAP_URL}?${query}`, {
      headers: { "User-Agent": "SeaActivityIntelligence/1.0" },
      next: { revalidate: 21600 },
    });

    if (!res.ok) {
      return { available: false, reason: "El servicio de claridad del agua no respondió" };
    }

    const data = await res.json();
    const rows: ErddapRow[] | undefined = data?.table?.rows;
    if (!rows || rows.length === 0) {
      return { available: false, reason: "Sin lectura de satélite disponible para esta zona (nubes o costa muy cercana)" };
    }

    // De todos los píxeles del cuadro con lectura real (no null, ni el
    // propio ni los vecinos contaminados por tierra), el más cercano al
    // punto pedido.
    let best: { kd490: number; observedDateISO: string; distanceKm: number } | null = null;
    for (const [time, , pxLat, pxLon, kd490] of rows) {
      if (kd490 == null) continue;
      const distanceKm = haversineKm(lat, lon, pxLat, pxLon);
      if (!best || distanceKm < best.distanceKm) {
        best = { kd490, observedDateISO: time, distanceKm };
      }
    }

    if (!best || best.distanceKm > MAX_VALID_PIXEL_DISTANCE_KM) {
      return { available: false, reason: "Sin lectura de satélite disponible para esta zona (nubes o costa muy cercana)" };
    }

    const observedDate = new Date(best.observedDateISO);
    const daysOld = Math.max(0, Math.round((Date.now() - observedDate.getTime()) / 86_400_000));
    const { label, rangeLabel } = classify(best.kd490);

    return {
      available: true,
      kd490: best.kd490,
      label,
      rangeLabel,
      observedDateISO: best.observedDateISO,
      daysOld,
    };
  }
}
