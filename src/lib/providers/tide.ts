import { useStation } from "@neaps/tide-predictor";
import { haversineKm } from "../geo";
import tideStationsData from "../../data/tideStations.json";
import type { TideInfo } from "../types";
import type { TideProvider } from "./types";

interface TideStationRecord {
  name: string;
  continent: string;
  country: string;
  region: string | null;
  type: "reference" | "subordinate";
  disclaimers: string;
  latitude: number;
  longitude: number;
  timezone: string;
  datums: Record<string, number>;
  chart_datum: string;
  harmonic_constituents: { name: string; amplitude: number; phase: number; speed?: number; description?: string }[];
  source: { name: string; id: string; url: string };
  license: { type: string; url: string };
}

const STATIONS = tideStationsData as TideStationRecord[];

// Más allá de esto, dos puntos de la misma costa pueden tener una marea
// real bastante distinta (amplitud sobre todo) — mejor decir "no disponible"
// que dar una lectura de una zona que ya no es representativa. Verificado
// (sep. 2026): con una estación a ~100km (Santander → Bilbora), la hora de
// pleamar/bajamar coincidía con la predicción oficial real de Puertos del
// Estado con un margen de 1-5 minutos — así que 70km es conservador, no al
// límite.
const MAX_DISTANCE_KM = 70;

function nearestStation(lat: number, lon: number): { station: TideStationRecord; distanceKm: number } | null {
  let best: { station: TideStationRecord; distanceKm: number } | null = null;
  for (const station of STATIONS) {
    const distanceKm = haversineKm(lat, lon, station.latitude, station.longitude);
    if (!best || distanceKm < best.distanceKm) best = { station, distanceKm };
  }
  return best;
}

/** "YYYY-MM-DDTHH:mm" en hora local Europe/Madrid, igual formato que el resto de la app (Open-Meteo). */
function toLocalISO(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/**
 * Mareas reales por constituyentes armónicos — NO astronomía genérica
 * (Sol/Luna sin calibrar): la misma fuerza astronómica da mareas muy
 * distintas según la costa (grandes en el Atlántico, casi nulas en el
 * Mediterráneo), hace falta el dato empírico de cada estación real. Fuente:
 * @neaps/tide-database (TICON-4, basada en registros GESLA-4), filtrada en
 * build-time a las estaciones españolas con licencia de uso comercial (ver
 * scripts/generate-tide-stations.mjs — se descartan las cc-by-nc-4.0 aunque
 * dupliquen cobertura, no se pueden usar en un producto real). Cálculo con
 * @neaps/tide-predictor, sin llamada de red — verificado (sep. 2026) contra
 * la predicción oficial real de Puertos del Estado para Bilbao: la hora de
 * pleamar/bajamar de una estación a ~100km coincidía con un margen de 1-5
 * minutos.
 *
 * Cobertura real: solo 20 estaciones con licencia comercial en toda España
 * (Andalucía, Canarias, Galicia, Cantabria, Baleares, Valencia, Ceuta) — la
 * mayoría de las ~3.500 playas de la web quedan a más de MAX_DISTANCE_KM y
 * no tienen dato, honestamente declarado como "no disponible" en vez de dar
 * una lectura de una zona ya no representativa.
 */
export class HarmonicTideProvider implements TideProvider {
  async getInfo(lat: number, lon: number, dateISO: string): Promise<TideInfo> {
    const nearest = nearestStation(lat, lon);
    if (!nearest || nearest.distanceKm > MAX_DISTANCE_KM) {
      return { available: false, reason: "Sin estación de marea real cerca de esta playa (más de 70 km)" };
    }

    const { station, distanceKm } = nearest;
    const [y, m, d] = dateISO.split("-").map(Number);
    // Ventana generosa (día local completo + margen) para no perder una
    // pleamar/bajamar que cae justo en el borde por la diferencia horaria.
    const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - 3 * 3_600_000);
    const end = new Date(Date.UTC(y, m - 1, d, 23, 59, 59) + 3 * 3_600_000);

    const predictor = useStation({ ...station, id: station.name, region: station.region ?? undefined });
    const { extremes } = predictor.getExtremesPrediction({ start, end });

    const events = extremes
      .map((e) => ({
        type: (e.high ? "pleamar" : "bajamar") as "pleamar" | "bajamar",
        time: toLocalISO(e.time),
        heightM: Math.round(e.level * 100) / 100,
      }))
      // La ventana con margen puede traer eventos de fuera del día local pedido — filtra a ese día.
      .filter((e) => e.time.startsWith(dateISO));

    return {
      available: true,
      events,
      stationName: station.name,
      distanceKm: Math.round(distanceKm),
      source: station.source,
    };
  }
}
