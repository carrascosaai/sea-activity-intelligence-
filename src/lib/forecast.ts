import { after } from "next/server";
import { OpenMeteoMarineProvider } from "./providers/openMeteoMarine";
import { OpenMeteoWeatherProvider } from "./providers/openMeteoWeather";
import { NullTideProvider } from "./providers/tide";
import { readForecastCache, writeForecastCache } from "./cache/forecastCache";
import type { ConditionSnapshot, Location } from "./types";

const weatherProvider = new OpenMeteoWeatherProvider();
const marineProvider = new OpenMeteoMarineProvider();
const tideProvider = new NullTideProvider();

const THUNDERSTORM_CODES = new Set([95, 96, 99]);

async function fetchLiveSnapshots(location: Location, dateISO: string): Promise<ConditionSnapshot[]> {
  const [weatherHours, marineHours] = await Promise.all([
    weatherProvider.getHourly(location.lat, location.lon, dateISO),
    marineProvider.getHourly(location.lat, location.lon, dateISO),
  ]);

  const marineByTime = new Map(marineHours.map((h) => [h.time, h]));

  const snapshots: ConditionSnapshot[] = [];
  for (const w of weatherHours) {
    const m = marineByTime.get(w.time);
    if (!m) continue; // solo horas con datos completos de ambos proveedores
    if (
      w.windSpeedKmh == null ||
      w.airTempC == null ||
      m.waveHeightM == null ||
      m.wavePeriodS == null ||
      m.waterTempC == null
    ) {
      continue;
    }
    snapshots.push({
      time: w.time,
      windSpeedKmh: w.windSpeedKmh,
      windDirectionDeg: w.windDirectionDeg,
      waveHeightM: m.waveHeightM,
      waveDirectionDeg: m.waveDirectionDeg,
      wavePeriodS: m.wavePeriodS,
      waterTempC: m.waterTempC,
      airTempC: w.airTempC,
      precipitationProbabilityPct: w.precipitationProbabilityPct ?? 0,
      precipitationMm: w.precipitationMm ?? 0,
      weatherCode: w.weatherCode ?? 0,
      visibilityM: w.visibilityM,
      isThunderstorm: w.weatherCode != null && THUNDERSTORM_CODES.has(w.weatherCode),
    });
  }

  return snapshots;
}

/**
 * Combina viento/lluvia (WeatherProvider) y oleaje/temp. agua (MarineProvider)
 * en snapshots horarios para una ubicación y fecha. Si algún proveedor falla,
 * propaga el error — nunca se rellenan datos inventados (ver brief, punto 12).
 *
 * Primero mira la caché de Supabase (rellenada por cron para las playas más
 * visitadas, y por escritura diferida para cualquier otra que se consulte
 * en vivo — ver lib/cache/forecastCache.ts). Si no hay caché válida (o
 * Supabase no está configurado), pide los datos en vivo como siempre y deja
 * la respuesta en caché para la próxima vez, sin retrasar la respuesta
 * actual (`after`, se ejecuta cuando la petición ya ha respondido).
 */
export async function getDailySnapshots(location: Location, dateISO: string): Promise<ConditionSnapshot[]> {
  const cached = await readForecastCache(location.slug, dateISO);
  if (cached) return cached;

  const snapshots = await fetchLiveSnapshots(location, dateISO);

  if (snapshots.length > 0) {
    after(() => writeForecastCache(location.slug, dateISO, snapshots));
  }

  return snapshots;
}

export async function getTideInfo(location: Location, dateISO: string) {
  return tideProvider.getInfo(location.lat, location.lon, dateISO);
}
