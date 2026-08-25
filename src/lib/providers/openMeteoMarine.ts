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
  };
}

/**
 * Proveedor de datos marinos basado en Open-Meteo Marine API (gratuito, sin API key).
 * https://open-meteo.com/en/docs/marine-weather-api
 */
export class OpenMeteoMarineProvider implements MarineProvider {
  async getHourly(lat: number, lon: number, dateISO: string): Promise<MarineHourPoint[]> {
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      hourly: "wave_height,wave_direction,wave_period,sea_surface_temperature",
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
    }));
  }
}
