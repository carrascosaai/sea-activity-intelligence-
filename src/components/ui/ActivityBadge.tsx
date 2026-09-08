import type { ActivityCategory, ActivityId } from "@/lib/types";
import { ACTIVITY_ICONS } from "@/components/ui/ActivityIcons";

// Antes el emoji de cada deporte iba suelto sobre el fondo — funcional,
// pero se veía distinto según el ordenador/SO y a "prototipo hecho con
// IA" según feedback directo. Un chip circular con tinte por categoría +
// icono propio (ver ActivityIcons.tsx) da el mismo golpe de vista visual
// pero con trazo consistente en todas partes, no la lotería del emoji del
// sistema — sin perder la distinción real entre 20 deportes (un set de
// iconos genérico como Lucide no tiene ni surfboard ni kayak).
const CATEGORY_TINT: Record<ActivityCategory, string> = {
  tabla: "bg-accent/15 ring-accent/30 text-accent",
  "remo-vela": "bg-accent-2/15 ring-accent-2/30 text-accent-2",
  submarinismo: "bg-score-green/15 ring-score-green/30 text-score-green",
  motor: "bg-score-orange/15 ring-score-orange/30 text-score-orange",
  otros: "bg-score-amber/15 ring-score-amber/30 text-score-amber",
};

const SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-14 h-14",
};

const ICON_SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "w-[14px] h-[14px]",
  md: "w-[18px] h-[18px]",
  lg: "w-7 h-7",
};

export function ActivityBadge({
  activityId,
  category,
  size = "md",
  className = "",
}: {
  activityId: ActivityId;
  category: ActivityCategory;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = ACTIVITY_ICONS[activityId];
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-full ring-1 ${CATEGORY_TINT[category]} ${SIZE[size]} ${className}`}
    >
      <Icon className={ICON_SIZE[size]} />
    </span>
  );
}
