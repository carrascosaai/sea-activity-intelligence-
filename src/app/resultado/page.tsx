import Link from "next/link";
import type { Metadata } from "next";
import { getActivity, ACTIVITIES } from "@/lib/activities";
import { displayName, getLocationBySlug } from "@/lib/locations";
import { getDailySnapshots } from "@/lib/forecast";
import { buildHourlyScores, computeBestWindow, findClosestHourIndex } from "@/lib/scoring/dayScores";
import { scoreCondition } from "@/lib/scoring/engine";
import {
  currentHourMadrid,
  daysFromToday,
  formatDateLabel,
  formatHourLabel,
  hourFromISO,
  isLowConfidenceDate,
  todayISO,
  tomorrowISO,
} from "@/lib/time";
import type { ActivityId, SkillLevel, VisibilityInfo, WhenMode } from "@/lib/types";
import { BAND_META } from "@/lib/bandLabels";
import { ScoreBadge, BandPill } from "@/components/ui/ScoreBadge";
import { ConditionsGrid } from "@/components/ConditionsGrid";
import { HourlyComparison } from "@/components/HourlyComparison";
import { CrossRecommendation } from "@/components/CrossRecommendation";
import { SafetyNotice } from "@/components/SafetyNotice";
import { ClientAnalyticsPing } from "@/components/ClientAnalyticsPing";
import { EmptyState } from "@/components/ui/EmptyState";
import { WaterClarityCard } from "@/components/WaterClarityCard";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { NoaaVisibilityProvider } from "@/lib/providers/noaaVisibility";
import { shopsNear, googleMapsSearchUrl } from "@/lib/shops";
import { getShopRatingSummaries } from "@/lib/shopRatings";
import { NearbyShops, type NearbyShopView } from "@/components/NearbyShops";

const VALID_ACTIVITIES = new Set(ACTIVITIES.map((a) => a.id));
const VALID_LEVELS = new Set<SkillLevel>(["principiante", "intermedio", "avanzado"]);
const UNDERWATER_ACTIVITIES = new Set<ActivityId>(["buceo", "snorkel", "apnea"]);
// Actividades sin equipo que tenga sentido alquilar (bañarse, nadar, pescar,
// coasteering) — para esas no mostramos la sección de tiendas, ver
// lib/shops.ts / scripts/generate-shops.mjs para qué actividades sí cubrimos.
const NO_RENTAL_ACTIVITIES = new Set<ActivityId>(["bano", "pesca", "coasteering", "natacion-aguas-abiertas"]);
const visibilityProvider = new NoaaVisibilityProvider();

function resolveDate(when: WhenMode, dateParam?: string): string {
  if (when === "tomorrow") return tomorrowISO();
  if (when === "date" && dateParam) return dateParam;
  return todayISO();
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ activity?: string; location?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const activityId = params.activity as ActivityId;
  const location = params.location ? getLocationBySlug(params.location) : undefined;
  if (!activityId || !VALID_ACTIVITIES.has(activityId) || !location) {
    return { title: "Resultado" };
  }
  const activity = getActivity(activityId);
  return { title: `${activity.name} en ${location.name}` };
}

