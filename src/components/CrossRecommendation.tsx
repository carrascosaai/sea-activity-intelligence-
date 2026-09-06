import { getActivity } from "@/lib/activities";
import { ActivityBadge } from "@/components/ui/ActivityBadge";
import { BandDot } from "@/components/ui/BandDot";
import type { ActivityId, ScoreBand } from "@/lib/types";

export function CrossRecommendation({
  currentActivity,
  currentScore,
  currentBand,
  betterActivity,
  betterScore,
  betterBand,
}: {
  currentActivity: ActivityId;
  currentScore: number;
  currentBand: ScoreBand;
  betterActivity: ActivityId;
  betterScore: number;
  betterBand: ScoreBand;
}) {
  const current = getActivity(currentActivity);
  const better = getActivity(betterActivity);

  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <ActivityBadge emoji={current.emoji} category={current.category} size="sm" />
          {current.name} — {currentScore}/100
          <BandDot band={currentBand} />
        </span>
      </div>
      <p className="text-xs text-muted my-2">Pero...</p>
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="flex items-center gap-2">
          <ActivityBadge emoji={better.emoji} category={better.category} size="sm" />
          {better.name} — {betterScore}/100
          <BandDot band={betterBand} />
        </span>
      </div>
      <p className="text-sm text-foreground/90 mt-3">
        Las condiciones actuales son más adecuadas para {better.shortName.toLowerCase()} que para{" "}
        {current.shortName.toLowerCase()}.
      </p>
    </div>
  );
}
