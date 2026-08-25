import type { VisibilityInfo } from "@/lib/types";

const LABEL_COLOR: Record<string, string> = {
  Excepcional: "text-score-green",
  "Muy buena": "text-score-green",
  Buena: "text-score-green",
  Moderada: "text-score-amber",
  Reducida: "text-score-amber",
  Baja: "text-score-red",
};

export function WaterClarityCard({ visibility, locationLabel }: { visibility: VisibilityInfo; locationLabel: string }) {
  const webcamSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`webcam en directo ${locationLabel} playa`)}&tbm=isch`;

  return (
    <div className="rounded-2xl bg-surface border border-border p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Claridad del agua</h3>
        <span className="text-[10px] text-muted uppercase tracking-wide">Estimación por satélite</span>
      </div>

      {visibility.available ? (
        <>
          <p className={`text-lg font-bold ${LABEL_COLOR[visibility.label] ?? "text-foreground"}`}>{visibility.label}</p>
          <p className="text-sm text-muted mt-0.5">{visibility.rangeLabel}</p>
          <p className="text-xs text-muted mt-3 leading-relaxed">
            Basado en la turbidez del agua vista desde satélite (NOAA, dato del{" "}
            {visibility.daysOld === 0 ? "día de hoy" : `hace ${visibility.daysOld} día${visibility.daysOld === 1 ? "" : "s"}`}
            ). Es una estimación regional, no una medición en el punto de inmersión — puede variar por corrientes,
            oleaje reciente o el tipo de fondo, y no se resta de la puntuación.
          </p>
        </>
      ) : (
        <p className="text-sm text-muted mt-1 mb-3">No hay estimación de claridad disponible para esta zona ahora mismo.</p>
      )}

      <a
        href={webcamSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-3"
      >
        📷 Buscar una webcam de la zona para comprobarlo a simple vista →
      </a>
    </div>
  );
}
