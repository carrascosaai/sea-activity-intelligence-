"use client";

import { useState } from "react";
import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { WizardProgress } from "@/components/ui/WizardProgress";
import { BAND_META } from "@/lib/bandLabels";
import { ACTIVITIES, SKILL_LEVELS } from "@/lib/activities";
import { track } from "@/lib/analytics";
import type { ScoreBand, SkillLevel } from "@/lib/types";

interface NearbyResult {
  slug: string;
  name: string;
  municipality: string | null;
  distanceKm: number;
  activity: string;
  score: number;
  band: ScoreBand;
  bestWindow: { start: string; end: string } | null;
}

type Status = "level" | "locating" | "denied" | "unsupported" | "error" | "results";

const MEDALS = ["🥇", "🥈", "🥉"];

function activityMeta(id: string) {
  return ACTIVITIES.find((a) => a.id === id) ?? { emoji: "🌊", name: id };
}

export function NearMeFinder() {
  const [level, setLevel] = useState<SkillLevel | null>(null);
  const [status, setStatus] = useState<Status>("level");
  const [results, setResults] = useState<NearbyResult[]>([]);

  function selectLevel(lvl: SkillLevel) {
    setLevel(lvl);
    track("skill_selected", { level: lvl, context: "cerca-de-mi" });
  }

  function requestLocation() {
    if (!level) return;
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const params = new URLSearchParams({
            lat: String(pos.coords.latitude),
            lon: String(pos.coords.longitude),
            level,
          });
          const res = await fetch(`/api/nearby?${params.toString()}`);
          const data = await res.json();
          setResults(data.results ?? []);
          setStatus("results");
          // No se registra la posición real, solo que se usó la función (ver /privacidad).
          track("forecast_viewed", { context: "cerca-de-mi", level, resultsCount: data.results?.length ?? 0 });
        } catch {
          setStatus("error");
        }
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }

  return (
    <div className="max-w-xl w-full mx-auto px-5 py-8 flex-1 flex flex-col">
      <h1 className="text-2xl font-bold mt-2 mb-1">¿Qué puedo hacer cerca de mí?</h1>
      <p className="text-sm text-muted mb-6">Tu posición, ahora mismo, comparando todas las playas cercanas.</p>

      {status !== "results" && <WizardProgress steps={["Nivel", "Ubicación"]} currentIdx={level ? 1 : 0} />}

      {status === "level" && (
        <div className="grid grid-cols-1 gap-3">
          {SKILL_LEVELS.map((lvl) => (
            <Chip key={lvl.id} selected={level === lvl.id} onClick={() => selectLevel(lvl.id)}>
              <span className="text-base font-medium">{lvl.label}</span>
            </Chip>
          ))}
          {level && (
            <button
              onClick={requestLocation}
              className="mt-2 rounded-2xl bg-accent text-[#04231d] font-semibold py-4 text-base hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
            >
              📍 Usar mi ubicación
            </button>
          )}
          <Link href="/" className="text-center text-sm text-muted hover:text-accent mt-2">
            O prefiero buscar una playa manualmente →
          </Link>
        </div>
      )}

      {status === "locating" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="text-4xl animate-pulse">📍</span>
          <p className="text-sm text-muted">Localizándote y comparando las playas cercanas...</p>
        </div>
      )}

      {(status === "denied" || status === "unsupported" || status === "error") && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
          <span className="text-4xl">📍</span>
          <p className="text-base font-semibold">
            {status === "denied" && "No hemos podido acceder a tu ubicación."}
            {status === "unsupported" && "Tu navegador no admite geolocalización."}
            {status === "error" && "No hemos podido obtener tu ubicación ahora mismo."}
          </p>
          <p className="text-sm text-muted max-w-xs">
            {status === "denied"
              ? "Puedes activarlo en los ajustes de permisos de tu navegador, o buscar tu playa a mano."
              : "Prueba de nuevo en un momento, o busca tu playa a mano."}
          </p>
          <div className="flex gap-3 mt-2">
            <button onClick={requestLocation} className="text-sm text-accent hover:underline cursor-pointer">
              Reintentar
            </button>
            <Link href="/" className="text-sm text-accent hover:underline">
              Buscar manualmente
            </Link>
          </div>
        </div>
      )}

      {status === "results" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">
              Nivel: <span className="capitalize text-foreground">{level}</span>
            </p>
            <button onClick={() => setStatus("level")} className="text-sm text-accent hover:underline cursor-pointer">
              Cambiar
            </button>
          </div>

          {results.length === 0 ? (
            <p className="text-sm text-muted text-center py-12">
              No hemos encontrado playas con datos disponibles cerca de tu posición.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map((r, i) => {
                const act = activityMeta(r.activity);
                const meta = BAND_META[r.band];
                return (
                  <Link
                    key={`${r.slug}-${r.activity}`}
                    href={`/resultado?activity=${r.activity}&location=${r.slug}&level=${level}&when=now`}
                    className="rounded-2xl border border-border bg-surface px-4 py-3.5 hover:border-accent/50 transition-colors block"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2.5">
                        <span className="text-lg">{MEDALS[i] ?? "•"}</span>
                        <span className="font-medium">
                          {act.emoji} {act.name}
                        </span>
                      </span>
                      <span className={`font-bold ${meta.textClass}`}>{r.score}/100</span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-xs text-muted">
                      <span>
                        {r.name}
                        {r.municipality && r.municipality !== r.name ? ` · ${r.municipality}` : ""} —{" "}
                        {r.distanceKm < 1 ? "menos de 1 km" : `${r.distanceKm} km`}
                      </span>
                      {r.bestWindow && (
                        <span>
                          Mejor: {r.bestWindow.start}–{r.bestWindow.end}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
