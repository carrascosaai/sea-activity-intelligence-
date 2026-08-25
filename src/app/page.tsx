"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ACTIVITIES, CATEGORY_LABEL, CATEGORY_ORDER, SKILL_LEVELS } from "@/lib/activities";
import { Chip } from "@/components/ui/Chip";
import { WizardProgress } from "@/components/ui/WizardProgress";
import { LocationSearch } from "@/components/LocationSearch";
import { HeroIllustration } from "@/components/HeroIllustration";
import { track } from "@/lib/analytics";
import type { ActivityId, Location, SkillLevel, WhenMode } from "@/lib/types";
import { maxForecastDateISO, todayISO } from "@/lib/time";

type Step = "activity" | "location" | "level" | "when";
const STEPS: Step[] = ["activity", "location", "level", "when"];
const STEP_LABEL: Record<Step, string> = {
  activity: "Actividad",
  location: "Ubicación",
  level: "Nivel",
  when: "Cuándo",
};

export default function Home() {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [activity, setActivity] = useState<ActivityId | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [level, setLevel] = useState<SkillLevel | null>(null);
  const [customDate, setCustomDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const step = STEPS[stepIdx];

  function goToResult(when: WhenMode, dateISO?: string) {
    if (!activity || !location || !level) return;
    const params = new URLSearchParams({ activity, location: location.slug, level, when });
    if (dateISO) params.set("date", dateISO);
    track("forecast_viewed", { activity, location: location.slug, level, when });
    router.push(`/resultado?${params.toString()}`);
  }

  function selectActivity(id: ActivityId) {
    setActivity(id);
    track("activity_selected", { activity: id });
    setStepIdx(1);
  }

  function selectLocation(loc: Location) {
    setLocation(loc);
    track("location_selected", { location: loc.slug });
    setStepIdx(2);
  }

  function selectLevel(lvl: SkillLevel) {
    setLevel(lvl);
    track("skill_selected", { level: lvl });
    setStepIdx(3);
  }

  return (
    <div className="flex-1 flex flex-col max-w-xl w-full mx-auto px-5 py-8 relative">
      {stepIdx === 0 && (
        <div className="-mx-5 -mt-8 mb-2 overflow-hidden animate-fade-up" aria-hidden>
          <HeroIllustration />
        </div>
      )}
      <header className="mb-6 relative">
        <h1 className="text-3xl font-bold mt-1 text-balance leading-tight">¿Qué puedes hacer en el mar ahora mismo?</h1>
        <p className="text-sm text-muted mt-2">
          Analizamos el viento, el oleaje y el tiempo de {ACTIVITIES.length} deportes en toda la costa española para
          decirte qué actividad es mejor, dónde y cuándo.
        </p>
      </header>

      {stepIdx === 0 && (
        <Link
          href="/cerca-de-mi"
          className="mb-6 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-accent/15 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <span className="text-xl">📍</span>
            <span>
              <span className="block text-sm font-semibold">Usar mi ubicación</span>
              <span className="block text-xs text-muted">Lo mejor cerca de ti, ahora mismo</span>
            </span>
          </span>
          <span className="text-accent text-sm">→</span>
        </Link>
      )}

      <WizardProgress steps={STEPS.map((s) => STEP_LABEL[s])} currentIdx={stepIdx} />

      <div className="flex-1">
        {step === "activity" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">¿Qué quieres hacer?</h2>
            <div className="flex flex-col gap-6">
              {CATEGORY_ORDER.map((cat) => (
                <div key={cat}>
                  <p className="text-xs uppercase tracking-wide text-muted mb-2">{CATEGORY_LABEL[cat]}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ACTIVITIES.filter((a) => a.category === cat).map((a) => (
                      <Chip key={a.id} selected={activity === a.id} onClick={() => selectActivity(a.id)} className="py-3">
                        <span className="text-xl mr-2">{a.emoji}</span>
                        <span className="text-sm font-medium">{a.name}</span>
                      </Chip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "location" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">¿Dónde?</h2>
              <button onClick={() => setStepIdx(0)} className="text-sm text-muted hover:text-accent cursor-pointer">
                ← Atrás
              </button>
            </div>
            <LocationSearch onSelect={selectLocation} selectedSlug={location?.slug} />
            <Link href="/mapa" className="block text-center text-xs text-accent mt-3 hover:underline">
              Ver todas en el mapa →
            </Link>
          </div>
        )}

        {step === "level" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">¿Qué nivel tienes?</h2>
              <button onClick={() => setStepIdx(1)} className="text-sm text-muted hover:text-accent cursor-pointer">
                ← Atrás
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {SKILL_LEVELS.map((lvl) => (
                <Chip key={lvl.id} selected={level === lvl.id} onClick={() => selectLevel(lvl.id)}>
                  <span className="text-base font-medium">{lvl.label}</span>
                </Chip>
              ))}
            </div>
          </div>
        )}

        {step === "when" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">¿Cuándo?</h2>
              <button onClick={() => setStepIdx(2)} className="text-sm text-muted hover:text-accent cursor-pointer">
                ← Atrás
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Chip onClick={() => goToResult("now")}>
                <span className="text-base font-medium">Ahora</span>
              </Chip>
              <Chip onClick={() => goToResult("today")}>
                <span className="text-base font-medium">Hoy</span>
              </Chip>
              <Chip onClick={() => goToResult("tomorrow")}>
                <span className="text-base font-medium">Mañana</span>
              </Chip>
              <Chip selected={showDatePicker} onClick={() => setShowDatePicker(true)}>
                <span className="text-base font-medium">Elegir fecha</span>
              </Chip>
              {showDatePicker && (
                <div className="pl-1">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      min={todayISO()}
                      max={maxForecastDateISO()}
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
                    />
                    <button
                      disabled={!customDate}
                      onClick={() => goToResult("date", customDate)}
                      className="rounded-xl bg-accent text-[#04231d] font-semibold px-5 disabled:opacity-40 cursor-pointer"
                    >
                      Ver
                    </button>
                  </div>
                  <p className="text-xs text-muted mt-2">
                    Hasta 7 días vista, el máximo real del modelo de oleaje. A partir del 4º día el
                    pronóstico es orientativo, no exacto — mejor que nada, pero conviene
                    reconfirmarlo más cerca de la fecha.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
