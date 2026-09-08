import Link from "next/link";
import type { ActivityId, ScoreBand, SkillLevel } from "@/lib/types";
import { BAND_META } from "@/lib/bandLabels";

export interface DayTrendItem {
  label: string; // "Hoy", "Mañana", "jue 10"
  when: "today" | "tomorrow" | "date";
  dateISO: string;
  score: number | null; // null si no hay datos ese día
  band: ScoreBand | null;
}

/**
 * Mejor momento de cada uno de los próximos 3 días (hoy incluido), para ver
 * de un vistazo si merece esperar a mañana o pasado en vez de solo mostrar
 * el día que se está viendo ahora mismo. Mismo dato que ya se calcula para
 * "Mejor momento hoy" (computeBestWindow), solo que para 3 días en vez de 1
 * — no es un dato nuevo, es reutilizar lo que ya se pide.
 */
export function DayTrend({
  items,
  activityId,
  locationSlug,
  level,
  activeWhen,
}: {
  items: DayTrendItem[];
  activityId: ActivityId;
  locationSlug: string;
  level: SkillLevel;
  activeWhen: string;
}) {
  return (
    <div className="rounded-xl bg-surface-2 border border-border p-3">
      <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">Próximos días</h3>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => {
          const isActive = item.when === activeWhen;
          const meta = item.band ? BAND_META[item.band] : null;
          const params = new URLSearchParams({ activity: activityId, location: locationSlug, level, when: item.when });
          if (item.when === "date") params.set("date", item.dateISO);

          return (
            <Link
              key={item.dateISO}
              href={`/resultado?${params.toString()}`}
              className={`rounded-lg border px-2 py-2.5 text-center transition-colors ${
                isActive ? "border-accent bg-accent/10" : "border-border bg-surface hover:border-accent/40"
              }`}
            >
              <div className="text-[11px] text-muted mb-1 truncate">{item.label}</div>
              {item.score != null && meta ? (
                <div className={`text-lg font-bold tabular-nums ${meta.textClass}`}>{item.score}</div>
              ) : (
                <div className="text-lg font-bold text-muted">—</div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
