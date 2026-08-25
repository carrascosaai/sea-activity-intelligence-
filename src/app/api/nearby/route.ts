import { NextRequest, NextResponse } from "next/server";
import { locationsNear } from "@/lib/locations";
import { getDailySnapshots } from "@/lib/forecast";
import { scoreCondition } from "@/lib/scoring/engine";
import { findClosestHourIndex, computeBestWindow, buildHourlyScores } from "@/lib/scoring/dayScores";
import { currentHourMadrid, formatHourLabel, todayISO } from "@/lib/time";
import { ACTIVITIES } from "@/lib/activities";
import type { ActivityId, ScoreBand, SkillLevel } from "@/lib/types";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const VALID_ACTIVITIES = new Set(ACTIVITIES.map((a) => a.id));
const VALID_LEVELS = new Set<SkillLevel>(["principiante", "intermedio", "avanzado"]);

// Cuánto "cuesta" cada km de distancia al ordenar — favorece playas cercanas
// sin ignorar del todo una mucho mejor un poco más lejos.
const DISTANCE_PENALTY_PER_KM = 0.5;
const MAX_CANDIDATE_BEACHES = 20;

interface Candidate {
  slug: string;
  name: string;
  municipality: string | null;
  distanceKm: number;
  activity: ActivityId;
  score: number;
  band: ScoreBand;
  bestWindow: { start: string; end: string } | null;
  rank: number;
}

/**
 * "¿Qué puedo hacer cerca de mí, ahora mismo?" — el usuario solo da su
 * posición (y opcionalmente nivel/actividad). Busca las playas más cercanas,
 * puntúa cada actividad en cada una y devuelve un ranking combinando calidad
 * y distancia.
 *
 * Sin filtro de actividad, DIVERSIFICA: como playas a 1-3km entre sí suelen
 * compartir casi el mismo tiempo, quedarse solo con "la mejor actividad de
 * cada playa" da una lista repetida (la misma actividad ganando en las 8
 * playas). En su lugar, de entre todas las combinaciones playa×actividad se
 * queda con la MEJOR playa para cada actividad — así el resultado se parece
 * al ejemplo real: surf en la playa X, kayak en la playa Y, no la misma
 * actividad ocho veces.
 *
 * Coste real: 1 fetch de previsión por playa candidata (no por actividad —
 * las 20 actividades se puntúan a partir del mismo snapshot ya descargado),
 * acotado a MAX_CANDIDATE_BEACHES y beneficiado por la caché de
 * lib/cache/forecastCache.ts igual que el resto de la app.
 *
 * Limitación real conocida: algunas "playas" del dataset son fluviales/de
 * embalse muy tierra adentro (OpenStreetMap las etiqueta natural=beach igual
 * que las de mar). Open-Meteo Marine API no tiene oleaje real ahí (devuelve
 * null, no un valor aproximado) — getDailySnapshots ya las descarta
 * correctamente, así que para alguien muy alejado de la costa (interior
 * peninsular) puede no haber ningún resultado. Es el comportamiento honesto
 * (no inventar oleaje donde no lo hay), no un fallo.
 */
