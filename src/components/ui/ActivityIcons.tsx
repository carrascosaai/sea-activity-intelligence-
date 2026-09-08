import type { ActivityId } from "@/lib/types";

/**
 * Set de iconos propio, uno por deporte — sustituye al emoji suelto que
 * usaba ActivityBadge. TERCER rediseño (sep. 2026): las dos versiones
 * anteriores (trazo fino, relleno al 12-15% de opacidad) eran ilegibles al
 * tamaño real del badge (14-18px) — el relleno era demasiado tenue para
 * verse y el trazo de 1.75 en un viewBox de 24 se queda en ~1px real,
 * pura sopa de líneas grises. Este set cambia de enfoque: silueta sólida
 * a opacidad completa (mismo criterio de contraste que el logo, que sí
 * funcionó — trazo grueso, sin sutilezas), y un único accesorio muy
 * reconocible por deporte en vez de variar el trazo del propio tablero
 * (remo, vela, cometa, botella de buceo, sombrilla...). Los deportes de
 * tabla (el grupo más numeroso, 6 iconos con el mismo tinte de color)
 * llevan cada uno un accesorio distinto — es lo único que sobrevive a
 * 14px, no la forma del tablero en sí.
 */

type IconProps = { className?: string };
const svgProps = { viewBox: "0 0 24 24", "aria-hidden": true as const };

function Surf({ className }: IconProps) {
  // Tabla alta y estrecha con quilla — silueta de referencia del grupo,
  // sin accesorio (todas las demás de tabla se distinguen de esta por lo
  // que le añaden encima).
  return (
    <svg {...svgProps} className={className}>
      <path
        fill="currentColor"
        d="M12 1.8c2.9 3.4 4.6 8.3 4.6 12.6a4.6 4.6 0 0 1-9.2 0c0-4.3 1.7-9.2 4.6-12.6Z"
      />
      <path fill="currentColor" d="M11.3 18.6h1.4l-.4 3.6a.35.35 0 0 1-.6 0l-.4-3.6Z" />
    </svg>
  );
}

function PaddleSurf({ className }: IconProps) {
  // Tabla más pequeña y baja + una pala que sobresale claramente por
  // encima, con una pala ancha en la punta — que la pala salga del
  // contorno de la tabla en vez de quedar dentro es lo que la hace
  // legible a 14px (antes se fundía con el óvalo de la tabla).
  return (
    <svg {...svgProps} className={className}>
      <path
        fill="currentColor"
        d="M2.3 16.3c0-3.3 3.5-5.2 8-5.2s8 1.9 8 5.2-3.5 5.7-8 5.7-8-2.4-8-5.7Z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        d="M18.5 1.8L7.8 16.2"
      />
      <path
        fill="currentColor"
        d="M20.9.5a1.9 1.9 0 0 1 1.4 3.3l-2.9 2.6-2.8-2.5L19.6 1a1.9 1.9 0 0 1 1.3-.5Z"
      />
    </svg>
  );
}

function Bodyboard({ className }: IconProps) {
  // Corta y muy ancha, esquinas redondeadas — todo lo contrario de Surf a
  // propósito, sin ningún accesorio (se tumba en la tabla, no lleva nada).
  return (
    <svg {...svgProps} className={className}>
      <path
        fill="currentColor"
        d="M2.2 10.2c0-4.4 4.3-6.4 9.8-6.4s9.8 2 9.8 6.4c0 5-4.3 9.6-9.8 9.6s-9.8-4.6-9.8-9.6Z"
      />
    </svg>
  );
}

