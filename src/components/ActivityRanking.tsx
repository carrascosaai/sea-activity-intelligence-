import Link from "next/link";
import { BAND_META, isPoorBand } from "@/lib/bandLabels";
import type { ActivityId, ScoreBand } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

export function ActivityRanking({
  ranked,
  locationSlug,
  level,
}: {
  ranked: { activity: ActivityId; name: string; emoji: string; score: number; band: ScoreBand }[];
  locationSlug: string;
  level: string;
}) {
  const recommended = ranked.filter((r) => !isPoorBand(r.band));
  const notRecommended = ranked.filter((r) => isPoorBand(r.band));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide">Mejores opciones</h3>
        <div className="flex flex-col gap-2">
          {recommended.map((r, i) => (
            <Link
              key={r.activity}
              href={`/resultado?activity=${r.activity}&location=${locationSlug}&level=${level}&when=now`}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 hover:border-accent/50 transition-colors"
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">{MEDALS[i] ?? "•"}</span>
                <span className="font-medium">
                  {r.emoji} {r.name}
                </span>
              </span>
              <span className={`font-bold ${BAND_META[r.band].textClass}`}>{r.score}/100</span>
            </Link>
          ))}
          {recommended.length === 0 && <p className="text-sm text-muted">Ninguna actividad recomendada ahora mismo.</p>}
        </div>
      </div>

      {notRecommended.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide">No recomendado</h3>
          <div className="flex flex-col gap-2">
            {notRecommended.map((r) => (
              <div key={r.activity} className="flex items-center justify-between rounded-2xl border border-border bg-surface/50 px-4 py-3 opacity-70">
                <span className="font-medium">
                  {r.emoji} {r.name}
                </span>
                <span className={`font-bold ${BAND_META[r.band].textClass}`}>{r.score}/100</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