export default async function ResultadoPage({
  searchParams,
}: {
  searchParams: Promise<{ activity?: string; location?: string; level?: string; when?: string; date?: string }>;
}) {
  const params = await searchParams;
  const activityId = params.activity as ActivityId;
  const level = params.level as SkillLevel;
  const when = (params.when as WhenMode) ?? "now";
  const locationSlug = params.location;

  const location = locationSlug ? getLocationBySlug(locationSlug) : undefined;
  const validParams = activityId && VALID_ACTIVITIES.has(activityId) && level && VALID_LEVELS.has(level) && location;

  if (!validParams || !location) {
    return (
      <EmptyState
        icon="🤔"
        title="Faltan datos para calcular una recomendación."
        actionHref="/"
        actionLabel="Volver al inicio"
      />
    );
  }

  const dateISO = resolveDate(when, params.date);
  const activity = getActivity(activityId);
  const showClarity = UNDERWATER_ACTIVITIES.has(activityId);

  // La claridad del agua es un extra informativo (ver WaterClarityCard): si falla,
  // nunca debe tumbar la página de resultado — solo se oculta la tarjeta.
  const visibilityPromise: Promise<VisibilityInfo | null> = showClarity
    ? visibilityProvider.getInfo(location.lat, location.lon).catch(() => null)
    : Promise.resolve(null);

  const showShops = !NO_RENTAL_ACTIVITIES.has(activityId);
  const nearbyShopsRaw = showShops ? shopsNear(location.lat, location.lon, { activityId, radiusKm: 15, limit: 5 }) : [];

  let snapshots;
  let visibility: VisibilityInfo | null;
  let shopRatings: Record<string, { avg: number; count: number }>;
  try {
    [snapshots, visibility, shopRatings] = await Promise.all([
      getDailySnapshots(location, dateISO),
      visibilityPromise,
      getShopRatingSummaries(nearbyShopsRaw.map((s) => s.slug)),
    ]);
  } catch (err) {
    console.error("[resultado] fallo al obtener datos", err);
    return (
      <EmptyState
        icon="📡"
        title="No se han podido obtener datos meteorológicos ahora mismo."
        description="Inténtalo de nuevo en unos minutos."
        actionHref="/"
        actionLabel="Volver al inicio"
      />
    );
  }

  if (snapshots.length === 0) {
    return (
      <EmptyState
        icon="🗓️"
        title="Para esa fecha, el modelo de oleaje todavía no tiene datos."
        description={`El máximo real son unos 14 días vista. Prueba con una fecha más cercana a ${location.name}.`}
        actionHref="/"
        actionLabel="Volver al inicio"
      />
    );
  }

  const nearbyShops: NearbyShopView[] = nearbyShopsRaw.map((s) => ({
    slug: s.slug,
    name: s.name,
    distanceKm: Math.round(s.distanceKm * 10) / 10,
    phone: s.phone,
    website: s.website,
    openingHours: s.openingHours,
    mapsUrl: googleMapsSearchUrl(s),
    ratingAvg: shopRatings[s.slug]?.avg ?? null,
    ratingCount: shopRatings[s.slug]?.count ?? 0,
  }));

  const hourly = buildHourlyScores(snapshots, activityId, level);
  const bestWindow = computeBestWindow(hourly);

  const headlineIdx =
    when === "now"
      ? findClosestHourIndex(hourly, currentHourMadrid())
      : findClosestHourIndex(hourly, bestWindow ? hourFromISO(bestWindow.startTime) : 12);
  const headline = hourly[headlineIdx];
  const headlineMeta = BAND_META[headline.band];

  const crossScores = ACTIVITIES.map((a) => {
    const result = scoreCondition(a.id, level, headline.snapshot);
    return { activity: a.id, name: a.name, emoji: a.emoji, score: result.score, band: result.band };
  }).sort((a, b) => b.score - a.score);

  const bestAlternative = crossScores.find((c) => c.activity !== activityId);
  const showCrossRecommendation =
    bestAlternative && bestAlternative.score - headline.score >= 12 && bestAlternative.score >= 60;

  const lowConfidence = isLowConfidenceDate(dateISO);

  return (
    <div className="flex-1 flex flex-col max-w-xl w-full mx-auto px-5 py-8">
      <ClientAnalyticsPing
        event="recommendation_viewed"
        payload={{ activity: activityId, location: location.slug, level, when, score: headline.score }}
      />
      <div className="flex items-center justify-between mb-6 pt-2">
        <Link href="/" className="text-sm text-muted hover:text-accent transition-colors">
          ← Nueva búsqueda
        </Link>
        <span className="text-xs text-muted capitalize">{formatDateLabel(dateISO)}</span>
      </div>

      {lowConfidence && (
        <div className="rounded-xl bg-surface-2 border border-border px-3.5 py-2.5 mb-4 text-xs text-muted flex items-start gap-2">
          <span>📅</span>
          <span>
            Faltan {daysFromToday(dateISO)} días — a esta distancia el pronóstico es orientativo, no
            exacto. Merece la pena mirarlo (mejor que no saber nada), pero conviene volver a
            comprobarlo más cerca de la fecha.
          </span>
        </div>
      )}

      <div className="text-center mb-2 animate-fade-up">
        <p className="text-xs uppercase tracking-wide text-muted">{location.name}</p>
        <h1 className="text-2xl font-bold mt-1">
          {activity.emoji} {activity.name}
        </h1>
        <p className="text-sm text-muted capitalize">{level}</p>
      </div>

      <div
        className={`rounded-3xl border ${headlineMeta.ringClass} ${headlineMeta.bgClass} p-6 mt-4 flex flex-col items-center text-center gap-3 shadow-2xl shadow-black/20 animate-fade-up`}
      >
        <BandPill band={headline.band} />
        <ScoreBadge score={headline.score} band={headline.band} size="lg" />
        {when === "now" ? (
          <p className="text-sm font-medium">Ahora · {formatHourLabel(headline.time)}</p>
        ) : (
          bestWindow && (
            <p className="text-sm font-medium">
              {formatHourLabel(bestWindow.startTime)} — {formatHourLabel(bestWindow.endTime)}
            </p>
          )
        )}
        <div className="w-full mt-2">
          <ConditionsGrid snapshot={headline.snapshot} />
        </div>
      </div>

      {showClarity && visibility && (
        <div className="mt-6">
          <WaterClarityCard visibility={visibility} locationLabel={displayName(location)} />
        </div>
      )}

      <div className="mt-6 animate-fade-up">
        <h3 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">¿Por qué?</h3>
        <ul className="flex flex-col gap-1.5">
          {headline.snapshot &&
            scoreCondition(activityId, level, headline.snapshot).reasons.map((r, i) => (
              <li key={i} className={`text-sm flex items-start gap-2 ${r.type === "negative" ? "text-score-red" : r.type === "positive" ? "text-score-green" : "text-muted"}`}>
                <span>{r.type === "negative" ? "✗" : "✓"}</span>
                <span>{r.text}</span>
              </li>
            ))}
        </ul>
      </div>

      {bestWindow && (
        <div className="mt-6 rounded-2xl bg-surface-2 border border-border p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted">
            Mejor momento {when === "tomorrow" ? "mañana" : when === "date" ? "ese día" : "hoy"}
          </p>
          <p className="text-base font-semibold mt-1">
            {formatHourLabel(bestWindow.startTime)} — {formatHourLabel(bestWindow.endTime)}
          </p>
          <p className="text-sm text-accent font-medium">{bestWindow.avgScore}/100</p>
        </div>
      )}

      {showShops && (
        <div className="mt-6">
          <NearbyShops shops={nearbyShops} activityName={activity.name} />
        </div>
      )}

      <div className="mt-6">
        <HourlyComparison hourly={hourly} highlightTime={headline.time} />
      </div>

      {showCrossRecommendation && bestAlternative && (
        <div className="mt-6">
          <CrossRecommendation
            currentActivity={activityId}
            currentScore={headline.score}
            currentBand={headline.band}
            betterActivity={bestAlternative.activity}
            betterScore={bestAlternative.score}
            betterBand={bestAlternative.band}
          />
        </div>
      )}

      <div className="mt-6">
        <FeedbackWidget
          activity={activity.name}
          location={location.slug}
          level={level}
          when={when}
          score={headline.score}
          band={headline.band}
        />
      </div>

      <SafetyNotice />
    </div>
  );
}
