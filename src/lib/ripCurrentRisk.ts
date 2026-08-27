export type RipRiskLevel = "bajo" | "moderado" | "alto" | "muy-alto";

export interface RipRiskResult {
  level: RipRiskLevel;
  label: string;
  emoji: string;
  description: string;
}

const LEVEL_META: Record<RipRiskLevel, { label: string; emoji: string; description: string }> = {
  bajo: {
    label: "Riesgo bajo",
    emoji: "🟢",
    description: "El oleaje actual no suele generar corrientes de retorno peligrosas.",
  },
  moderado: {
    label: "Riesgo moderado",
    emoji: "🟡",
    description: "Puede haber corrientes de retorno localizadas, sobre todo cerca de espigones, rocas o canales.",
  },
  alto: {
    label: "Riesgo alto",
    emoji: "🟠",
    description: "Condiciones asociadas a corrientes de retorno más fuertes. Extrema la precaución al bañarte.",
  },
  "muy-alto": {
    label: "Riesgo muy alto",
    emoji: "🔴",
    description: "Oleaje de energía alta — el tipo de condición en la que se forman las corrientes de retorno más peligrosas.",
  },
};

/**
 * Estimación orientativa del riesgo de corrientes de retorno ("resaca"),
 * basada en los dos factores mejor establecidos en la literatura
 * oceanográfica real (altura y periodo del oleaje) — ver p. ej. el modelo
 * nacional de corrientes de retorno de la NOAA (EE. UU.), que usa altura de
 * ola, dirección, marea y periodo. Aquí NO tenemos datos de marea (sin
 * proveedor abierto para España) ni la geometría exacta de cada playa
 * (orientación de la costa, batimetría), así que es deliberadamente una
 * versión simplificada — un indicador educativo con base real, nunca un
 * sustituto de la bandera del socorrista ni de un modelo profesional.
 *
 * Umbrales (reales, no inventados): la intensidad de las corrientes de
 * retorno aumenta de forma notable a partir de ~0.7 m de altura de ola
 * significante, y sigue subiendo hasta ~2 m. Un periodo largo (mar de fondo)
 * transporta más energía que un oleaje corto de la misma altura, así que
 * sube un nivel el riesgo si el periodo es muy largo.
 */
export function computeRipRisk(waveHeightM: number, wavePeriodS: number): RipRiskResult {
  let level: RipRiskLevel;
  if (waveHeightM < 0.5) level = "bajo";
  else if (waveHeightM < 1.0) level = "moderado";
  else if (waveHeightM < 2.0) level = "alto";
  else level = "muy-alto";

  // Oleaje de periodo largo (mar de fondo) transporta más energía que uno
  // corto de la misma altura — sube un nivel si no está ya al máximo.
  if (wavePeriodS >= 11 && level !== "muy-alto") {
    const order: RipRiskLevel[] = ["bajo", "moderado", "alto", "muy-alto"];
    level = order[order.indexOf(level) + 1];
  }

  return { level, ...LEVEL_META[level] };
}
