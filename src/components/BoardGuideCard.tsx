import type { BoardGuide } from "@/lib/boardGuides";
import { BoardIllustration } from "@/components/BoardIllustration";

const LEVEL_LABEL: Record<string, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

// Principiante = tabla físicamente más grande (más volumen/flotación) en casi
// todos estos deportes — el tamaño relativo de la ilustración lo refleja.
const SIZE_FACTOR: Record<string, number> = { principiante: 1.15, intermedio: 1, avanzado: 0.85 };

export function BoardGuideCard({ guide, activityName }: { guide: BoardGuide; activityName: string }) {
  const shopUrl = `https://www.google.com/search?q=${encodeURIComponent(`comprar o alquilar ${guide.searchQuery}`)}&tbm=shop`;

  return (
    <div className="rounded-2xl bg-surface border border-border p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Qué tabla usar</h3>
        <span className="text-[10px] text-muted uppercase tracking-wide">Orientativo</span>
      </div>
      <p className="text-xs text-muted mb-3">
        Ilustración esquemática propia, no un modelo ni marca concreta — solo para hacerte una idea de la forma y el
        tamaño relativo entre niveles.
      </p>

      <div className="grid grid-cols-3 gap-2">
        {guide.specs.map((spec) => (
          <div key={spec.level} className="rounded-xl bg-surface-2 border border-border/70 p-2.5 text-center">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-1">{LEVEL_LABEL[spec.level]}</p>
            <BoardIllustration shape={guide.shape} sizeFactor={SIZE_FACTOR[spec.level]} />
            <p className="text-xs font-medium mt-1.5">{spec.type}</p>
            {spec.sizeLabel !== "—" && <p className="text-[11px] text-muted mt-0.5">{spec.sizeLabel}</p>}
            {spec.volumeLabel !== "—" && <p className="text-[11px] text-muted">{spec.volumeLabel}</p>}
          </div>
        ))}
      </div>

      <ul className="flex flex-col gap-1 mt-3">
        {guide.specs.map((spec) => (
          <li key={spec.level} className="text-xs text-foreground/90">
            <span className="font-medium">{LEVEL_LABEL[spec.level]}:</span> {spec.note}
          </li>
        ))}
      </ul>

      <a
        href={shopUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-3"
      >
        🛒 Ver modelos reales de {activityName.toLowerCase()} en tiendas →
      </a>
    </div>
  );
}
