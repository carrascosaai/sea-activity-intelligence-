import type { ActivityId } from "@/lib/types";

/**
 * Set de iconos propio, uno por deporte — sustituye al emoji suelto que
 * usaba ActivityBadge. El emoji del sistema se veía distinto según el
 * ordenador/SO (y muy "genérico de IA" según feedback directo), y ningún
 * set de iconos genérico (Lucide incluido — comprobado, no tiene ni
 * surfboard, ni kayak, ni kitesurf) distingue bien 20 deportes de tabla y
 * agua distintos entre sí. Mismo lenguaje visual en los 20: trazo (no
 * relleno), 1.75px, esquinas redondeadas, `currentColor` para heredar el
 * tinte de categoría que ya pone ActivityBadge — silueta esquemática, no
 * ilustración detallada (igual criterio que BoardIllustration.tsx).
 */

type IconProps = { className?: string };
const commonProps = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function Surf({ className }: IconProps) {
  // Alta y estrecha (contraste de silueta a propósito con Bodyboard, corta
  // y ancha) — es el rasgo que sobrevive a un tamaño de 18px, no el detalle.
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <path d="M12 2c3 3 5 8 5 13a5 5 0 0 1-10 0c0-5 2-10 5-13Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 4v15" />
    </svg>
  );
}

function PaddleSurf({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <path d="M9 2c2.5 3 3.5 8 3.5 13.5A3.5 3.5 0 0 1 9 19a3.5 3.5 0 0 1-3.5-3.5C5.5 10 6.5 5 9 2Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M16 4l6-2M18.5 3l1.5 4" />
    </svg>
  );
}

function Bodyboard({ className }: IconProps) {
  // Corta y ancha a propósito (a diferencia de Surf, larga y estrecha) — la
  // silueta general tiene que distinguirlos antes que el detalle, que a
  // 18-28px se pierde.
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <path d="M3 10c0-4.5 4-6.5 9-6.5s9 2 9 6.5c0 4.5-3.5 8.5-9 8.5S3 14.5 3 10Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M8 16.5c2 1.4 6 1.4 8 0" />
    </svg>
  );
}

function Kitesurf({ className }: IconProps) {
  // Cometa arriba del todo, lejos de la tabla — es justo esa distancia
  // (cometa alta + líneas largas) lo que la distingue de Wingfoil (ala
  // pegada a las manos + quilla bajo el agua), no el detalle de cada forma.
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <path d="M3 4c4-2.5 14-2.5 18 0-2 2.5-5 3.3-9 3.3S5 6.5 3 4Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 7.3v9.7" />
      <path d="M9 22l3-5 3 5" />
    </svg>
  );
}

function Windsurf({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <path d="M12 2v16" />
      <path d="M12 3c3.2 1 5.3 4.3 5.5 8.3-3.4.6-5.5-.4-5.5-.4V3Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M4 19c2-1.4 4-1.4 6 0s4 1.4 6 0" />
    </svg>
  );
}

function Wingfoil({ className }: IconProps) {
  // El mástil largo + la aleta ancha abajo (la quilla del foil, bajo el
  // agua) es la pista que no tiene ningún otro icono del set.
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <path d="M3 7c2-2.6 6-3.3 9-1.6 3-1.7 7-1 9 1.6-3 1.7-6 2-9 .8-3 1.2-6 .9-9-.8Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 7.5V17" />
      <path d="M7 21h10" />
    </svg>
  );
}

function Kayak({ className }: IconProps) {
  // Un solo remo (no una X) para que no se compacte en una forma rara a
  // tamaño pequeño — dos palas pequeñas en los extremos bastan como pista.
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <path d="M2 14c3-5.5 17-5.5 20 0-3 5.5-17 5.5-20 0Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M4 4l16 11" />
      <path d="M2.5 3l3 2.2M18.5 13.8l3 2.2" />
    </svg>
  );
}

function Remo({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <path d="M5 19 17 5" />
      <path d="M15.5 3.5c1.4-.3 2.7.4 3 1.8.3 1.4-.6 2.4-2 2.7L15 8.5l.5-5Z" />
      <path d="M3 21l2.5-2.5" />
    </svg>
  );
}

function Vela({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <path d="M12 2v16" />
      <path d="M12 3c3.8 1.1 6.5 3.8 6.5 7.5-3.8.6-6.5-1-6.5-1V3Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M3 18c2.5 2 5.5 2 9 2s6.5 0 9-2" />
    </svg>
  );
}

