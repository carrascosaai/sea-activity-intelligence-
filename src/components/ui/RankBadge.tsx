// Círculo numerado con el tono del podio (oro/plata/bronce) — sustituye al
// emoji de medalla (🥇🥈🥉), que varía mucho de estilo entre sistemas
// operativos y queda infantil frente al resto de la interfaz.
const RANK_CLASS = [
  "bg-score-amber/20 text-score-amber ring-score-amber/40",
  "bg-muted/20 text-foreground/80 ring-muted/40",
  "bg-score-orange/20 text-score-orange ring-score-orange/40",
];

export function RankBadge({ index, className = "" }: { index: number; className?: string }) {
  const cls = RANK_CLASS[index] ?? "bg-surface-2 text-muted ring-border";
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full ring-1 text-xs font-bold shrink-0 ${cls} ${className}`}
    >
      {index + 1}
    </span>
  );
}
