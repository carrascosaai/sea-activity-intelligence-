import type { ActivityId, ConditionSnapshot, ScoreBand, ScoreReason, ScoreResult, SkillLevel } from "../types";
import { ACTIVITY_RULES } from "./config";
import { clampScore, penaltyLinear, penaltyLinearInverse, penaltyRange } from "./helpers";

// Umbral de "ideal" subido de 85 a 93 (sep. 2026, junto con el ajuste de
// penaltyRange en helpers.ts): antes, CUALQUIER día dentro del rango
// aceptable en los 3 factores (viento/oleaje/periodo) llegaba a 100 y a
// "CONDICIONES IDEALES", indistinguible de un día realmente excepcional —
// detectado con un caso real (webcam de Somo mostrando un día bueno pero
// picado, con el score en 100). Ahora "ideal" queda para lo que de verdad
// está cerca del centro de todos los rangos; un día bueno-pero-no-perfecto
// (88-92 con el nuevo cálculo) cae en "buena", que es justo lo que es.
function bandFromScore(score: number): ScoreBand {
  if (score >= 93) return "ideal";
  if (score >= 70) return "buena";
  if (score >= 50) return "aceptable";
  if (score >= 30) return "mala";
  return "peligrosa";
}

const LEVEL_LABEL: Record<SkillLevel, string> = {
  principiante: "principiantes",
  intermedio: "nivel intermedio",
  avanzado: "nivel avanzado",
};

