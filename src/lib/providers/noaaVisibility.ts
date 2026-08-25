import type { VisibilityInfo, WaterClarityLabel } from "../types";
import type { VisibilityProvider } from "./types";

/**
 * Proveedor de claridad del agua a partir de Kd490 (coeficiente de atenuación
 * de luz a 490nm), un producto de color del océano por satélite servido por
 * NOAA CoastWatch vía ERDDAP — gratuito, sin API key, cobertura mundial a
 * 2km, "gap-filled" (DINEOF) para minimizar huecos por nubes.
 * https://coastwatch.pfeg.noaa.gov/erddap/griddap/noaacwNPPN20S3AkdSCIDINEOF2kmDaily.html
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

export class NoaaVisibilityProvider implements VisibilityProvider {
  async getInfo(lat: number, lon: number): Promise<VisibilityInfo> {
    const query = `kd_490[(last)][(0.0)][(${lat.toFixed(4)})][(${lon.toFixed(4)})]`;
    // NOAA bloquea (403) peticiones sin User-Agent reconocible.
    const res = await fetch(`${ERDDAP_URL}?${query}`, {
      headers: { "User-Agent": "SeaActivityIntelligence/1.0" },
      next: { revalidate: 21600 },
    });

    if (!res.ok) {
      return { available: false, reason: "El servicio de claridad del agua no respondió" };
    }

    const data = await res.json();
    const row: [string, number, number, number, number | null] | undefined = data?.table?.rows?.[0];
    const kd490 = row?.[4];
    const observedDateISO = row?.[0];

    if (kd490 == null || !observedDateISO) {
      return { available: false, reason: "Sin lectura de satélite disponible para esta zona (nubes o costa muy cercana)" };
    }

    const observedDate = new Date(observedDateISO);
    const daysOld = Math.max(0, Math.round((Date.now() - observedDate.getTime()) / 86_400_000));
    const { label, rangeLabel } = classify(kd490);

    return {
      available: true,
      kd490,
      label,
      rangeLabel,
      observedDateISO,
      daysOld,
    };
  }
}
