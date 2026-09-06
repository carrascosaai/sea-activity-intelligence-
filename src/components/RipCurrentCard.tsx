import type { RipRiskResult } from "@/lib/ripCurrentRisk";

const LEVEL_STYLE: Record<RipRiskResult["level"], { text: string; bg: string; ring: string; dot: string }> = {
  bajo: { text: "text-score-green", bg: "bg-score-green/10", ring: "ring-score-green/30", dot: "bg-score-green" },
  moderado: { text: "text-score-amber", bg: "bg-score-amber/10", ring: "ring-score-amber/30", dot: "bg-score-amber" },
  alto: { text: "text-score-orange", bg: "bg-score-orange/10", ring: "ring-score-orange/30", dot: "bg-score-orange" },
  "muy-alto": { text: "text-score-red", bg: "bg-score-red/10", ring: "ring-score-red/30", dot: "bg-score-red" },
};

export function RipCurrentCard({ risk }: { risk: RipRiskResult }) {
  const style = LEVEL_STYLE[risk.level];

  return (
    <div className={`rounded-xl border p-4 ${style.bg} ring-1 ${style.ring} border-transparent`}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Corrientes de retorno</h3>
        <span className="text-[10px] text-muted uppercase tracking-wide">Estimación</span>
      </div>
      <p className={`text-base font-bold flex items-center gap-2 ${style.text}`}>
        <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${style.dot}`} />
        {risk.label}
      </p>
      <p className="text-sm text-foreground/90 mt-1">{risk.description}</p>
      <p className="text-[11px] text-muted mt-2.5 leading-relaxed">
        Estimación orientativa a partir de la altura y el periodo reales del oleaje (los mismos factores que usa el
        modelo nacional de corrientes de retorno de la NOAA) — no tenemos datos de marea ni la geometría exacta de
        esta playa, así que <strong>no sustituye la bandera del socorrista ni el aviso local</strong>. Ante la duda,
        no te bañes.
      </p>
    </div>
  );
}