export async function GET(req: NextRequest) {
  const allowed = await checkRateLimit(`nearby:${getClientIp(req)}`, 15, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Demasiadas peticiones, prueba en un momento." }, { status: 429 });
  }

  const params = req.nextUrl.searchParams;
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));
  const level = (params.get("level") as SkillLevel) ?? "principiante";
  const activityFilter = params.get("activity") as ActivityId | null;

  if (Number.isNaN(lat) || Number.isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "Ubicación no válida" }, { status: 400 });
  }
  if (!VALID_LEVELS.has(level)) {
    return NextResponse.json({ error: "Nivel no válido" }, { status: 400 });
  }
  if (activityFilter && !VALID_ACTIVITIES.has(activityFilter)) {
    return NextResponse.json({ error: "Actividad no válida" }, { status: 400 });
  }

  const candidateLocations = locationsNear(lat, lon, { limit: MAX_CANDIDATE_BEACHES });
  const dateISO = todayISO();
  const hour = currentHourMadrid();
  const activitiesToScore = activityFilter ? [activityFilter] : ACTIVITIES.map((a) => a.id);

  // Todas las combinaciones playa × actividad, no solo la mejor por playa.
  const allCombos = (
    await Promise.all(
      candidateLocations.map(async (loc): Promise<Candidate[]> => {
        try {
          const snapshots = await getDailySnapshots(loc, dateISO);
          if (snapshots.length === 0) return [];

          const idx = findClosestHourIndex(
            snapshots.map((s) => ({ time: s.time, score: 0, band: "peligrosa" as const, snapshot: s })),
            hour
          );
          const snapshot = snapshots[idx];

          return activitiesToScore.map((activityId) => {
            const result = scoreCondition(activityId, level, snapshot);
            return {
              slug: loc.slug,
              name: loc.name,
              municipality: loc.municipality,
              distanceKm: Math.round(loc.distanceKm * 10) / 10,
              activity: activityId,
              score: result.score,
              band: result.band,
              bestWindow: null, // se calcula solo para las que entran en el top, más abajo
              rank: result.score - Math.min(loc.distanceKm, 50) * DISTANCE_PENALTY_PER_KM,
            };
          });
        } catch {
          return [];
        }
      })
    )
  ).flat();

  // Reparto voraz: para cada actividad (empezando por la que tiene mejor
  // opción disponible), se le asigna su mejor playa que NO haya llegado
  // todavía al tope de repeticiones — si su primera opción ya está copada,
  // prueba la segunda mejor playa para esa misma actividad, no la descarta.
  // Así se evita tanto "la misma actividad 8 veces" como "las mismas 2
  // playas repetidas 8 veces" (playas a 1-3km entre sí comparten casi el
  // mismo tiempo, así que sin esto una sola playa podría ganar en todo).
  const MAX_PER_BEACH = 2;
  let top: Candidate[];

  if (activityFilter) {
    top = allCombos.sort((a, b) => b.rank - a.rank).slice(0, 8);
  } else {
    const byActivity = new Map<ActivityId, Candidate[]>();
    for (const c of allCombos) {
      const list = byActivity.get(c.activity) ?? [];
      list.push(c);
      byActivity.set(c.activity, list);
    }
    for (const list of byActivity.values()) list.sort((a, b) => b.rank - a.rank);

    const activityOrder = [...byActivity.entries()]
      .sort((a, b) => b[1][0].rank - a[1][0].rank)
      .map(([id]) => id);

    const beachCount = new Map<string, number>();
    top = [];
    for (const activityId of activityOrder) {
      const candidatesForActivity = byActivity.get(activityId)!;
      const pick = candidatesForActivity.find((c) => (beachCount.get(c.slug) ?? 0) < MAX_PER_BEACH);
      if (!pick) continue;
      top.push(pick);
      beachCount.set(pick.slug, (beachCount.get(pick.slug) ?? 0) + 1);
      if (top.length >= 8) break;
    }
    top.sort((a, b) => b.rank - a.rank);
  }

  // Solo para el top final: calcula la mejor ventana horaria (evita hacerlo
  // para las ~20 actividades × 20 playas descartadas).
  const withWindows = await Promise.all(
    top.map(async (c) => {
      const loc = candidateLocations.find((l) => l.slug === c.slug)!;
      try {
        const snapshots = await getDailySnapshots(loc, dateISO);
        const bestWindow = computeBestWindow(buildHourlyScores(snapshots, c.activity, level));
        return {
          ...c,
          bestWindow: bestWindow
            ? { start: formatHourLabel(bestWindow.startTime), end: formatHourLabel(bestWindow.endTime) }
            : null,
        };
      } catch {
        return c;
      }
    })
  );

  return NextResponse.json({ results: withWindows });
}
