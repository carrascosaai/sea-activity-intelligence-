import type { Metadata } from "next";
import Link from "next/link";
import { getActivity } from "@/lib/activities";
import { TOP_SPOTS } from "@/lib/topSpots";
import { TopSpotsControls } from "@/components/TopSpotsControls";
import type { ActivityId } from "@/lib/types";

export const metadata: Metadata = {
  title: "Mejores sitios de España por deporte",
  description: "Los spots de referencia de cada deporte acuático en España, por comunidad autónoma, con enlace directo a ver las condiciones en vivo.",
};

const AVAILABLE_ACTIVITIES = Object.keys(TOP_SPOTS) as ActivityId[];

export default async function MejoresSitiosPage({
  searchParams,
}: {
  searchParams: Promise<{ activity?: string }>;
}) {
  const params = await searchParams;
  const activityId = (AVAILABLE_ACTIVITIES.includes(params.activity as ActivityId) ? params.activity : "surf") as ActivityId;
  const activity = getActivity(activityId);
  const guide = TOP_SPOTS[activityId]!;

  // Agrupar por comunidad autónoma, en el orden en que aparecen (no alfabético,
  // para mantener los spots más relevantes primero según cómo se escribió la guía).
  const byRegion = new Map<string, typeof guide.spots>();
  for (const spot of guide.spots) {
    if (!byRegion.has(spot.region)) byRegion.set(spot.region, []);
    byRegion.get(spot.region)!.push(spot);
  }

  return (
    <div className="flex-1 flex flex-col max-w-xl w-full mx-auto px-5 py-8">
      <header className="mb-5">
        <h1 className="text-2xl font-bold">Mejores sitios de España</h1>
        <p className="text-sm text-muted mt-1.5">
          Spots de referencia por deporte, según reputación real del sector (no un ranking calculado por nosotros).
        </p>
      </header>

      <div className="mb-6">
        <TopSpotsControls activity={activityId} activities={AVAILABLE_ACTIVITIES} />
      </div>

      <div className="rounded-2xl bg-surface-2 border border-border p-4 mb-6">
        <p className="text-sm">
          {activity.emoji} <span className="font-semibold">{activity.name}</span>
        </p>
        <p className="text-sm text-muted mt-1.5">{guide.headline}</p>
      </div>

      <div className="flex flex-col gap-6">
        {[...byRegion.entries()].map(([region, spots]) => (
          <div key={region}>
            <h2 className="text-xs uppercase tracking-wide text-muted mb-2.5">{region}</h2>
            <div className="flex flex-col gap-3">
              {spots.map((spot) => (
                <div key={spot.name} className="rounded-2xl bg-surface border border-border p-4">
                  <p className="text-base font-semibold">{spot.name}</p>
                  <p className="text-sm text-foreground/90 mt-1">{spot.why}</p>
                  <p className="text-xs text-muted mt-2">
                    <span className="font-medium">Mejor época:</span> {spot.bestSeason}
                  </p>
                  {spot.locationSlug ? (
                    <Link
                      href={`/resultado?activity=${activityId}&location=${spot.locationSlug}&level=intermedio&when=now`}
                      className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-3"
                    >
                      📡 Ver condiciones en vivo ahora →
                    </Link>
                  ) : (
                    <Link href="/mapa" className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-3">
                      🗺️ Buscar en el mapa →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted mt-6 leading-relaxed">
        La "mejor época" es orientación general y real del sector, no un horario exacto — las condiciones cambian
        cada día. Para saber si hoy es buen día de verdad, usa el enlace de "ver condiciones en vivo".
      </p>
    </div>
  );
}
