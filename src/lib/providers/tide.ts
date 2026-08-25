import type { TideInfo } from "../types";
import type { TideProvider } from "./types";

/**
 * No hay proveedor de mareas conectado todavía (Open-Meteo no ofrece mareas).
 * Se mantiene la interfaz TideProvider para poder conectar en el futuro un
 * proveedor real (p. ej. Puertos del Estado / IEO) sin tocar el motor de
 * scoring — devuelve explícitamente "no disponible" en vez de inventar datos.
 */
export class NullTideProvider implements TideProvider {
  async getInfo(_lat: number, _lon: number, _dateISO: string): Promise<TideInfo> {
    return { available: false, reason: "Proveedor de mareas no conectado todavía" };
  }
}
