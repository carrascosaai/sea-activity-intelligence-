"use client";

import { useMemo, useState } from "react";
import { LocationSearch } from "@/components/LocationSearch";
import { ACTIVITIES } from "@/lib/activities";
import type { Location, SkillLevel } from "@/lib/types";
import { Check, Copy } from "lucide-react";

const LEVELS: { id: SkillLevel; label: string }[] = [
  { id: "principiante", label: "Principiante" },
  { id: "intermedio", label: "Intermedio" },
  { id: "avanzado", label: "Avanzado" },
];

const SIZES = [
  { id: "compacto", label: "Compacto", w: 260, h: 220 },
  { id: "tarjeta", label: "Tarjeta", w: 320, h: 280 },
];

export function WidgetGenerator() {
  const [location, setLocation] = useState<Location | null>(null);
  const [activityId, setActivityId] = useState(ACTIVITIES[0].id);
  const [level, setLevel] = useState<SkillLevel>("principiante");
  const [size, setSize] = useState(SIZES[0]);
  const [copied, setCopied] = useState(false);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const widgetPath = location ? `/widget/${activityId}/${location.slug}?nivel=${level}` : null;
  const embedCode = useMemo(() => {
    if (!widgetPath) return "";
    return `<iframe src="${siteUrl}${widgetPath}" width="${size.w}" height="${size.h}" style="border:0;border-radius:12px;" loading="lazy" title="Condiciones en directo"></iframe>`;
  }, [widgetPath, siteUrl, size]);

  function copy() {
    if (!embedCode) return;
    navigator.clipboard
      .writeText(embedCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">1. Tu playa</label>
          <LocationSearch onSelect={setLocation} selectedSlug={location?.slug} />
        </div>

        <div>
          <label htmlFor="widget-activity" className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">
            2. Actividad
          </label>
          <select
            id="widget-activity"
            value={activityId}
            onChange={(e) => setActivityId(e.target.value as typeof activityId)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
          >
            {ACTIVITIES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.emoji} {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">3. Nivel de tus clientes</label>
          <div className="flex gap-2">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLevel(l.id)}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  level === l.id ? "bg-accent text-[#04231d]" : "bg-surface-2 text-muted hover:text-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">4. Tamaño</label>
          <div className="flex gap-2">
            {SIZES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSize(s)}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  size.id === s.id ? "bg-accent text-[#04231d]" : "bg-surface-2 text-muted hover:text-foreground"
                }`}
              >
                {s.label} ({s.w}×{s.h})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-muted uppercase tracking-wide">Vista previa</label>
        <div className="rounded-xl border border-border bg-surface-2 p-4 flex items-center justify-center min-h-[240px]">
          {widgetPath ? (
            <iframe
              key={embedCode}
              src={widgetPath}
              width={size.w}
              height={size.h}
              style={{ border: 0, borderRadius: 12 }}
              loading="lazy"
              title="Vista previa del widget"
            />
          ) : (
            <p className="text-sm text-muted text-center px-6">Busca tu playa para ver la vista previa aquí.</p>
          )}
        </div>

        {embedCode && (
          <>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide">Código para pegar en tu web</label>
            <div className="relative">
              <pre className="rounded-xl border border-border bg-surface-2 p-3 text-[11px] text-muted overflow-x-auto whitespace-pre-wrap break-all">
                {embedCode}
              </pre>
              <button
                type="button"
                onClick={copy}
                className="absolute top-2 right-2 rounded-full bg-surface border border-border p-2 text-muted hover:text-accent transition-colors cursor-pointer"
                aria-label="Copiar código"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-score-green" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
