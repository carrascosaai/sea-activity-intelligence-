export interface MoonPhaseInfo {
  illuminationPct: number;
  phaseName: string;
  emoji: string;
  highSolunarActivity: boolean;
}

const SYNODIC_MONTH_DAYS = 29.53058867; // duración real del mes lunar (nueva a nueva)
// Referencia real de luna nueva conocida: 6 de enero de 2000, 18:14 UTC.
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

/**
 * Fase lunar real para una fecha dada — cálculo astronómico puro (periodo
 * sinódico real de la Luna), sin ninguna API externa, así que nunca falla ni
 * tiene límite de peticiones. Es una aproximación (no de precisión de
 * efeméride profesional), suficiente para saber si es luna nueva/llena o
 * intermedia, que es lo único que necesita la teoría solunar.
 *
 * La teoría solunar en sí (más actividad de peces en luna nueva/llena, por
 * las mareas vivas que provoca la mayor alineación gravitatoria) es
 * tradición pesquera real y muy extendida, pero NO está demostrada
 * científicamente de forma concluyente — se presenta como tal, no como un
 * hecho probado.
 */
export function getMoonPhase(date: Date): MoonPhaseInfo {
  const daysSinceNew = (date.getTime() - KNOWN_NEW_MOON_UTC) / 86_400_000;
  const age = ((daysSinceNew % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;
  const fraction = age / SYNODIC_MONTH_DAYS; // 0 = luna nueva, 0.5 = luna llena

  const illuminationPct = Math.round(((1 - Math.cos(2 * Math.PI * fraction)) / 2) * 100);

  let phaseName: string;
  let emoji: string;
  if (fraction < 0.03 || fraction > 0.97) {
    phaseName = "Luna nueva";
    emoji = "🌑";
  } else if (fraction < 0.22) {
    phaseName = "Luna creciente";
    emoji = "🌒";
  } else if (fraction < 0.28) {
    phaseName = "Cuarto creciente";
    emoji = "🌓";
  } else if (fraction < 0.47) {
    phaseName = "Gibosa creciente";
    emoji = "🌔";
  } else if (fraction < 0.53) {
    phaseName = "Luna llena";
    emoji = "🌕";
  } else if (fraction < 0.72) {
    phaseName = "Gibosa menguante";
    emoji = "🌖";
  } else if (fraction < 0.78) {
    phaseName = "Cuarto menguante";
    emoji = "🌗";
  } else {
    phaseName = "Luna menguante";
    emoji = "🌘";
  }

  const highSolunarActivity = fraction < 0.05 || fraction > 0.95 || (fraction > 0.45 && fraction < 0.55);

  return { illuminationPct, phaseName, emoji, highSolunarActivity };
}
