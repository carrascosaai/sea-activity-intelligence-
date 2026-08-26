"use client";

import { useRouter } from "next/navigation";
import { getActivity } from "@/lib/activities";
import type { ActivityId } from "@/lib/types";

export function TopSpotsControls({ activity, activities }: { activity: ActivityId; activities: ActivityId[] }) {
  const router = useRouter();

  return (
    <select
      value={activity}
      onChange={(e) => router.push(`/mejores-sitios?activity=${e.target.value}`)}
      className="rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
    >
      {activities.map((id) => {
        const a = getActivity(id);
        return (
          <option key={id} value={id}>
            {a.emoji} {a.name}
          </option>
        );
      })}
    </select>
  );
}
