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
  /**
   * Open-Meteo Marine separa el estado del mar combinado (wave_*, arriba) en
   * sus dos componentes físicos: el mar de fondo/swell (olas organizadas de
   * origen lejano, lo que de verdad interesa para surf/bodyboard) y el mar
   * de viento (chop local, lo que interesa para el "picado" que afecta a
   * kayak/remo/buceo...). No siempre están los tres — con mar totalmente
   * plano o sin swell diferenciado, pueden venir `null`; nunca se inventan.
   * Ver lib/scoring/profiles.ts (useSwellData) y providers/openMeteoMarine.ts.
   */
  swellWaveHeightM: number | null;
  swellWavePeriodS: number | null; // periodo de pico si está disponible, si no periodo medio del swell
  windWaveHeightM: number | null;
}

export interface TideEvent {
  type: "pleamar" | "bajamar";
  time: string; // ISO local (Europe/Madrid)
  heightM: number;
}

export type TideInfo =
  | {
      available: true;
      events: TideEvent[]; // pleamares/bajamares de hoy, en orden cronológico
      stationName: string;
      distanceKm: number; // a la estación real más cercana con constituyentes armónicos
      source: { name: string; url: string };
    }
  | { available: false; reason: string };

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
  // Componentes swell/mar de viento — null si Open-Meteo no los diferencia en
  // ese momento (mar totalmente plano, o sin separación clara). Ver
  // MarineHourPoint para de dónde salen.
  swellWaveHeightM: number | null;
  swellWavePeriodS: number | null;
  windWaveHeightM: number | null;
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
