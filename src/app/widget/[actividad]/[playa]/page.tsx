import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActivity, ACTIVITIES } from "@/lib/activities";
import { getLocationBySlug, displayName } from "@/lib/locations";
import { getDailySnapshots } from "@/lib/forecast";
import { scoreCondition } from "@/lib/scoring/engine";
import { buildHourlyScores, findClosestHourIndex } from "@/lib/scoring/dayScores";
import { currentHourMadrid, todayISO } from "@/lib/time";
import { BAND_META } from "@/lib/bandLabels";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { Logo } from "@/components/ui/Logo";
import type { ActivityId, ConditionSnapshot, SkillLevel } from "@/lib/types";

const VALID_ACTIVITIES = new Set(ACTIVITIES.map((a) => a.id));
const VALID_LEVELS = new Set<SkillLevel>(["principiante", "intermedio", "avanzado"]);

// Bajo demanda: el contenido depende del tiempo en directo (igual que
// resultado/page.tsx), no se puede pregenerar de forma útil.
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ actividad: string; playa: string }>;
}): Promise<Metadata> {
  const { actividad, playa } = await params;
  if (!VALID_ACTIVITIES.has(actividad as ActivityId)) return { title: "No encontrado" };
  const location = getLocationBySlug(playa);
  if (!location) return { title: "No encontrado" };
  const activity = getActivity(actividad as ActivityId);
  return { title: `${activity.name} en ${location.name}`, robots: { index: false, follow: false } };
}

/**
 * Widget embebible en iframe para que escuelas/tiendas/negocios locales
 * pongan las condiciones en directo de su playa en su propia web — gratis,
 * sin cuenta, ver /para-negocios para el generador. Navbar/Footer/
 * CookieConsent se ocultan solos aquí (ver useIsWidgetRoute) porque un
 * widget dentro de la web de otro no debe llevar la cabecera/pie/banner de
 * cookies de esta web entera. Deliberadamente compacto: mismo motor y
 * mismos datos que /resultado, pero solo lo esencial — sin tiendas,
 * comunidad, guía de tablas ni el resto de secciones largas.
 */
export default async function WidgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ actividad: string; playa: string }>;
  searchParams: Promise<{ nivel?: string }>;
}) {
  const { actividad, playa } = await params;
  const { nivel } = await searchParams;

  if (!VALID_ACTIVITIES.has(actividad as ActivityId)) notFound();
  const location = getLocationBySlug(playa);
  if (!location) notFound();

  const activityId = actividad as ActivityId;
  const activity = getActivity(activityId);
  const level: SkillLevel = nivel && VALID_LEVELS.has(nivel as SkillLevel) ? (nivel as SkillLevel) : "principiante";

  let snapshots: ConditionSnapshot[];
  try {
    snapshots = await getDailySnapshots(location, todayISO());
  } catch {
    snapshots = [];
  }

  const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";
  const fullResultUrl = `${siteUrl}/resultado?activity=${activityId}&location=${location.slug}&level=${level}&when=now`;

  if (snapshots.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 p-4 text-center bg-surface">
        <p className="text-sm text-muted">Sin datos ahora mismo para {location.name}.</p>
        <a href={fullResultUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent underline">
          Ver en Sea Activity Intelligence →
        </a>
      </div>
    );
  }

  const hourly = buildHourlyScores(snapshots, activityId, level);
  const idx = findClosestHourIndex(hourly, currentHourMadrid());
  const headline = hourly[idx];
  const result = scoreCondition(activityId, level, headline.snapshot);
  const meta = BAND_META[result.band];
  const topReason = result.reasons[0]?.text;

  return (
    <div className="min-h-screen flex flex-col bg-surface p-4 gap-3">
      <a href={fullResultUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group shrink-0">
        <Logo size={18} />
        <span className="text-[11px] font-display font-semibold text-muted group-hover:text-accent transition-colors">
          Sea Activity Intelligence
        </span>
      </a>

      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
        <p className="text-xs text-muted">
          {activity.emoji} {activity.name} · {location.name}
        </p>
        <ScoreBadge score={result.score} band={result.band} size="lg" />
        <p className={`text-xs font-semibold ${meta.textClass}`}>{meta.label}</p>
        {topReason && <p className="text-[11px] text-muted max-w-[220px] leading-snug">{topReason}</p>}
      </div>

      <a
        href={fullResultUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] text-center text-accent hover:underline shrink-0"
      >
        Ver hora a hora en {displayName(location)} →
      </a>
    </div>
  );
}
