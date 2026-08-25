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

/**
 * Penaliza cuando value cae fuera de un rango ideal [idealMin, idealMax],
 * con penalización máxima alcanzada en [hardMin, hardMax] o más allá.
 * Útil para oleaje de surf: ni muy plano ni muy grande.
 */
export function penaltyRange(
  value: number,
  idealMin: number,
  idealMax: number,
  hardMin: number,
  hardMax: number,
  maxPenalty: number
): number {
  if (value >= idealMin && value <= idealMax) return 0;
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
