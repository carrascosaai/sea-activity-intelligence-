import type { ActivityId } from "../types";
import type { ActivityProfile } from "./ruleTypes";

/**
 * Perfil base por actividad, en la referencia de nivel PRINCIPIANTE. Los
 * niveles intermedio/avanzado se derivan automáticamente escalando estos
 * números (ver generateRules.ts) — así evitamos mantener a mano 20
 * actividades × 3 niveles × 5 factores por separado.
 *
 * Umbrales de viento/oleaje: donde existe una guía publicada del propio
 * deporte (federaciones, escuelas, comunidad — ver comentario junto a cada
 * actividad con fuente y fecha de consulta), los números están contrastados
 * contra ella, no inventados. Donde no existe una referencia así de directa
 * (pesca, coasteering, baño, remo, moto de agua, flyboard...) siguen siendo
 * estimaciones razonadas por extrapolación de las actividades cercanas que
 * sí están contrastadas. En ambos casos son un punto de partida, pensado
 * para poder recalibrarse con datos de uso real (ver `recommendation_feedback`
 * en lib/analytics.ts) sin tocar el motor — ver VALIDATION.md.
 *
 * Nota de honestidad de datos: NO existe proveedor de visibilidad
 * subacuática real (Open-Meteo solo da visibilidad atmosférica), así que
 * buceo/snorkel/apnea NO usan ese campo en su score — mejor no puntuar un
 * factor que no podemos medir de verdad que inventarlo. (Sí hay una
 * estimación de claridad de agua por satélite, informativa y separada del
 * score — ver providers/noaaVisibility.ts.)
 */
