"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

/**
 * Los umbrales de scoring (lib/scoring/profiles.ts) son estimaciones — grounded
 * en guías reales del sector donde existen (ver profiles.ts), pero no
 * "medidas". La única forma honesta de validarlos de verdad es con el uso
 * real: este widget es la pieza que lo hace posible en cuanto haya tráfico.
 */
export function FeedbackWidget({
  activity,
  location,
  level,
  when,
  score,
  band,
}: {
  activity: string;
  location: string;
  level: string;
  when: string;
  score: number;
  band: string;
}) {
  const [answered, setAnswered] = useState<"up" | "down" | null>(null);

  function send(helpful: boolean) {
    setAnswered(helpful ? "up" : "down");
    track("recommendation_feedback", { activity, location, level, when, score, band, helpful });
  }

  if (answered) {
    return (
      <div className="rounded-2xl bg-surface-2 border border-border p-4 text-center text-sm text-muted">
        Gracias — nos ayuda a ajustar cómo puntuamos {activity === "bano" ? "el baño" : `${activity}`}.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface-2 border border-border p-4 flex items-center justify-between gap-3">
      <p className="text-sm text-foreground/90">¿Esta recomendación se ajustó a lo que encontraste?</p>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={() => send(true)}
          aria-label="Sí, acertada"
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-lg hover:border-score-green/60 hover:bg-score-green/10 transition-colors cursor-pointer"
        >
          👍
        </button>
        <button
          type="button"
          onClick={() => send(false)}
          aria-label="No, no acertada"
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-lg hover:border-score-red/60 hover:bg-score-red/10 transition-colors cursor-pointer"
        >
          👎
        </button>
      </div>
    </div>
  );
}
