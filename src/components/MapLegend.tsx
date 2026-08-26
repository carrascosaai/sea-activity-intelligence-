import { BAND_HEX } from "@/lib/bandLabels";
import type { ScoreBand } from "@/lib/types";

const ORDER: { band: ScoreBand; label: string }[] = [
  { band: "ideal", label: "Ideal" },
  { band: "buena", label: "Buena" },
  { band: "aceptable", label: "Aceptable" },
  { band: "mala", label: "Mala" },
  { band: "peligrosa", label: "No recom." },
];

export function MapLegend() {
  return (
    <div className="absolute bottom-3 left-3 z-[1000] rounded-xl bg-surface/95 border border-border px-3 py-2 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        {ORDER.map(({ band, label }) => (
          <div key={band} className="flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: BAND_HEX[band], boxShadow: "0 0 0 1.5px rgba(255,255,255,0.5)" }}
            />
            <span className="text-[10px] text-muted whitespace-nowrap">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
