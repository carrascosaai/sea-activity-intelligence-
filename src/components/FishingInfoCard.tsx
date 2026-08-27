import type { FishingInfo } from "@/lib/fishing";
import type { Pier } from "@/lib/piers";
import type { NearbySpecies } from "@/lib/fishOccurrences";

export function FishingInfoCard({
  info,
  piers,
  nearbySpecies,
}: {
  info: FishingInfo | null;
  piers: (Pier & { distanceKm: number })[];
  nearbySpecies: NearbySpecies[];
}) {
  return (
    <div className="rounded-2xl bg-surface border border-border p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Pesca en la zona</h3>
        <span className="text-[10px] text-muted uppercase tracking-wide">{info?.basinLabel ?? "General"}</span>
      </div>

      {nearbySpecies.length > 0 && (
        <div className="mb-3 pb-3 border-b border-border/60">
          <p className="text-xs uppercase tracking-wide text-accent mb-1.5">Especies observadas de verdad cerca de aquí</p>
          <ul className="flex flex-col gap-1 mb-1.5">
            {nearbySpecies.map((s) => (
              <li key={s.id} className="flex items-baseline justify-between gap-3 text-sm py-1 border-b border-border/40 last:border-0">
                <span className="font-medium shrink-0">{s.commonName}</span>
                <span className="text-muted text-right">{s.bait}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-muted">
            Basado en registros reales de biodiversidad ciudadana (GBIF / iNaturalist) a menos de 20 km — no es una
            garantía de que piquen hoy, pero sí que esa especie vive de verdad en esta zona.
          </p>
        </div>
      )}

      {info ? (
        <>
          <p className="text-xs text-muted mb-3">
            Conocimiento general de la costa {info.basinLabel.toLowerCase()}, no una medición de esta playa exacta.
          </p>

          <p className="text-xs uppercase tracking-wide text-muted mb-1.5">
            {nearbySpecies.length > 0 ? "Otras especies habituales de la zona (general)" : "Especies habituales y su cebo"}
          </p>
          <ul className="flex flex-col gap-1 mb-3">
            {info.speciesBait.map((sb) => (
              <li key={sb.species} className="flex items-baseline justify-between gap-3 text-sm py-1 border-b border-border/40 last:border-0">
                <span className="font-medium shrink-0">{sb.species}</span>
                <span className="text-muted text-right">{sb.bait}</span>
              </li>
            ))}
          </ul>

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
          <>
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
            <p className="text-[11px] text-muted mt-2">
              Tener un espigón/dique cerca suele ser una buena señal para pescar desde tierra — no es una garantía,
              pero es un dato real (estructura verificable), no una puntuación inventada.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">
            No encontramos espigones o diques registrados cerca, en OpenStreetMap. Eso no significa que no se pueda
            pescar aquí, solo que no hay esa estructura concreta cerca.
          </p>
        )}
      </div>
    </div>
  );
}
