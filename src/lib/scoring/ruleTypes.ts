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

/**
 * El periodo de ola (segundos entre crestas) no afecta igual a todos los
 * deportes — de hecho, el sentido de "mejor" se invierte según el caso, así
 * que hace falta más de un modelo (ver profiles.ts para qué actividad usa
 * cuál, con las fuentes de cada una):
 *
 * - "shorter-is-worse": deportes de flotación/embarcación (kayak, remo,
 *   vela, esquí acuático...) y submarinismo. Un periodo corto = oleaje de
 *   viento, empinado y con las crestas juntas ("chop") — incómodo e
 *   inestable a la misma altura de ola. Periodo largo = mar de fondo, más
 *   suave de llevar aunque tenga más energía.
 * - "range": deportes de deslizamiento sobre la ola (surf, bodyboard). Ahí
 *   se quiere precisamente esa energía organizada: un oleaje de viento
 *   corto (<10 s aprox.) es débil y desordenado, un mar de fondo de 10-14 s
 *   es la franja de mejor calidad de ola.
 * - "longer-is-worse": deportes expuestos a la rotura de la ola en la
 *   orilla o en rocas (baño, natación, coasteering, pesca desde
 *   espigón/roca). Aquí se invierte respecto a los de flotación: un periodo
 *   largo transporta más energía a la costa y genera corrientes de retorno
 *   y golpes de mar más fuertes con la misma altura de ola — el mismo
 *   principio que ya usa el indicador de corrientes de retorno, ver
 *   lib/ripCurrentRisk.ts.
 */
export interface PeriodShorterWorseRule {
  kind: "shorter-is-worse";
  goodS: number;
  badS: number;
  maxPenalty: number;
}

export interface PeriodLongerWorseRule {
  kind: "longer-is-worse";
  goodS: number;
  badS: number;
  maxPenalty: number;
}

export interface PeriodRangeRule {
  kind: "range";
  idealMinS: number;
  idealMaxS: number;
  hardMinS: number;
  hardMaxS: number;
  maxPenalty: number;
}

export type PeriodRule = PeriodShorterWorseRule | PeriodLongerWorseRule | PeriodRangeRule;

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