export const ACTIVITY_PROFILES: Record<ActivityId, ActivityProfile> = {
  // Oleaje contrastado con guías de surf reales: principiante 1-3 pies
  // (0,3-0,9 m), intermedio 3-4 pies (0,9-1,2 m), avanzado overhead 6 pies+
  // (surfspotguide.com, 10oversurf.com, thesurfingsite.com — ago. 2026).
  surf: {
    wind: { kind: "linear", goodKmh: 12, badKmh: 32, maxPenalty: 30, noGoKmh: 50 },
    wave: { kind: "range", idealMinM: 0.3, idealMaxM: 0.9, hardMinM: 0.15, hardMaxM: 1.3, maxPenalty: 45, noGoM: 2.5 },
    period: { goodS: 10, badS: 5, maxPenalty: 25 },
    waterTempMaxPenalty: 6,
    rainMaxPenalty: 10,
  },
  "paddle-surf": {
    wind: { kind: "linear", goodKmh: 10, badKmh: 28, maxPenalty: 45, noGoKmh: 45 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.0, maxPenalty: 35, noGoM: 1.6 },
    period: { goodS: 7, badS: 3, maxPenalty: 10 },
    waterTempMaxPenalty: 10,
    rainMaxPenalty: 15,
  },
  kayak: {
    wind: { kind: "linear", goodKmh: 12, badKmh: 28, maxPenalty: 45, noGoKmh: 38 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.0, maxPenalty: 35, noGoM: 1.3 },
    period: { goodS: 7, badS: 4, maxPenalty: 8 },
    waterTempMaxPenalty: 6,
    rainMaxPenalty: 12,
  },
  bodyboard: {
    wind: { kind: "linear", goodKmh: 12, badKmh: 30, maxPenalty: 25, noGoKmh: 50 },
    wave: { kind: "range", idealMinM: 0.3, idealMaxM: 1.0, hardMinM: 0.15, hardMaxM: 1.6, maxPenalty: 35, noGoM: 2.8 },
    period: { goodS: 8, badS: 4, maxPenalty: 15 },
    waterTempMaxPenalty: 6,
    rainMaxPenalty: 10,
  },
  // Viento contrastado con guías de kitesurf reales (en nudos, convertido a
  // km/h): principiante ideal 10-18 kt (18,5-33 km/h), <10 kt insuficiente,
  // aprietan a partir de 30 kt (55,6 km/h) (northernkites.co.uk,
  // kiteworldwide.com, windup.live — ago. 2026).
  kitesurf: {
    wind: { kind: "range", idealMinKmh: 18, idealMaxKmh: 33, hardMinKmh: 13, hardMaxKmh: 56, maxPenalty: 55, noGoKmh: 56 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.2, maxPenalty: 20, noGoM: 2.5 },
    period: { goodS: 6, badS: 3, maxPenalty: 8 },
    waterTempMaxPenalty: 8,
    rainMaxPenalty: 15,
  },
  // Viento contrastado con guías de windsurf: principiante ideal 5-15 kt
  // (9-28 km/h), Force 3 (7-10 kt) el punto dulce; intermedio 15-25 kt
  // (airdsbay.co.uk, windup.live — ago. 2026).
  windsurf: {
    wind: { kind: "range", idealMinKmh: 13, idealMaxKmh: 28, hardMinKmh: 8, hardMaxKmh: 46, maxPenalty: 50, noGoKmh: 48 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.3, maxPenalty: 18, noGoM: 2.8 },
    period: { goodS: 6, badS: 3, maxPenalty: 8 },
    waterTempMaxPenalty: 8,
    rainMaxPenalty: 15,
  },
  // Viento contrastado con guías de wingfoil: mínimo real 10-12 kt
  // (18,5-22 km/h) para levantar el foil, ideal 12-18 kt (22-33 km/h)
  // (pooleharbour.co.uk, mackiteboarding.com — ago. 2026).
  wingfoil: {
    wind: { kind: "range", idealMinKmh: 18, idealMaxKmh: 33, hardMinKmh: 13, hardMaxKmh: 46, maxPenalty: 50, noGoKmh: 56 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.4, maxPenalty: 15, noGoM: 3.0 },
    period: { goodS: 6, badS: 3, maxPenalty: 6 },
    waterTempMaxPenalty: 8,
    rainMaxPenalty: 15,
  },
  // Viento: guías de buceo recomiendan no bucear en mar abierto con más de
  // Beaufort 4 (11-16 kt ≈ 20-30 km/h) (bsac.com, scubadoctor.com.au — ago.
  // 2026).
  buceo: {
    wind: { kind: "linear", goodKmh: 9, badKmh: 27, maxPenalty: 30, noGoKmh: 30 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.0, maxPenalty: 40, noGoM: 1.8 },
    period: { goodS: 8, badS: 4, maxPenalty: 8 },
    waterTempMaxPenalty: 15,
    rainMaxPenalty: 8,
  },
  // Viento: evitar snorkel con viento sostenido por encima de 10-15 kt
  // (18,5-27,8 km/h) — remueve sedimento y reduce visibilidad
  // (conquerthewater.com, seaview180.com — ago. 2026).
  snorkel: {
    wind: { kind: "linear", goodKmh: 9, badKmh: 19, maxPenalty: 35, noGoKmh: 28 },
    wave: { kind: "linear", goodM: 0.2, badM: 0.7, maxPenalty: 45, noGoM: 1.3 },
    period: { goodS: 8, badS: 4, maxPenalty: 6 },
    waterTempMaxPenalty: 12,
    rainMaxPenalty: 10,
  },
  apnea: {
    wind: { kind: "linear", goodKmh: 8, badKmh: 20, maxPenalty: 32, noGoKmh: 35 },
    wave: { kind: "linear", goodM: 0.2, badM: 0.8, maxPenalty: 42, noGoM: 1.5 },
    period: { goodS: 8, badS: 4, maxPenalty: 6 },
    waterTempMaxPenalty: 14,
    rainMaxPenalty: 8,
  },
  // Viento: agua plana ideal con ≤5 kt (9,3 km/h); guías de esquí acuático
  // dicen que un principiante no debería salir con ≥10 kt (18,5 km/h)
  // (airhead.com — ago. 2026).
  "esqui-acuatico": {
    wind: { kind: "linear", goodKmh: 9, badKmh: 19, maxPenalty: 40, noGoKmh: 26 },
    wave: { kind: "linear", goodM: 0.15, badM: 0.5, maxPenalty: 45, noGoM: 1.0 },
    period: { goodS: 10, badS: 5, maxPenalty: 5 },
    waterTempMaxPenalty: 6,
    rainMaxPenalty: 12,
  },
  wakeboard: {
    wind: { kind: "linear", goodKmh: 9, badKmh: 20, maxPenalty: 38, noGoKmh: 30 },
    wave: { kind: "linear", goodM: 0.15, badM: 0.6, maxPenalty: 42, noGoM: 1.1 },
    period: { goodS: 10, badS: 5, maxPenalty: 5 },
    waterTempMaxPenalty: 6,
    rainMaxPenalty: 12,
  },
  "moto-agua": {
    wind: { kind: "linear", goodKmh: 15, badKmh: 35, maxPenalty: 25, noGoKmh: 48 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.2, maxPenalty: 25, noGoM: 2.0 },
    period: { goodS: 8, badS: 4, maxPenalty: 4 },
    waterTempMaxPenalty: 4,
    rainMaxPenalty: 10,
  },
  flyboard: {
    wind: { kind: "linear", goodKmh: 8, badKmh: 20, maxPenalty: 40, noGoKmh: 30 },
    wave: { kind: "linear", goodM: 0.15, badM: 0.5, maxPenalty: 48, noGoM: 0.9 },
    period: { goodS: 10, badS: 5, maxPenalty: 4 },
    waterTempMaxPenalty: 6,
    rainMaxPenalty: 14,
  },
  remo: {
    wind: { kind: "linear", goodKmh: 8, badKmh: 18, maxPenalty: 42, noGoKmh: 28 },
    wave: { kind: "linear", goodM: 0.2, badM: 0.6, maxPenalty: 45, noGoM: 1.0 },
    period: { goodS: 8, badS: 4, maxPenalty: 6 },
    waterTempMaxPenalty: 6,
    rainMaxPenalty: 12,
  },
  // Viento: guías de vela ligera sitúan lo ideal para principiantes en 6-10
  // kt (11-18,5 km/h); a partir de 20 kt (37 km/h) la mayoría de dinghies
  // vuelven a puerto por el oleaje que genera (godownsize.com,
  // eoas.ubc.ca/Beaufort — ago. 2026).
  vela: {
    wind: { kind: "range", idealMinKmh: 11, idealMaxKmh: 19, hardMinKmh: 7, hardMaxKmh: 37, maxPenalty: 45, noGoKmh: 37 },
    wave: { kind: "linear", goodM: 0.4, badM: 1.3, maxPenalty: 20, noGoM: 2.2 },
    period: { goodS: 7, badS: 4, maxPenalty: 5 },
    waterTempMaxPenalty: 6,
    rainMaxPenalty: 12,
  },
  pesca: {
    wind: { kind: "linear", goodKmh: 15, badKmh: 35, maxPenalty: 30, noGoKmh: 45 },
    wave: { kind: "linear", goodM: 0.4, badM: 1.3, maxPenalty: 30, noGoM: 2.0 },
    period: { goodS: 8, badS: 4, maxPenalty: 5 },
    waterTempMaxPenalty: 4,
    rainMaxPenalty: 6,
  },
  coasteering: {
    wind: { kind: "linear", goodKmh: 12, badKmh: 30, maxPenalty: 30, noGoKmh: 45 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.0, maxPenalty: 35, noGoM: 1.8 },
    period: { goodS: 7, badS: 4, maxPenalty: 6 },
    waterTempMaxPenalty: 8,
    rainMaxPenalty: 15,
  },
  bano: {
    wind: { kind: "linear", goodKmh: 15, badKmh: 35, maxPenalty: 25, noGoKmh: 45 },
    wave: { kind: "linear", goodM: 0.3, badM: 1.0, maxPenalty: 40, noGoM: 1.6 },
    period: { goodS: 8, badS: 4, maxPenalty: 5 },
    waterTempMaxPenalty: 14,
    rainMaxPenalty: 20,
  },
  "natacion-aguas-abiertas": {
    wind: { kind: "linear", goodKmh: 10, badKmh: 25, maxPenalty: 30, noGoKmh: 38 },
    wave: { kind: "linear", goodM: 0.2, badM: 0.7, maxPenalty: 45, noGoM: 1.3 },
    period: { goodS: 8, badS: 4, maxPenalty: 8 },
    waterTempMaxPenalty: 12,
    rainMaxPenalty: 10,
  },
};
