export type ActivityId =
  | "paddle-surf"
  | "surf"
  | "kayak"
  | "bodyboard"
  | "kitesurf"
  | "windsurf"
  | "wingfoil"
  | "buceo"
  | "snorkel"
  | "apnea"
  | "esqui-acuatico"
  | "wakeboard"
  | "moto-agua"
  | "flyboard"
  | "remo"
  | "vela"
  | "pesca"
  | "coasteering"
  | "bano"
  | "natacion-aguas-abiertas";

export type SkillLevel = "principiante" | "intermedio" | "avanzado";

export type ActivityCategory = "tabla" | "remo-vela" | "submarinismo" | "motor" | "otros";

export interface ActivityDef {
  id: ActivityId;
  name: string;
  emoji: string;
  shortName: string;
  category: ActivityCategory;
}

export interface Location {
  slug: string;
  name: string;
  municipality: string | null;
  province: string;
  region: string;
  lat: number;
  lon: number;
  popular: boolean;
}

export interface WeatherHourPoint {
  time: string; // ISO local (Europe/Madrid)
  airTempC: number | null;
  windSpeedKmh: number | null;
  windDirectionDeg: number | null;
  precipitationProbabilityPct: number | null;
  precipitationMm: number | null;
  weatherCode: number | null;
  visibilityM: number | null;
}

export interface MarineHourPoint {
  time: string; // ISO local (Europe/Madrid)
  waveHeightM: number | null;
  waveDirectionDeg: number | null;
  wavePeriodS: number | null;
  waterTempC: number | null;
}

export interface TideInfo {
  available: false;
  reason: string;
}

export type WaterClarityLabel = "Excepcional" | "Muy buena" | "Buena" | "Moderada" | "Reducida" | "Baja";

export type VisibilityInfo =
  | {
      available: true;
      kd490: number; // coeficiente de atenuación de luz, m^-1 (menor = agua más clara)
      label: WaterClarityLabel;
      rangeLabel: string; // p.ej. "8-12 m orientativos"
      observedDateISO: string; // fecha real de la observación por satélite
      daysOld: number;
    }
  | { available: false; reason: string };

export interface ConditionSnapshot {
  time: string; // ISO local
  windSpeedKmh: number;
  windDirectionDeg: number | null;
  waveHeightM: number;
  waveDirectionDeg: number | null;
  wavePeriodS: number;
  waterTempC: number;
  airTempC: number;
  precipitationProbabilityPct: number;
  precipitationMm: number;
  weatherCode: number;
  visibilityM: number | null;
  isThunderstorm: boolean;
}

/**
 * 5 niveles (antes 3): ideal/buena/aceptable/mala/peligrosa. Los umbrales
 * viven en lib/scoring/engine.ts (bandFromScore) — un único sitio, todo lo
 * demás (mapa, tarjetas, ranking) solo lee este tipo.
 */
export type ScoreBand = "ideal" | "buena" | "aceptable" | "mala" | "peligrosa";

export interface ScoreReason {
  type: "positive" | "negative" | "neutral";
  text: string;
}

export interface ScoreResult {
  score: number; // 0-100
  band: ScoreBand;
  reasons: ScoreReason[];
  noGo: boolean;
}

export interface HourlyScore {
  time: string;
  score: number;
  band: ScoreBand;
  snapshot: ConditionSnapshot;
}

export type WhenMode = "now" | "today" | "tomorrow" | "date";
