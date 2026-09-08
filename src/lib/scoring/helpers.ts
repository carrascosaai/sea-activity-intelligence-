/**
 * value sube => peor. 0 penalización hasta `good`, penalización máxima desde `bad`.
 * Interpolación lineal entre medio.
 */
export function penaltyLinear(value: number, good: number, bad: number, maxPenalty: number): number {
  if (value <= good) return 0;
  if (value >= bad) return maxPenalty;
  const t = (value - good) / (bad - good);
  return t * maxPenalty;
}

/**
 * value baja => peor (p. ej. periodo de ola corto, temperatura baja).
 * 0 penalización desde `good` hacia arriba, penalización máxima en `bad` o menos.
 */
export function penaltyLinearInverse(value: number, good: number, bad: number, maxPenalty: number): number {
  if (value >= good) return 0;
  if (value <= bad) return maxPenalty;
  const t = (good - value) / (good - bad);
  return t * maxPenalty;
}

// Cuánto puede penalizar, como máximo, estar dentro del rango ideal pero
// lejos de su centro — nunca el maxPenalty completo (eso sigue siendo para
// estar fuera del rango de verdad), solo lo justo para que "dentro de lo
// ideal" no sea un escalón plano de 0 en todo el rango. Ver comentario de
// penaltyRange más abajo: es la corrección real a un problema real
// (feedback directo del usuario, sep. 2026 — un día con olas rideables
// pero picadas puntuaba 100, indistinguible de un día de verdad perfecto).
const IN_RANGE_PEAK_SHARE = 0.15;

/**
 * Penaliza cuando value cae fuera de un rango ideal [idealMin, idealMax],
 * con penalización máxima alcanzada en [hardMin, hardMax] o más allá.
 * Útil para oleaje de surf: ni muy plano ni muy grande.
 *
 * DENTRO del rango ideal ya NO es un plano de penalización 0 uniforme:
 * baja suavemente hacia el centro del rango, así que un valor justo en el
 * borde de "ideal" (aceptable, pero no lo mejor) puntúa un poco peor que
 * el centro exacto (lo mejor de verdad). Es una corrección real detectada
 * con datos reales, no cosmética: sin esto, cualquier día "dentro de lo
 * aceptable" en los 3 factores (viento, oleaje, periodo) daba 100 exacto,
 * indistinguible de un día realmente excepcional — un vídeo real de webcam
 * mostrando un día bueno-pero-no-perfecto con el score en 100 fue la señal
 * de que hacía falta este ajuste (ver README, "Calibración").
 */
export function penaltyRange(
  value: number,
  idealMin: number,
  idealMax: number,
  hardMin: number,
  hardMax: number,
  maxPenalty: number
): number {
  if (value >= idealMin && value <= idealMax) {
    const center = (idealMin + idealMax) / 2;
    const halfWidth = (idealMax - idealMin) / 2;
    if (halfWidth === 0) return 0;
    const distFromCenter = Math.abs(value - center) / halfWidth; // 0 en el centro, 1 en el borde
    return distFromCenter * maxPenalty * IN_RANGE_PEAK_SHARE;
  }
  if (value < idealMin) {
    if (value <= hardMin) return maxPenalty;
    const t = (idealMin - value) / (idealMin - hardMin);
    return t * maxPenalty;
  }
  if (value >= hardMax) return maxPenalty;
  const t = (value - idealMax) / (hardMax - idealMax);
  return t * maxPenalty;
}

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}
