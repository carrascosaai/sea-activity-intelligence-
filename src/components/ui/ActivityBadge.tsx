import type { ActivityCategory } from "@/lib/types";

// Antes el emoji de cada deporte iba suelto sobre el fondo — funcional, pero
// se notaba a "prototipo". Un chip circular con tinte por categoría le da
// el mismo golpe de vista con un acabado mucho más cuidado, sin perder la
// distinción real que da el emoji entre 20 deportes (un set de iconos
// genérico no diferencia bien "surf" de "windsurf" de "wingfoil").
const CATEGORY_TINT: Record<ActivityCategory, string> = {
  tabla: "bg-accent/15 ring-accent/30",
  "remo-vela": "bg-accent-2/15 ring-accent-2/30",
  submarinismo: "bg-score-green/15 ring-score-green/30",
  motor: "bg-score-orange/15 ring-score-orange/30",
  otros: "bg-score-amber/15 ring-score-amber/30",
};

const SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "w-7 h-7 text-sm",
  md: "w-9 h-9 text-base",
  lg: "w-14 h-14 text-3xl",
};

export function ActivityBadge({
  emoji,
  category,
  size = "md",
  className = "",
}: {
  emoji: string;
  category: ActivityCategory;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-full ring-1 ${CATEGORY_TINT[category]} ${SIZE[size]} ${className}`}
    >
      <span aria-hidden className="leading-none">
        {emoji}
      </span>
    </span>
  );
}
