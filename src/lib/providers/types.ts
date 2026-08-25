import type { MarineHourPoint, TideInfo, VisibilityInfo, WeatherHourPoint } from "../types";

/**
 * Capa de abstracción de proveedores de datos (ver README.md, sección Arquitectura).
 * La app nunca debe llamar directamente a la API de un proveedor concreto fuera de
 * su implementación — así se puede sustituir Open-Meteo por otro proveedor
 * (StormGlass, AEMET, Puertos del Estado...) sin tocar el motor de scoring ni la UI.
 */
export interface WeatherProvider {
  getHourly(lat: number, lon: number, dateISO: string): Promise<WeatherHourPoint[]>;
}

export interface MarineProvider {
  getHourly(lat: number, lon: number, dateISO: string): Promise<MarineHourPoint[]>;
}

export interface TideProvider {
  getInfo(lat: number, lon: number, dateISO: string): Promise<TideInfo | null>;
}

/** Claridad del agua (proxy de visibilidad submarina) — ver providers/noaaVisibility.ts. */
export interface VisibilityProvider {
  getInfo(lat: number, lon: number): Promise<VisibilityInfo>;
}
