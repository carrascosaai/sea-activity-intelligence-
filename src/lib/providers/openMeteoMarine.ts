import type { MarineHourPoint } from "../types";
import type { MarineProvider } from "./types";

const BASE_URL = "https://marine-api.open-meteo.com/v1/marine";

interface OpenMeteoMarineResponse {
  hourly?: {
    time: string[];
    wave_height: (number | null)[];
    wave_direction: (number | null)[];
    wave_period: (number | null)[];
    sea_surface_temperature: (number | null)[];
    swell_wave_height: (number | null)[];
    swell_wave_period: (number | null)[];
    swell_wave_peak_period: (number | null)[];
    wind_wave_height: (number | null)[];
  };
}

/**
 * Proveedor de datos marinos basado en Open-Meteo Marine API (gratuito, sin API key).
 * https://open-meteo.com/en/docs/marine-weather-api
 *
 * Además del estado del mar combinado (wave_*), Open-Meteo también expone sus
 * dos componentes físicos por separado: swell_wave_* (mar de fondo, olas
 * organizadas de origen lejano — lo que separa una buena ola de surf de una
 * mala, ver lib/scoring/profiles.ts) y wind_wave_* (mar de viento/chop
 * local). Se piden los tres porque cada uno tiene su uso — verificado
 * (sep. 2026) que swell_wave_peak_period, cuando está disponible, es el
 * periodo de pico real (no la media), la convención que usan los partes de
 * surf de verdad.
 */
export class OpenMeteoMarineProvider implements MarineProvider {
  async getHourly(lat: number, lon: number, dateISO: string): Promise<MarineHourPoint[]> {
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      hourly:
        "wave_height,wave_direction,wave_period,sea_surface_temperature,swell_wave_height,swell_wave_period,swell_wave_peak_period,wind_wave_height",
      timezone: "Europe/Madrid",
      start_date: dateISO,
      end_date: dateISO,
    });

    const res = await fetch(`${BASE_URL}?${params.toString()}`, {
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo marine API error: ${res.status}`);
    }

    const data: OpenMeteoMarineResponse = await res.json();
    if (!data.hourly) return [];

    const { hourly } = data;
    return hourly.time.map((time, i) => ({
      time,
      waveHeightM: hourly.wave_height[i] ?? null,
      waveDirectionDeg: hourly.wave_direction[i] ?? null,
      wavePeriodS: hourly.wave_period[i] ?? null,
      waterTempC: hourly.sea_surface_temperature[i] ?? null,
      swellWaveHeightM: hourly.swell_wave_height?.[i] ?? null,
      // Prioriza el periodo de pico real; si no está disponible en ese
      // instante (pasa incluso con swell presente), cae al periodo medio.
      swellWavePeriodS: hourly.swell_wave_peak_period?.[i] ?? hourly.swell_wave_period?.[i] ?? null,
      windWaveHeightM: hourly.wind_wave_height?.[i] ?? null,
    }));
  }
}
