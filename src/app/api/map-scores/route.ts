import { NextRequest, NextResponse } from "next/server";
import { locationsInBounds } from "@/lib/locations";
import { getDailySnapshots } from "@/lib/forecast";
import { scoreCondition } from "@/lib/scoring/engine";
import { findClosestHourIndex } from "@/lib/scoring/dayScores";
import { currentHourMadrid, todayISO } from "@/lib/time";
import type { ActivityId, SkillLevel } from "@/lib/types";
import { ACTIVITIES } from "@/lib/activities";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const VALID_ACTIVITIES = new Set(ACTIVITIES.map((a) => a.id));

/**
 * Scores para el mapa, acotados SIEMPRE al viewport visible (locationsInBounds
 * limita a un máximo de localizaciones). Con cobertura nacional (~3.600
 * playas) no se puede calcular el score de todas a la vez en cada carga de
 * página — solo se calculan las que el usuario está mirando ahora mismo.
 */
export async function GET(req: NextRequest) {
  // Límite más estricto que la búsqueda de playas: cada llamada puede disparar
  // hasta 80 peticiones a proveedores externos (una por playa en el viewport).
  const allowed = await checkRateLimit(`map-scores:${getClientIp(req)}`, 20, 60);
  if (!allowed) {
    return NextResponse.json({ points: [], error: "Demasiadas peticiones, prueba en un momento." }, { status: 429 });
  }

  const params = req.nextUrl.searchParams;
  const minLat = Number(params.get("minLat"));
  const maxLat = Number(params.get("maxLat"));
  const minLon = Number(params.get("minLon"));
  const maxLon = Number(params.get("maxLon"));
  const activity = params.get("activity") as ActivityId;
  const level = params.get("level") as SkillLevel;

  if ([minLat, maxLat, minLon, maxLon].some((n) => Number.isNaN(n)) || !VALID_ACTIVITIES.has(activity)) {
    return NextResponse.json({ points: [] }, { status: 400 });
  }

  const locations = locationsInBounds({ minLat, maxLat, minLon, maxLon }, 80);
  const dateISO = todayISO();
  const hour = currentHourMadrid();

  const points = (
    await Promise.all(
      locations.map(async (loc) => {
        try {
          const snapshots = await getDailySnapshots(loc, dateISO);
          if (snapshots.length === 0) return null;
          const idx = findClosestHourIndex(
            snapshots.map((s) => ({ time: s.time, score: 0, band: "peligrosa" as const, snapshot: s })),
            hour
          );
          const result = scoreCondition(activity, level, snapshots[idx]);
          return { slug: loc.slug, name: loc.name, lat: loc.lat, lon: loc.lon, score: result.score, band: result.band };
        } catch {
          return null;
        }
      })
    )
  ).filter(Boolean);

  return NextResponse.json({ points });
}
