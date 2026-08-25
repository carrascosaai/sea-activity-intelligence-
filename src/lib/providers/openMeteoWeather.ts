import type { WeatherHourPoint } from "../types";
import type { WeatherProvider } from "./types";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

interface OpenMeteoWeatherResponse {
  hourly?: {
    time: string[];
    temperature_2m: (number | null)[];
    precipitation_probability: (number | null)[];
    precipitation: (number | null)[];
    weather_code: (number | null)[];
    wind_speed_10m: (number | null)[];
    wind_direction_10m: (number | null)[];
    visibility: (number | null)[];
  };
}

/**
 * Proveedor meteorológico basado en Open-Meteo (gratuito, sin API key).
 * https://open-meteo.com/en/docs
 */
export class OpenMeteoWeatherProvider implements WeatherProvider {
  async getHourly(lat: number, lon: number, dateISO: string): Promise<WeatherHourPoint[]> {
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      hourly:
        "temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,visibility",
      timezone: "Europe/Madrid",
      start_date: dateISO,
      end_date: dateISO,
    });

    const res = await fetch(`${BASE_URL}?${params.toString()}`, {
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo weather API error: ${res.status}`);
    }

    const data: OpenMeteoWeatherResponse = await res.json();
    if (!data.hourly) return [];

    const { hourly } = data;
    return hourly.time.map((time, i) => ({
      time,
      airTempC: hourly.temperature_2m[i] ?? null,
      windSpeedKmh: hourly.wind_speed_10m[i] ?? null,
      windDirectionDeg: hourly.wind_direction_10m[i] ?? null,
      precipitationProbabilityPct: hourly.precipitation_probability[i] ?? null,
      precipitationMm: hourly.precipitation[i] ?? null,
      weatherCode: hourly.weather_code[i] ?? null,
      visibilityM: hourly.visibility[i] ?? null,
    }));
  }
}
