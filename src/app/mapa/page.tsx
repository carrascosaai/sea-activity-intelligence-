import type { Metadata } from "next";
import { POPULAR_LOCATIONS } from "@/lib/locations";

export const metadata: Metadata = { title: "Mapa" };

// Ver nota en app/hoy/page.tsx sobre por qué existe este export inerte.
export const __routeId = "mapa" as const;
import { getDailySnapshots } from "@/lib/forecast";
import { scoreCondition } from "@/lib/scoring/engine";
import { findClosestHourIndex } from "@/lib/scoring/dayScores";
import { currentHourMadrid, todayISO } from "@/lib/time";
import type { ActivityId, SkillLevel } from "@/lib/types";
import { MapClientLoader } from "@/components/MapClientLoader";
import { MapControls } from "@/components/MapControls";
import type { MapPoint } from "@/components/MapClient";

// Carga inicial: solo playas destacadas a nivel nacional (acotado). El resto
// se carga bajo demanda según el viewport (ver /api/map-scores) — con ~3.600
// playas no se puede calcular el score de todas en cada carga de página.
export default async function MapaPage({
  searchParams,
}: {
  searchParams: Promise<{ activity?: string; level?: string }>;
}) {
  const params = await searchParams;
  const activity = (params.activity as ActivityId) ?? "paddle-surf";
  const level = (params.level as SkillLevel) ?? "principiante";
  const dateISO = todayISO();
  const hour = currentHourMadrid();

  const initialPoints: MapPoint[] = (
    await Promise.all(
      POPULAR_LOCATIONS.map(async (loc) => {
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
  ).filter((p): p is MapPoint => p !== null);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border flex-wrap">
        <p className="text-sm text-muted shrink-0">Condiciones ahora mismo</p>
        <MapControls activity={activity} level={level} />
      </div>
      <div className="relative flex-1 min-h-[70svh]">
        <MapClientLoader key={`${activity}-${level}`} initialPoints={initialPoints} activity={activity} level={level} />
      </div>
    </div>
  );
}
