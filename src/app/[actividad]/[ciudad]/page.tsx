import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMunicipalityBySlug, SEO_ACTIVITIES } from "@/lib/municipalities";
import { getActivity } from "@/lib/activities";
import { getDailySnapshots } from "@/lib/forecast";
import { scoreCondition } from "@/lib/scoring/engine";
import { findClosestHourIndex, computeBestWindow, buildHourlyScores } from "@/lib/scoring/dayScores";
import { currentHourMadrid, formatHourLabel, todayISO } from "@/lib/time";
import { BAND_META } from "@/lib/bandLabels";
import { BandPill } from "@/components/ui/ScoreBadge";
import { SafetyNotice } from "@/components/SafetyNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ActivityId, SkillLevel } from "@/lib/types";

// Dinámica a propósito: son ~1.500 combinaciones posibles (8 actividades ×
// ~190 municipios), y el contenido depende del tiempo en directo — pre-
// generarlas todas en el build sería lento, frágil (llamadas a APIs
// externas en build) y quedarían obsoletas al momento. Se sirven bajo
// demanda, ya se benefician de la misma caché que el resto de la app.
export const dynamicParams = true;

const LEVELS_TO_SHOW: SkillLevel[] = ["principiante", "intermedio", "avanzado"];

function isSeoActivity(id: string): id is (typeof SEO_ACTIVITIES)[number] {
  return (SEO_ACTIVITIES as readonly string[]).includes(id);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ actividad: string; ciudad: string }>;
}): Promise<Metadata> {
  const { actividad, ciudad } = await params;
  if (!isSeoActivity(actividad)) return { title: "No encontrado" };
  const municipality = getMunicipalityBySlug(ciudad);
  if (!municipality) return { title: "No encontrado" };

  const activity = getActivity(actividad as ActivityId);
  const title = `${activity.name} en ${municipality.name} hoy — condiciones y mejor hora`;
  const description = `¿Se puede hacer ${activity.name.toLowerCase()} en ${municipality.name} ahora mismo? Viento, oleaje y la mejor hora de hoy, con datos reales, en las ${municipality.beaches.length} playas de la zona.`;
  return { title, description, openGraph: { title, description } };
}

export default async function ActividadCiudadPage({
  params,
}: {
  params: Promise<{ actividad: string; ciudad: string }>;
}) {
  const { actividad, ciudad } = await params;
  if (!isSeoActivity(actividad)) notFound();
  const municipality = getMunicipalityBySlug(ciudad);
  if (!municipality) notFound();

  const activityId = actividad as ActivityId;
  const activity = getActivity(activityId);
  const dateISO = todayISO();
  const hour = currentHourMadrid();

  const beachResults = (
    await Promise.all(
      municipality.beaches.map(async (beach) => {
        try {
          const snapshots = await getDailySnapshots(beach, dateISO);
          if (snapshots.length === 0) return null;
          const idx = findClosestHourIndex(
            snapshots.map((s) => ({ time: s.time, score: 0, band: "peligrosa" as const, snapshot: s })),
            hour
          );
          const snapshot = snapshots[idx];
          const scoresByLevel = Object.fromEntries(
            LEVELS_TO_SHOW.map((level) => [level, scoreCondition(activityId, level, snapshot)])
          ) as Record<SkillLevel, ReturnType<typeof scoreCondition>>;
          const bestWindow = computeBestWindow(buildHourlyScores(snapshots, activityId, "intermedio"));
          return { beach, snapshot, scoresByLevel, bestWindow };
        } catch {
          return null;
        }
      })
    )
  ).filter((r): r is NonNullable<typeof r> => r !== null);

  if (beachResults.length === 0) {
    return (
      <EmptyState
        icon="📡"
        title={`No se han podido obtener datos para ${activity.name.toLowerCase()} en ${municipality.name} ahora mismo.`}
        description="Inténtalo de nuevo en unos minutos."
        actionHref="/"
        actionLabel="Volver al inicio"
      />
    );
  }

  beachResults.sort((a, b) => b.scoresByLevel.intermedio.score - a.scoresByLevel.intermedio.score);
  const headline = beachResults[0];
  const headlineMeta = BAND_META[headline.scoresByLevel.intermedio.band];

  return (
    <div className="flex-1 max-w-xl w-full mx-auto px-5 py-8">
      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-wide text-muted">
          {municipality.name} · {municipality.province}
        </p>
        <h1 className="text-2xl font-bold mt-1">
          {activity.emoji} {activity.name} en {municipality.name}
        </h1>
        <p className="text-sm text-muted mt-1">
          Ahora mismo, en {municipality.beaches.length} playa{municipality.beaches.length === 1 ? "" : "s"} de la zona
        </p>
      </div>

      <div className={`rounded-3xl border ${headlineMeta.ringClass} ${headlineMeta.bgClass} p-6 flex flex-col items-center text-center gap-2`}>
        <BandPill band={headline.scoresByLevel.intermedio.band} />
        <p className="text-4xl font-bold tabular-nums">{headline.scoresByLevel.intermedio.score}/100</p>
        <p className="text-sm font-medium">{headline.beach.name}</p>
        {headline.bestWindow && (
          <p className="text-xs text-muted">
            Mejor momento hoy: {formatHourLabel(headline.bestWindow.startTime)}–{formatHourLabel(headline.bestWindow.endTime)}
          </p>
        )}
        <Link
          href={`/resultado?activity=${activityId}&location=${headline.beach.slug}&level=intermedio&when=now`}
          className="mt-2 text-sm text-accent hover:underline font-medium"
        >
          Ver recomendación completa →
        </Link>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">Según tu nivel ({headline.beach.name})</h2>
        <div className="grid grid-cols-3 gap-2">
          {LEVELS_TO_SHOW.map((level) => {
            const r = headline.scoresByLevel[level];
            const meta = BAND_META[r.band];
            return (
              <div key={level} className="rounded-xl bg-surface-2 border border-border px-3 py-3 text-center">
                <p className="text-[11px] text-muted capitalize">{level}</p>
                <p className={`text-lg font-bold ${meta.textClass}`}>{r.score}</p>
              </div>
            );
          })}
        </div>
      </div>

      {beachResults.length > 1 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">
            Todas las playas de {municipality.name}
          </h2>
          <div className="flex flex-col gap-2">
            {beachResults.map(({ beach, scoresByLevel }) => {
              const r = scoresByLevel.intermedio;
              const meta = BAND_META[r.band];
              return (
                <Link
                  key={beach.slug}
                  href={`/resultado?activity=${activityId}&location=${beach.slug}&level=intermedio&when=now`}
                  className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 hover:border-accent/50 transition-colors"
                >
                  <span className="font-medium">{beach.name}</span>
                  <span className={`font-bold ${meta.textClass}`}>
                    {meta.emoji} {r.score}/100
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">Otros deportes en {municipality.name}</h2>
        <div className="flex flex-wrap gap-2">
          {SEO_ACTIVITIES.filter((a) => a !== activityId).map((a) => (
            <Link
              key={a}
              href={`/${a}/${municipality.slug}`}
              className="text-xs rounded-full border border-border px-3 py-1.5 text-muted hover:text-foreground hover:border-accent/50 transition-colors"
            >
              {getActivity(a as ActivityId).emoji} {getActivity(a as ActivityId).name}
            </Link>
          ))}
        </div>
      </div>

      <SafetyNotice />
    </div>
  );
}
