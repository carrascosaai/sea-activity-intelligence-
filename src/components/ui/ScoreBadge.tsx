import { BAND_HEX, BAND_META } from "@/lib/bandLabels";
import type { ScoreBand } from "@/lib/types";

const SIZE_PX: Record<"sm" | "md" | "lg", number> = { sm: 48, md: 68, lg: 128 };
const STROKE_W: Record<"sm" | "md" | "lg", number> = { sm: 7, md: 7, lg: 6.5 };
const TEXT_CLASS: Record<"sm" | "md" | "lg", string> = { sm: "text-sm", md: "text-xl", lg: "text-4xl" };

export function ScoreBadge({ score, band, size = "md" }: { score: number; band: ScoreBand; size?: "sm" | "md" | "lg" }) {
  const meta = BAND_META[band];
  const px = SIZE_PX[size];
  const strokeW = STROKE_W[size];
  const r = 50 - strokeW / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100);

  return (
    <div className="relative shrink-0" style={{ width: px, height: px }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth={strokeW} />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={BAND_HEX[band]}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold tabular-nums ${meta.textClass} ${TEXT_CLASS[size]}`}>{score}</span>
      </div>
    </div>
  );
}

export function BandPill({ band }: { band: ScoreBand }) {
  const meta = BAND_META[band];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${meta.bgClass} ${meta.textClass}`}>
      <span>{meta.emoji}</span>
      {meta.label}
    </span>
  );
}