function Buceo({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <rect x="9" y="2" width="6" height="9" rx="2" fill="currentColor" fillOpacity="0.15" />
      <path d="M10 11v3a2 2 0 0 0 4 0v-3" />
      <path d="M6 22c0-4 2.5-6 6-6s6 2 6 6" />
    </svg>
  );
}

function Snorkel({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <path d="M4 11a5 5 0 0 1 10 0v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M14 5.5c2-1 4 0 4 2s-2 3-4 2" />
      <path d="M14.5 2v5.5" />
    </svg>
  );
}

function Apnea({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <path d="M12 2c4 4 5 9 5 13a5 5 0 0 1-10 0c0-4 1-9 5-13Z" />
      <path d="M9 15h6M12 15v6" />
    </svg>
  );
}

function EsquiAcuatico({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <path d="M4 20c2.5-6 4-11 4.5-16" />
      <path d="M6 4h4" />
      <path d="M9 20 20 5" />
      <path d="M20 5c1.5 0 2.5 1 2.5 2.5" />
    </svg>
  );
}

function Wakeboard({ className }: IconProps) {
  // Sin la línea de "chop" encima (Bodyboard ya cubre esa idea) — a tamaño
  // pequeño se compactaba en un borrón. La tabla ancha y simétrica con dos
  // fijaciones es suficiente pista, y no se confunde con Esquí acuático
  // (un único esquí estrecho + cuerda).
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <rect x="3" y="10" width="18" height="4.5" rx="2.25" fill="currentColor" fillOpacity="0.15" />
      <ellipse cx="8.5" cy="12.25" rx="2" ry="1.2" />
      <ellipse cx="15.5" cy="12.25" rx="2" ry="1.2" />
    </svg>
  );
}

function MotoAgua({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <path d="M2 15c1-3 4-5 8-5h6c3 0 5 1.5 6 3-2 3-5 4-9 4H8c-3 0-5-1-6-2Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 10V7c0-1 .5-2 2-2" />
      <path d="M5 20c1-1.5 2.5-1.5 3.5 0M13 20c1-1.5 2.5-1.5 3.5 0" />
    </svg>
  );
}

function Flyboard({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <rect x="7" y="3" width="10" height="4" rx="1.5" />
      <path d="M9 7c-1 3-1.5 6-1 9M15 7c1 3 1.5 6 1 9" />
      <path d="M6 22c1-2 2-3.5 2-5M18 22c-1-2-2-3.5-2-5" />
    </svg>
  );
}

function Pesca({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <path d="M4 21 18 5" />
      <path d="M18 5c2 0 3.5 1 4 3" />
      <path d="M18 5v12" />
      <path d="M18 17a2 2 0 1 1-2.5 2" />
    </svg>
  );
}

function Coasteering({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <path d="M3 16l4-9 3 5 2-3 3 4 3-6 3 9" />
      <path d="M3 20c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" />
    </svg>
  );
}

function Bano({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <path d="M12 3v3" />
      <path d="M4 11c2-4 5-6 8-6s6 2 8 6Z" />
      <path d="M2 15c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6-1.5" strokeDasharray="0" />
      <path d="M2 19c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" />
    </svg>
  );
}

function NatacionAguasAbiertas({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden>
      <circle cx="17" cy="6" r="1.6" fill="currentColor" stroke="none" />
      <path d="M6 12c3-1.5 5-4 8-3.5s3 3 6 2" />
      <path d="M2 17c2-1.3 4-1.3 6 0s4 1.3 6 0 4-1.3 6-1.3" />
      <path d="M2 20.5c2-1.3 4-1.3 6 0s4 1.3 6 0 4-1.3 6-1.3" />
    </svg>
  );
}

export const ACTIVITY_ICONS: Record<ActivityId, (props: IconProps) => React.ReactElement> = {
  surf: Surf,
  "paddle-surf": PaddleSurf,
  bodyboard: Bodyboard,
  kitesurf: Kitesurf,
  windsurf: Windsurf,
  wingfoil: Wingfoil,
  kayak: Kayak,
  remo: Remo,
  vela: Vela,
  buceo: Buceo,
  snorkel: Snorkel,
  apnea: Apnea,
  "esqui-acuatico": EsquiAcuatico,
  wakeboard: Wakeboard,
  "moto-agua": MotoAgua,
  flyboard: Flyboard,
  pesca: Pesca,
  coasteering: Coasteering,
  bano: Bano,
  "natacion-aguas-abiertas": NatacionAguasAbiertas,
};
