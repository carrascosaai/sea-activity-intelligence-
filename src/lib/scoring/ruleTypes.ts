export interface WindLinearRule {
  kind: "linear";
  goodKmh: number;
  badKmh: number;
  maxPenalty: number;
  noGoKmh: number;
}

/** Para deportes que NECESITAN un mínimo de viento (kitesurf, windsurf, vela...): muy poco viento también penaliza. */
export interface WindRangeRule {
  kind: "range";
  idealMinKmh: number;
  idealMaxKmh: number;
  hardMinKmh: number;
  hardMaxKmh: number;
  maxPenalty: number;
  noGoKmh: number;
}

export type WindRule = WindLinearRule | WindRangeRule;

export interface WaveLinearRule {
  kind: "linear";
  goodM: number;
  badM: number;
  maxPenalty: number;
  noGoM: number;
}

/** Para deportes de deslizamiento en ola (surf, bodyboard...): ni muy plano ni muy grande. */
export interface WaveRangeRule {
  kind: "range";
  idealMinM: number;
  idealMaxM: number;
  hardMinM: number;
  hardMaxM: number;
  maxPenalty: number;
  noGoM: number;
}

export type WaveRule = WaveLinearRule | WaveRangeRule;

export interface PeriodRule {
  goodS: number;
  badS: number;
  maxPenalty: number;
}

export interface ComfortRule {
  waterTempGoodC: number;
  waterTempBadC: number;
  waterTempMaxPenalty: number;
  rainGoodPct: number;
  rainBadPct: number;
  rainMaxPenalty: number;
}

export interface ActivityLevelRules {
  wind: WindRule;
  wave: WaveRule;
  period: PeriodRule;
  comfort: ComfortRule;
}

/** Perfil base (referencia: nivel principiante) del que se derivan los 3 niveles. */
export interface ActivityProfile {
  wind: WindRule;
  wave: WaveRule;
  period: PeriodRule;
  waterTempMaxPenalty: number;
  rainMaxPenalty: number;
}
