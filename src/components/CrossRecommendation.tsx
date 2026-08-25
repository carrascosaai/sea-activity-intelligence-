import { getActivity } from "@/lib/activities";
import { BAND_META } from "@/lib/bandLabels";
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
  const currentMeta = BAND_META[currentBand];
  const betterMeta = BAND_META[betterBand];

  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
      <div className="flex items-center justify-between text-sm">
        <span>
          {currentMeta.emoji} {current.name} — {currentScore}/100
        </span>
      </div>
      <p className="text-xs text-muted my-2">Pero...</p>
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>
          {betterMeta.emoji} {better.name} — {betterScore}/100
        </span>
      </div>
      <p className="text-sm text-foreground/90 mt-3">
        Las condiciones actuales son más adecuadas para {better.shortName.toLowerCase()} que para{" "}
        {current.shortName.toLowerCase()}.
      </p>
    </div>
  );
}
