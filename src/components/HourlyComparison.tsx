import { BAND_BAR_CLASS, BAND_META } from "@/lib/bandLabels";
import { formatHourLabel } from "@/lib/time";
import type { HourlyScore } from "@/lib/types";

export function HourlyComparison({ hourly, highlightTime }: { hourly: HourlyScore[]; highlightTime?: string }) {
  return (
    <div className="rounded-2xl bg-surface border border-border p-4">
      <h3 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide">Comparación por hora</h3>
      <div className="flex flex-col divide-y divide-border">
        {hourly.map((h) => {
          const meta = BAND_META[h.band];
          const isHighlight = h.time === highlightTime;
          return (
            <div
              key={h.time}
              className={`flex items-center justify-between py-2 px-2 rounded-lg ${isHighlight ? "bg-accent/10" : ""}`}
            >
              <span className="text-sm font-medium w-14">{formatHourLabel(h.time)}</span>
              <div className="flex-1 mx-3 h-2 rounded-full bg-surface-2 overflow-hidden">
                <div className={`h-full ${BAND_BAR_CLASS[h.band]}`} style={{ width: `${h.score}%` }} />
              </div>
              <span className="text-sm font-semibold w-10 text-right">{h.score}</span>
              <span className="ml-2">{meta.emoji}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
