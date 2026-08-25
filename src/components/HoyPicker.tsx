"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SKILL_LEVELS } from "@/lib/activities";
import { Chip } from "@/components/ui/Chip";
import { WizardProgress } from "@/components/ui/WizardProgress";
import { LocationSearch } from "@/components/LocationSearch";
import { track } from "@/lib/analytics";
import type { Location, SkillLevel } from "@/lib/types";

export function HoyPicker() {
  const router = useRouter();
  const [step, setStep] = useState<"location" | "level">("location");
  const [location, setLocation] = useState<Location | null>(null);

  function selectLevel(level: SkillLevel) {
    if (!location) return;
    track("skill_selected", { level, context: "hoy" });
    router.push(`/hoy?location=${location.slug}&level=${level}`);
  }

  return (
    <div className="max-w-xl w-full mx-auto px-5 py-8 flex-1 flex flex-col">
      <h1 className="text-2xl font-bold mt-2 mb-6">¿Qué puedo hacer hoy?</h1>
      <WizardProgress steps={["Ubicación", "Nivel"]} currentIdx={step === "location" ? 0 : 1} />

      {step === "location" && (
        <div>
          <h2 className="text-lg font-semibold mb-4">📍 ¿Dónde?</h2>
          <LocationSearch
            onSelect={(loc) => {
              setLocation(loc);
              track("location_selected", { location: loc.slug, context: "hoy" });
              setStep("level");
            }}
            selectedSlug={location?.slug}
          />
        </div>
      )}

      {step === "level" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">👤 ¿Qué nivel tienes?</h2>
            <button onClick={() => setStep("location")} className="text-sm text-muted hover:text-accent cursor-pointer">
              ← Atrás
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {SKILL_LEVELS.map((lvl) => (
              <Chip key={lvl.id} onClick={() => selectLevel(lvl.id)}>
                <span className="text-base font-medium">{lvl.label}</span>
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
