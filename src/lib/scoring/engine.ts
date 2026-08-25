import type { ActivityId, ConditionSnapshot, ScoreBand, ScoreReason, ScoreResult, SkillLevel } from "../types";
import { ACTIVITY_RULES } from "./config";
import { clampScore, penaltyLinear, penaltyLinearInverse, penaltyRange } from "./helpers";

function bandFromScore(score: number): ScoreBand {
  if (score >= 85) return "ideal";
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
    wavePenalty = penaltyLinear(snapshot.waveHeightM, rules.wave.goodM, rules.wave.badM, rules.wave.maxPenalty);
    if (snapshot.waveHeightM >= rules.wave.noGoM) hardNoGo = true;
    if (wavePenalty <= 2) reasons.push({ type: "positive", text: "Oleaje pequeño" });
    else if (wavePenalty >= rules.wave.maxPenalty * 0.5)
      reasons.push({ type: "negative", text: `Oleaje elevado para tu nivel (${snapshot.waveHeightM.toFixed(1)} m)` });
  } else {
    wavePenalty = penaltyRange(
      snapshot.waveHeightM,
      rules.wave.idealMinM,
      rules.wave.idealMaxM,
      rules.wave.hardMinM,
      rules.wave.hardMaxM,
      rules.wave.maxPenalty
    );
    if (snapshot.waveHeightM >= rules.wave.noGoM) hardNoGo = true;
    if (wavePenalty <= 2) reasons.push({ type: "positive", text: "Tamaño de ola en tu rango ideal" });
    else if (snapshot.waveHeightM < rules.wave.idealMinM)
      reasons.push({ type: "negative", text: "Poco oleaje para esta actividad" });
    else if (wavePenalty >= rules.wave.maxPenalty * 0.5)
      reasons.push({ type: "negative", text: `Oleaje demasiado grande para tu nivel (${snapshot.waveHeightM.toFixed(1)} m)` });
  }
  score -= wavePenalty;

  // --- Periodo ---
  const periodPenalty = penaltyLinearInverse(snapshot.wavePeriodS, rules.period.goodS, rules.period.badS, rules.period.maxPenalty);
  score -= periodPenalty;
  if (rules.period.maxPenalty > 0 && periodPenalty >= rules.period.maxPenalty * 0.6) {
    reasons.push({ type: "negative", text: `Periodo corto (${snapshot.wavePeriodS.toFixed(0)} s), puede ser más incómodo` });
  }

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