export function scoreCondition(
  activity: ActivityId,
  level: SkillLevel,
  snapshot: ConditionSnapshot
): ScoreResult {
  const rules = ACTIVITY_RULES[activity][level];
  const reasons: ScoreReason[] = [];
  let score = 100;
  let hardNoGo = false;

  // Deportes de deslizamiento en ola puntúan sobre el swell (mar de fondo
  // organizado), no sobre el estado del mar combinado — ver ruleTypes.ts
  // (useSwellData) y providers/openMeteoMarine.ts. Si el swell no está
  // diferenciado en ese instante (null), cae al dato combinado.
  const effectiveWaveHeightM = rules.useSwellData ? (snapshot.swellWaveHeightM ?? snapshot.waveHeightM) : snapshot.waveHeightM;
  const effectiveWavePeriodS = rules.useSwellData ? (snapshot.swellWavePeriodS ?? snapshot.wavePeriodS) : snapshot.wavePeriodS;

  // --- Viento ---
  let windPenalty: number;
  if (rules.wind.kind === "linear") {
    windPenalty = penaltyLinear(snapshot.windSpeedKmh, rules.wind.goodKmh, rules.wind.badKmh, rules.wind.maxPenalty);
    if (snapshot.windSpeedKmh >= rules.wind.noGoKmh) hardNoGo = true;
    if (windPenalty <= 2) reasons.push({ type: "positive", text: "Poco viento" });
    else if (windPenalty >= rules.wind.maxPenalty * 0.5)
      reasons.push({ type: "negative", text: `Viento fuerte para tu nivel (${Math.round(snapshot.windSpeedKmh)} km/h)` });
  } else {
    windPenalty = penaltyRange(
      snapshot.windSpeedKmh,
      rules.wind.idealMinKmh,
      rules.wind.idealMaxKmh,
      rules.wind.hardMinKmh,
      rules.wind.hardMaxKmh,
      rules.wind.maxPenalty
    );
    if (snapshot.windSpeedKmh >= rules.wind.noGoKmh) hardNoGo = true;
    if (windPenalty <= 2) reasons.push({ type: "positive", text: "Viento en tu rango ideal" });
    else if (snapshot.windSpeedKmh < rules.wind.idealMinKmh)
      reasons.push({ type: "negative", text: `Poco viento para practicar (${Math.round(snapshot.windSpeedKmh)} km/h)` });
    else if (windPenalty >= rules.wind.maxPenalty * 0.5)
      reasons.push({ type: "negative", text: `Viento excesivo para tu nivel (${Math.round(snapshot.windSpeedKmh)} km/h)` });
  }
  score -= windPenalty;

  // --- Oleaje ---
  let wavePenalty: number;
  if (rules.wave.kind === "linear") {
    wavePenalty = penaltyLinear(effectiveWaveHeightM, rules.wave.goodM, rules.wave.badM, rules.wave.maxPenalty);
    if (effectiveWaveHeightM >= rules.wave.noGoM) hardNoGo = true;
    if (wavePenalty <= 2) reasons.push({ type: "positive", text: "Oleaje pequeño" });
    else if (wavePenalty >= rules.wave.maxPenalty * 0.5)
      reasons.push({ type: "negative", text: `Oleaje elevado para tu nivel (${effectiveWaveHeightM.toFixed(1)} m)` });
  } else {
    wavePenalty = penaltyRange(
      effectiveWaveHeightM,
      rules.wave.idealMinM,
      rules.wave.idealMaxM,
      rules.wave.hardMinM,
      rules.wave.hardMaxM,
      rules.wave.maxPenalty
    );
    if (effectiveWaveHeightM >= rules.wave.noGoM) hardNoGo = true;
    if (wavePenalty <= 2) reasons.push({ type: "positive", text: "Tamaño de ola en tu rango ideal" });
    else if (effectiveWaveHeightM < rules.wave.idealMinM)
      reasons.push({ type: "negative", text: "Poco oleaje para esta actividad" });
    else if (wavePenalty >= rules.wave.maxPenalty * 0.5)
      reasons.push({ type: "negative", text: `Oleaje demasiado grande para tu nivel (${effectiveWaveHeightM.toFixed(1)} m)` });
  }
  score -= wavePenalty;

  // --- Periodo --- (ver ruleTypes.ts: el sentido de "mejor" cambia según el deporte)
  let periodPenalty: number;
  if (rules.period.kind === "shorter-is-worse") {
    periodPenalty = penaltyLinearInverse(effectiveWavePeriodS, rules.period.goodS, rules.period.badS, rules.period.maxPenalty);
    if (rules.period.maxPenalty > 0 && periodPenalty >= rules.period.maxPenalty * 0.6) {
      reasons.push({ type: "negative", text: `Periodo corto (${effectiveWavePeriodS.toFixed(0)} s): oleaje de viento, más incómodo/inestable` });
    }
  } else if (rules.period.kind === "longer-is-worse") {
    periodPenalty = penaltyLinear(effectiveWavePeriodS, rules.period.goodS, rules.period.badS, rules.period.maxPenalty);
    if (rules.period.maxPenalty > 0 && periodPenalty >= rules.period.maxPenalty * 0.6) {
      reasons.push({
        type: "negative",
        text: `Periodo largo (${effectiveWavePeriodS.toFixed(0)} s): más energía en la rotura, riesgo de corrientes de retorno`,
      });
    }
  } else {
    periodPenalty = penaltyRange(
      effectiveWavePeriodS,
      rules.period.idealMinS,
      rules.period.idealMaxS,
      rules.period.hardMinS,
      rules.period.hardMaxS,
      rules.period.maxPenalty
    );
    if (periodPenalty <= 2) {
      reasons.push({ type: "positive", text: "Periodo de ola con buena calidad (mar de fondo organizado)" });
    } else if (effectiveWavePeriodS < rules.period.idealMinS) {
      reasons.push({
        type: "negative",
        text: `Periodo corto (${effectiveWavePeriodS.toFixed(0)} s): oleaje de viento, olas desorganizadas y con poca fuerza`,
      });
    }
  }
  score -= periodPenalty;

  // --- Temperatura del agua (secundario) ---
  const tempPenalty = penaltyLinearInverse(
    snapshot.waterTempC,
    rules.comfort.waterTempGoodC,
    rules.comfort.waterTempBadC,
    rules.comfort.waterTempMaxPenalty
  );
  score -= tempPenalty;
  if (rules.comfort.waterTempMaxPenalty > 0 && tempPenalty >= rules.comfort.waterTempMaxPenalty * 0.6) {
    reasons.push({ type: "negative", text: `Agua fría (${snapshot.waterTempC.toFixed(0)} ºC), valora usar traje de neopreno` });
  }

  // --- Lluvia ---
  const rainPenalty = penaltyLinear(
    snapshot.precipitationProbabilityPct,
    rules.comfort.rainGoodPct,
    rules.comfort.rainBadPct,
    rules.comfort.rainMaxPenalty
  );
  score -= rainPenalty;
  if (rainPenalty <= 1) {
    reasons.push({ type: "positive", text: "Sin lluvia" });
  } else if (rainPenalty >= rules.comfort.rainMaxPenalty * 0.5) {
    reasons.push({ type: "negative", text: `Probabilidad de lluvia alta (${Math.round(snapshot.precipitationProbabilityPct)}%)` });
  }

  // --- Tormenta: condición de NO GO absoluta ---
  if (snapshot.isThunderstorm) {
    hardNoGo = true;
    reasons.unshift({ type: "negative", text: "Tormenta prevista" });
  }

  let finalScore = clampScore(score);
  if (hardNoGo) {
    finalScore = Math.min(finalScore, snapshot.isThunderstorm ? 15 : 25);
  }

  const band = bandFromScore(finalScore);

  if ((band === "ideal" || band === "buena") && !reasons.some((r) => r.text.startsWith("Condiciones cómodas"))) {
    reasons.push({ type: "positive", text: `Condiciones cómodas para ${LEVEL_LABEL[level]}` });
  }

  return { score: finalScore, band, reasons, noGo: hardNoGo };
}
