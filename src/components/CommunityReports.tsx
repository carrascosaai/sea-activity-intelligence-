"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { ACTIVITIES } from "@/lib/activities";
import type { ActivityId } from "@/lib/types";

export interface CommunityReportView {
  id: string;
  activityId: string | null;
  body: string;
  createdAt: string;
}

const ACTIVITY_EMOJI: Partial<Record<ActivityId, string>> = Object.fromEntries(
  ACTIVITIES.map((a) => [a.id, a.emoji])
);

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} d${days === 1 ? "ía" : "ías"}`;
}

export function CommunityReports({
  locationSlug,
  activityId,
  initialReports,
}: {
  locationSlug: string;
  activityId: ActivityId;
  initialReports: CommunityReportView[];
}) {
  const [reports, setReports] = useState(initialReports);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function submit() {
    const trimmed = text.trim();
    if (trimmed.length < 3 || sending) return;
    setSending(true);
    const optimistic: CommunityReportView = {
      id: `local-${Date.now()}`,
      activityId,
      body: trimmed,
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [optimistic, ...prev]);
    setText("");
    setSent(true);
    track("community_report_posted", { location: locationSlug, activity: activityId });
    fetch("/api/community-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationSlug, activityId, text: trimmed }),
    })
      .catch(() => {})
      .finally(() => setSending(false));
  }

  return (
    <div className="rounded-2xl bg-surface border border-border p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Cómo lo ha visto la gente</h3>
        <span className="text-[10px] text-muted uppercase tracking-wide">Comunidad</span>
      </div>
      <p className="text-xs text-muted mb-3">
        Notas reales de quien ha estado en esta playa — a veces el dato no cuenta toda la historia.
      </p>

      {reports.length > 0 ? (
        <ul className="flex flex-col gap-2 mb-3">
          {reports.map((r) => (
            <li key={r.id} className="rounded-xl bg-surface-2 border border-border/70 p-2.5">
              <p className="text-sm">
                {r.activityId && ACTIVITY_EMOJI[r.activityId as ActivityId] && (
                  <span className="mr-1.5">{ACTIVITY_EMOJI[r.activityId as ActivityId]}</span>
                )}
                {r.body}
              </p>
              <p className="text-[11px] text-muted mt-1">{relativeTime(r.createdAt)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted mb-3">Todavía nadie ha dejado una nota aquí — sé el primero.</p>
      )}

      {sent ? (
        <p className="text-xs text-accent">Gracias — tu nota ya es visible para otros usuarios.</p>
      ) : (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={280}
            rows={2}
            placeholder="P. ej.: hoy había bastante resaca aunque el score decía bueno..."
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent resize-none"
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[11px] text-muted">Público, visible para todos — sé respetuoso.</span>
            <button
              type="button"
              onClick={submit}
              disabled={text.trim().length < 3 || sending}
              className="rounded-full bg-accent text-[#04231d] text-xs font-semibold px-3.5 py-1.5 disabled:opacity-40 cursor-pointer"
            >
              Publicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