function Kitesurf({ className }: IconProps) {
  // Cometa en forma de arco muy profundo (silueta de "C", no de bandera)
  // + dos líneas que convergen en un punto (la barra de control) — al
  // juntarse en un punto y no volver a abrirse en una tabla, no se
  // confunde con una copa/reloj de arena como en la versión anterior.
  return (
    <svg {...svgProps} className={className}>
      <path
        fill="currentColor"
        d="M1.3 3.4C4 .3 8.2-.5 11 1c.6.3.6 1.2 0 1.5-1.7.9-2.8 2.5-2.8 4.5 0 .6-.7 1-1.2.6C4.4 6.3 2.4 5.1 1.3 4.4a.6.6 0 0 1 0-1Z"
      />
      <path
        fill="currentColor"
        d="M22.7 3.4C20 .3 15.8-.5 13 1c-.6.3-.6 1.2 0 1.5 1.7.9 2.8 2.5 2.8 4.5 0 .6.7 1 1.2.6 2.6-1.3 4.6-2.5 5.7-3.2a.6.6 0 0 0 0-1Z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M8.6 7.6L12 19.5m3.4-11.9L12 19.5"
      />
      <circle cx="12" cy="20.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

function Windsurf({ className }: IconProps) {
  // Vela triangular de bordes RECTOS y punta afilada (no redondeada) —
  // el contraste angular/recto contra el óvalo redondeado de Wingfoil es
  // lo que las separa a tamaño pequeño, más que cualquier detalle
  // interior. Botavara (barra horizontal) como pista adicional exclusiva
  // de este icono.
  return (
    <svg {...svgProps} className={className}>
      <path fill="currentColor" d="M11.3 1.3h1.4v18.6h-1.4z" />
      <path fill="currentColor" d="M12.7 2h8 v9.4l-8-2.6z" />
      <rect x="8.6" y="9.6" width="7.6" height="1.6" rx="0.8" fill="currentColor" />
      <ellipse cx="12" cy="21" rx="5.6" ry="1.3" fill="currentColor" />
    </svg>
  );
}

function Wingfoil({ className }: IconProps) {
  // El ala de mano ocupa casi todo el icono a propósito — es la única
  // pista que sobrevive a 14px. Óvalo ancho y muy REDONDEADO (curvas en
  // vez de líneas rectas) para contrastar con el triángulo de picos
  // rectos de Windsurf — sin mástil largo ni pieza intermedia entre el
  // ala y la tabla (eso creaba un "tallo" que la hacía parecer una seta).
  return (
    <svg {...svgProps} className={className}>
      <path
        fill="currentColor"
        d="M12 1.4c5.9 0 10.6 3.5 11.6 8.4a1 1 0 0 1-1.4 1.1c-3-1.4-6.5-2.1-10.2-2.1s-7.2.7-10.2 2.1a1 1 0 0 1-1.4-1.1C1.4 4.9 6.1 1.4 12 1.4Z"
      />
      <rect x="10.8" y="13.5" width="2.4" height="4.2" rx="1.2" fill="currentColor" />
      <ellipse cx="12" cy="20.5" rx="5.2" ry="1.3" fill="currentColor" />
    </svg>
  );
}

function Kayak({ className }: IconProps) {
  // Casco fino y simétrico (puntas a los dos lados) + una pala de DOS
  // palas (una en cada extremo) — la doble pala es lo que distingue el
  // kayak del remo de una sola pala.
  return (
    <svg {...svgProps} className={className}>
      <path
        fill="currentColor"
        d="M1.5 14c3.2-4.4 8-6.6 10.5-6.6S18.8 9.6 22 14c-3.2 2.2-6.6 3.1-10.5 3.1S4.7 16.2 1.5 14Z"
      />
      <path
        fill="currentColor"
        d="M4.6 1.8a1.15 1.15 0 0 1 1.6 1.6L8 5.2 6.6 6.6 4.8 4.8 3 6.6A1.15 1.15 0 0 1 1.4 5L4.6 1.8Z"
      />
      <path fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" d="M5.4 5.4l13 13" />
      <path
        fill="currentColor"
        d="M19.4 22.2a1.15 1.15 0 0 1-1.6-1.6L16 18.8l1.4-1.4 1.8 1.8 1.8-1.8a1.15 1.15 0 0 1 1.6 1.6l-3.2 3.2Z"
      />
    </svg>
  );
}

function Remo({ className }: IconProps) {
  // Dos remos de una sola pala cruzados en X — pictograma clásico de
  // remo, deliberadamente sin casco de barco para no confundirse con
  // Kayak (que sí lo lleva) ni con Vela (que lleva vela).
  return (
    <svg {...svgProps} className={className}>
      <path fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 4l16 16" />
      <path fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M20 4L4 20" />
      <ellipse cx="4.3" cy="4.3" rx="2.6" ry="1.7" fill="currentColor" transform="rotate(45 4.3 4.3)" />
      <ellipse cx="19.7" cy="4.3" rx="2.6" ry="1.7" fill="currentColor" transform="rotate(-45 19.7 4.3)" />
    </svg>
  );
}

function Vela({ className }: IconProps) {
  // Vela grande e inclinada (sin botavara, a diferencia de Windsurf) +
  // casco de barco con la proa en punta a un lado y la popa plana al
  // otro — un casco asimétrico de barco de verdad, no la base ancha y
  // simétrica de una tabla, es lo que la separa de Windsurf y Wingfoil.
  return (
    <svg {...svgProps} className={className}>
      <path fill="currentColor" d="M10.6 2.3h1.5l-.7 12.9h-.1z" />
      <path
        fill="currentColor"
        d="M11.6 3c4.4.9 7.4 5 7.6 9.7-4.6.9-7.6-.7-7.6-.7V3Z"
      />
      <path
        fill="currentColor"
        d="M2 15.8h20c-.5 1.1-1.7 1.1-2.9 1.1H4.9C3.7 16.9 2.5 16.9 2 15.8Z"
      />
      <path
        fill="currentColor"
        d="M3.3 17.6h17.4c-1 2.4-4.5 4.1-8.7 4.1s-7.7-1.7-8.7-4.1Z"
      />
    </svg>
  );
}

function Buceo({ className }: IconProps) {
  // Botella de buceo (cilindro con válvula) — silueta que no se parece a
  // nada más del set, ni de lejos.
  return (
    <svg {...svgProps} className={className}>
      <rect x="8.2" y="6.2" width="7.6" height="15.3" rx="3.4" fill="currentColor" />
      <rect x="10.2" y="2.3" width="3.6" height="4.4" rx="1" fill="currentColor" />
      <rect x="11.1" y="0.6" width="1.8" height="2.2" rx="0.7" fill="currentColor" />
      <path fill="currentColor" d="M4.6 21.5c0-3.4 2.2-5.3 3.6-6l1 2.6c-1.4.7-2.3 1.7-2.3 3.4H4.6Z" />
    </svg>
  );
}

function Snorkel({ className }: IconProps) {
  // Gafas de máscara (óvalo ancho) + tubo en J subiendo — el tubo curvo
  // es la pista que no comparte con Buceo (sin tubo, con botella) ni con
  // Apnea (sin nada en la cara, solo aleta).
  return (
    <svg {...svgProps} className={className}>
      <path
        fill="currentColor"
        d="M2.5 12.5c0-3.9 3.1-6.3 7-6.3s7 2.4 7 6.3-3.1 6.5-7 6.5-7-2.6-7-6.5Z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        d="M15 6.2c2.6-1.2 5 .2 5 2.6s-2.2 3.6-4.6 2.7"
      />
    </svg>
  );
}

function Apnea({ className }: IconProps) {
  // Monoaleta: una única aleta grande en forma de abanico/cola de
  // sirena — forma que no aparece en ningún otro icono del set.
  return (
    <svg {...svgProps} className={className}>
      <rect x="10.4" y="1.5" width="3.2" height="13" rx="1.6" fill="currentColor" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M12 12.5c4.4 0 8 3.6 9.2 8.4.2.9-.7 1.6-1.5 1.1-2.7-1.7-5.2-2.3-7.7-2.3s-5 .6-7.7 2.3c-.8.5-1.7-.2-1.5-1.1 1.2-4.8 4.8-8.4 9.2-8.4Zm0 4.3-2.1 4.9c.7-.1 1.4-.2 2.1-.2s1.4.1 2.1.2L12 16.8Z"
      />
    </svg>
  );
}

function EsquiAcuatico({ className }: IconProps) {
  // Un único esquí muy fino y largo + tirador en triángulo — la cuerda
  // con tirador es la pista de "deporte a remolque" (comparte código
  // visual con Wakeboard) pero el esquí único y estrecho lo distingue de
  // la tabla ancha de Wakeboard.
  return (
    <svg {...svgProps} className={className}>
      <path
        fill="currentColor"
        d="M9.4 22.3c-.6 0-1-.6-.8-1.1L14 4.2c.4-1.2 2.2-1 2.3.3l1.4 16.3c.1.9-.6 1.5-1.4 1.5H9.4Z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        d="M12.5 4.5C9 3 6 2.3 3.2 2.8"
      />
      <rect x="1.6" y="1.5" width="2.6" height="5.4" rx="1.3" fill="currentColor" />
    </svg>
  );
}

function Wakeboard({ className }: IconProps) {
  // Tabla ancha simétrica con las dos puntas curvadas hacia arriba
  // ("twin-tip") + tirador de cuerda en una esquina — el tirador es lo
  // que la separa de Bodyboard (misma idea de tabla ancha, pero sin
  // remolque).
  return (
    <svg {...svgProps} className={className}>
      <path
        fill="currentColor"
        d="M3 15.5c1-2.2 3-3.8 4.4-3.2 1.6-1 3-1.4 4.6-1.4s3 .4 4.6 1.4c1.4-.6 3.4 1 4.4 3.2-2.6 2.3-6 3.2-9 3.2s-6.4-.9-9-3.2Z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        d="M16 10c1.8-2.6 3.4-4.6 5.4-5.8"
      />
      <rect x="19.6" y="1.8" width="2.6" height="5.2" rx="1.3" fill="currentColor" transform="rotate(28 20.9 4.4)" />
    </svg>
  );
}

function MotoAgua({ className }: IconProps) {
  // Vehículo compacto (casco + asiento + manillar) — la única silueta
  // "de máquina" con bulto de asiento del grupo motor, distinta de las
  // tablas finas de Esquí/Wakeboard y del cohete de Flyboard.
  return (
    <svg {...svgProps} className={className}>
      <path
        fill="currentColor"
        d="M1.5 15.8c0-3 3.3-5 8-5 2 0 3-.9 4.3-2.1 1.6-1.5 3.6-2.3 5.5-1.6 1.8.7 2.7 2.7 2.2 5-.8 3.7-4.6 6.4-10 6.4-5.6 0-10-1.1-10-2.7Z"
      />
      <rect x="10.5" y="4.5" width="2.2" height="4.4" rx="1.1" fill="currentColor" transform="rotate(-18 11.6 6.7)" />
    </svg>
  );
}

function Flyboard({ className }: IconProps) {
  // Botas sobre una plataforma con dos chorros de agua disparando hacia
  // abajo — el único icono del set con algo apuntando "hacia abajo bajo
  // los pies", nada más se le parece.
  return (
    <svg {...svgProps} className={className}>
      <rect x="6" y="2" width="12" height="4.6" rx="1.6" fill="currentColor" />
      <path
        fill="currentColor"
        d="M8.4 15.6l-2.6 6.8c-.3.8.6 1.5 1.3.9l3.4-2.7 1.5 3c.3.7 1.3.7 1.6 0l1.5-3 3.4 2.7c.7.6 1.6-.1 1.3-.9l-2.6-6.8c-.6-1.5-1.9-2.4-3.4-2.4H11.8c-1.5 0-2.8.9-3.4 2.4Z"
      />
    </svg>
  );
}

function Pesca({ className }: IconProps) {
  // Caña en diagonal + sedal curvo terminando en un pez pequeño — el pez
  // es una silueta inconfundible que no aparece en ningún otro icono.
  return (
    <svg {...svgProps} className={className}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M3 6l14-4.5M17 1.5c3 1.7 3.6 8 2 14.5"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M12.4 21.3c-2.4 0-4.4-1.2-5.6-2.2 1.2-1 3.2-2.2 5.6-2.2 1.3 0 2.4.6 3.2 1.2l2-1.7v5.4l-2-1.7c-.8.6-1.9 1.2-3.2 1.2Zm-3.1-2.2a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Z"
      />
    </svg>
  );
}

function Coasteering({ className }: IconProps) {
  // Acantilado en zigzag saliendo del agua — lectura inmediata de
  // "costa rocosa", la única silueta angulosa/de roca de todo el set.
  return (
    <svg {...svgProps} className={className}>
      <path
        fill="currentColor"
        d="M2 17l3.2-8.5 2.6 4 2-6.5 2.7 5.5 2.3-9 3 10.5 2.3-3 1.9 7Z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        d="M2 20.3c2.2-1.5 4.4-1.5 6.6 0s4.4 1.5 6.6 0 4.4-1.5 6.6 0"
      />
    </svg>
  );
}

function Bano({ className }: IconProps) {
  // Sombrilla de playa — símbolo universal de "playa/baño", muy distinto
  // de cualquier tabla, barco o figura del resto del set.
  return (
    <svg {...svgProps} className={className}>
      <path
        fill="currentColor"
        d="M12 1.5c4.7 0 8.5 3.9 8.9 8.9.1.9-.6 1.4-1.3 1.1L12 8.3l-7.6 3.2c-.7.3-1.4-.2-1.3-1.1.4-5 4.2-8.9 8.9-8.9Z"
      />
      <path fill="currentColor" d="M11.2 8v13.2a.8.8 0 0 0 1.6 0V8h-1.6Z" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M8.5 21.3c1 .8 2 .8 3 0"
      />
    </svg>
  );
}

function NatacionAguasAbiertas({ className }: IconProps) {
  // Figura nadando a crol (cabeza + brazo extendido) sobre el agua — la
  // única figura humana del set, para no confundirse con la sombrilla
  // (objeto, no persona) de Baño.
  return (
    <svg {...svgProps} className={className}>
      <circle cx="16.3" cy="5.3" r="2.3" fill="currentColor" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        d="M13.6 8.2L6 11.5m6-2.3 3 5-4 3"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        d="M1.5 17.3c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6-1.4M1.5 21c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6-1.4"
      />
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
