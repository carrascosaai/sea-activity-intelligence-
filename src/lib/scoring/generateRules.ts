import type { SkillLevel } from "../types";
import type { ActivityLevelRules, ActivityProfile, ComfortRule, WaveRule, WindRule } from "./ruleTypes";

/**
 * Factores de escalado por nivel, aplicados sobre el perfil base (principiante).
 * thresholdMult: cuánto viento/oleaje extra tolera ese nivel antes de penalizar.
 * penaltyMult: cuánto se suaviza la penalización máxima (más experiencia = se
 * nota menos el mismo exceso).
 */
const LEVEL_FACTORS: Record<SkillLevel, { thresholdMult: number; penaltyMult: number }> = {
  principiante: { thresholdMult: 1, penaltyMult: 1 },
  intermedio: { thresholdMult: 1.35, penaltyMult: 0.85 },
  avanzado: { thresholdMult: 1.8, penaltyMult: 0.7 },
};

function scaleWind(wind: WindRule, f: { thresholdMult: number; penaltyMult: number }): WindRule {
  if (wind.kind === "linear") {
    return {
      kind: "linear",
      goodKmh: wind.goodKmh * f.thresholdMult,
      badKmh: wind.badKmh * f.thresholdMult,
      maxPenalty: wind.maxPenalty * f.penaltyMult,
      noGoKmh: wind.noGoKmh * f.thresholdMult,
    };
  }
  return {
    kind: "range",
    idealMinKmh: wind.idealMinKmh,
    idealMaxKmh: wind.idealMaxKmh * f.thresholdMult,
    hardMinKmh: wind.hardMinKmh,
    hardMaxKmh: wind.hardMaxKmh * f.thresholdMult,
    maxPenalty: wind.maxPenalty * f.penaltyMult,
    noGoKmh: wind.noGoKmh * f.thresholdMult,
  };
}

function scaleWave(wave: WaveRule, f: { thresholdMult: number; penaltyMult: number }): WaveRule {
  if (wave.kind === "linear") {
    return {
      kind: "linear",
      goodM: wave.goodM * f.thresholdMult,
      badM: wave.badM * f.thresholdMult,
      maxPenalty: wave.maxPenalty * f.penaltyMult,
      noGoM: wave.noGoM * f.thresholdMult,
    };
  }
  return {
    kind: "range",
    idealMinM: wave.idealMinM,
    idealMaxM: wave.idealMaxM * f.thresholdMult,
    hardMinM: wave.hardMinM,
    hardMaxM: wave.hardMaxM * f.thresholdMult,
    maxPenalty: wave.maxPenalty * f.penaltyMult,
    noGoM: wave.noGoM * f.thresholdMult,
  };
}

function scaleComfort(profile: ActivityProfile, f: { thresholdMult: number; penaltyMult: number }): ComfortRule {
  return {
    waterTempGoodC: 20,
    waterTempBadC: 14,
    waterTempMaxPenalty: profile.waterTempMaxPenalty * f.penaltyMult,
    rainGoodPct: 15,
    rainBadPct: 70,
    rainMaxPenalty: profile.rainMaxPenalty * f.penaltyMult,
  };
}

export function buildActivityRules(profile: ActivityProfile): Record<SkillLevel, ActivityLevelRules> {
  const levels: SkillLevel[] = ["principiante", "intermedio", "avanzado"];
  const result = {} as Record<SkillLevel, ActivityLevelRules>;
  for (const level of levels) {
    const f = LEVEL_FACTORS[level];
    result[level] = {
      wind: scaleWind(profile.wind, f),
      wave: scaleWave(profile.wave, f),
      period: { goodS: profile.period.goodS, badS: profile.period.badS, maxPenalty: profile.period.maxPenalty * f.penaltyMult },
      comfort: scaleComfort(profile, f),
    };
  }
  return result;
}
