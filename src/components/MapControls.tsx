"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ACTIVITIES, SKILL_LEVELS } from "@/lib/activities";
import type { ActivityId, SkillLevel } from "@/lib/types";

export function MapControls({ activity, level }: { activity: ActivityId; level: SkillLevel }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/mapa?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      <select
        value={activity}
        onChange={(e) => update("activity", e.target.value)}
        className="rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      >
        {ACTIVITIES.map((a) => (
          <option key={a.id} value={a.id}>
            {a.emoji} {a.name}
          </option>
        ))}
      </select>
      <select
        value={level}
        onChange={(e) => update("level", e.target.value)}
        className="rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      >
        {SKILL_LEVELS.map((l) => (
          <option key={l.id} value={l.id}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
