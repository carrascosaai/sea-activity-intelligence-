import type { FishingInfo } from "@/lib/fishing";
import type { Pier } from "@/lib/piers";

export function FishingInfoCard({
  info,
  piers,
}: {
  info: FishingInfo | null;
  piers: (Pier & { distanceKm: number })[];
}) {
  return (
    <div className="rounded-2xl bg-surface border border-border p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Pesca en la zona</h3>
        <span className="text-[10px] text-muted uppercase tracking-wide">{info?.basinLabel ?? "General"}</span>
      </div>

      {info ? (
        <>
          <p className="text-xs text-muted mb-3">
            Conocimiento general de la costa {info.basinLabel.toLowerCase()}, no una medición de esta playa exacta.
          </p>

          <p className="text-xs uppercase tracking-wide text-muted mb-1">Especies habituales</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {info.species.map((s) => (
              <span key={s} className="rounded-full bg-surface-2 border border-border/70 px-2.5 py-1 text-xs">
                {s}
              </span>
            ))}
          </div>

          <p className="text-xs uppercase tracking-wide text-muted mb-1">Cebo</p>
          <p className="text-sm mb-3">{info.baitTip}</p>

          <p className="text-xs uppercase tracking-wide text-muted mb-1">Según las condiciones</p>
          <ul className="flex flex-col gap-1 mb-1">
            {info.conditionTips.map((tip, i) => (
              <li key={i} className="text-sm text-foreground/90 flex items-start gap-1.5">
                <span className="text-muted">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-sm text-muted mb-3">No tenemos conocimiento general de pesca para esta zona todavía.</p>
      )}

      <div className="mt-3 pt-3 border-t border-border/60">
        <p className="text-xs uppercase tracking-wide text-muted mb-1.5">Espigones cerca</p>
        {piers.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {piers.map((p) => (
              <li key={p.slug} className="flex items-center justify-between text-sm">
                <span>
                  {p.kind === "groyne" ? "🪨" : "🧱"} {p.name}
                </span>
                <span className="text-xs text-muted shrink-0 ml-2">
                  {p.distanceKm < 1 ? `${Math.round(p.distanceKm * 1000)} m` : `${p.distanceKm.toFixed(1)} km`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No encontramos espigones o diques registrados cerca, en OpenStreetMap.</p>
        )}
      </div>
    </div>
  );
}
