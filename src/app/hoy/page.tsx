import Link from "next/link";
import type { Metadata } from "next";
import { HoyPicker } from "@/components/HoyPicker";
import { ActivityRanking } from "@/components/ActivityRanking";
import { ClientAnalyticsPing } from "@/components/ClientAnalyticsPing";
import { SafetyNotice } from "@/components/SafetyNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { getLocationBySlug } from "@/lib/locations";
import { ACTIVITIES } from "@/lib/activities";
import { getDailySnapshots } from "@/lib/forecast";
import { scoreCondition } from "@/lib/scoring/engine";
import { findClosestHourIndex } from "@/lib/scoring/dayScores";
import { currentHourMadrid, todayISO } from "@/lib/time";
import type { ConditionSnapshot, SkillLevel } from "@/lib/types";

// Marca de identidad de ruta: evita que el bundle compilado de esta página
// sea byte-idéntico al de otra ruta con forma similar. Vercel deduplica
// funciones serverless idénticas con un symlink al empaquetar, y crear
// symlinks falla en Windows sin permisos elevados — este export inerte es
// un workaround de build, no afecta a la app en marcha.
export const __routeId = "hoy" as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const location = params.location ? getLocationBySlug(params.location) : undefined;
  return { title: location ? `Qué hacer hoy en ${location.name}` : "¿Qué puedo hacer hoy?" };
}

export default async function HoyPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; level?: string }>;
}) {
  const params = await searchParams;
  const location = params.location ? getLocationBySlug(params.location) : undefined;
  const level = params.level as SkillLevel | undefined;

  if (!location || !level) {
    return <HoyPicker />;
  }

  const dateISO = todayISO();
  let snapshots: ConditionSnapshot[];
  try {
    snapshots = await getDailySnapshots(location, dateISO);
  } catch {
    snapshots = [];
  }

  if (snapshots.length === 0) {
    return (
      <EmptyState
        icon="📡"
        title="No hay datos de previsión disponibles ahora mismo."
        description="Inténtalo de nuevo en unos minutos."
        actionHref="/hoy"
        actionLabel="Volver"
      />
    );
  }

  const idx = findClosestHourIndex(
    snapshots.map((s) => ({ time: s.time, score: 0, band: "peligrosa" as const, snapshot: s })),
    currentHourMadrid()
  );
  const snapshot = snapshots[idx];

  const ranked = ACTIVITIES.map((a) => {
    const result = scoreCondition(a.id, level, snapshot);
    return { activity: a.id, name: a.name, emoji: a.emoji, score: result.score, band: result.band };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="flex-1 flex flex-col max-w-xl w-full mx-auto px-5 py-8">
      <ClientAnalyticsPing event="forecast_viewed" payload={{ context: "hoy", location: location.slug, level }} />
      <div className="flex items-center justify-end mb-6 pt-2">
        <Link href="/hoy" className="text-sm text-muted hover:text-accent transition-colors">
          Cambiar ubicación/nivel
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-1">¿Qué puedo hacer hoy?</h1>
      <p className="text-sm text-muted mb-6">
        📍 {location.name} · 👤 <span className="capitalize">{level}</span>
      </p>

      <ActivityRanking ranked={ranked} locationSlug={location.slug} level={level} />

      <SafetyNotice />
    </div>
  );
}
