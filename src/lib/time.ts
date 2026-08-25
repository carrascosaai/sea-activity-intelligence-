const MADRID_TZ = "Europe/Madrid";

/** Fecha de "hoy" en Europe/Madrid, formato YYYY-MM-DD. */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: MADRID_TZ }).format(new Date());
}

export function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return new Intl.DateTimeFormat("en-CA", { timeZone: MADRID_TZ }).format(d);
}

/**
 * Tope del selector de fecha — comprobado empíricamente comparando los
 * VALORES devueltos (no solo que la petición no diera error, que fue un
 * fallo de verificación real que cometí la primera vez: la API responde
 * 200 OK con la estructura completa incluso cuando ya no tiene dato y
 * devuelve `null` en cada campo). Con las 4 variables marinas que pide la
 * app (oleaje, dirección, periodo, temperatura del agua) juntas, tanto en
 * Fuengirola (Mediterráneo) como en Gijón (Atlántico) el último día con
 * datos reales es el 8; el día 9 ya viene todo `null`. Un mes vista es
 * literalmente imposible con datos reales — ninguna fuente meteorológica
 * seria llega tan lejos.
 */
export function maxForecastDateISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return new Intl.DateTimeFormat("en-CA", { timeZone: MADRID_TZ }).format(d);
}

/**
 * A partir de qué día la previsión, aunque exista el dato (ver
 * maxForecastDateISO), pierde fiabilidad de forma notable — no es un límite
 * de datos, es meteorología: día 1-3 razonablemente fiable, día 4 en
 * adelante cada vez más incierto. Se usa para avisar en la UI, no para
 * ocultar nada — mejor saber algo orientativo que no saber nada.
 */
export function isLowConfidenceDate(dateISO: string): boolean {
  const days = daysFromToday(dateISO);
  return days >= 4;
}

export function daysFromToday(dateISO: string): number {
  const [y, m, d] = dateISO.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const [ty, tm, td] = todayISO().split("-").map(Number);
  const today = Date.UTC(ty, tm - 1, td);
  return Math.round((target - today) / 86_400_000);
}

/** Hora actual en Europe/Madrid, 0-23. */
export function currentHourMadrid(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: MADRID_TZ,
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hourPart = parts.find((p) => p.type === "hour");
  return hourPart ? parseInt(hourPart.value, 10) % 24 : new Date().getHours();
}

/** Formatea un ISO "YYYY-MM-DDTHH:mm" (hora local Madrid, tal y como la devuelve Open-Meteo) a "HH:mm". */
export function formatHourLabel(isoLocal: string): string {
  const timePart = isoLocal.split("T")[1];
  return timePart ? timePart.slice(0, 5) : isoLocal;
}

export function hourFromISO(isoLocal: string): number {
  const timePart = isoLocal.split("T")[1];
  return timePart ? parseInt(timePart.slice(0, 2), 10) : 0;
}

export function formatDateLabel(dateISO: string): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: MADRID_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}
