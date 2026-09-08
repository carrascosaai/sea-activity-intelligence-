// Logotipo real de la app (mismo diseño que el favicon, src/app/icon.svg).
// SEGUNDO rediseño (sep. 2026), tras feedback directo de que la primera
// versión (un trazo de pulso convirtiéndose en ola) "es una mierda" — muy
// blanda/orgánica, se leía como garabato abstracto sin más. Este diseño
// es más geométrico y literal a la marca "Intelligence": un anillo de
// radar/sonar (barrido técnico, instrumento midiendo algo) con un punto de
// señal en el hueco, cruzado por una ola limpia de trazo grueso — "un
// sensor escaneando el mar" en vez de una forma libre. Colores fijos (no
// variables CSS, igual que antes): funciona en cualquier contexto
// (favicon, imagen social) sin depender de que se resuelvan.
export function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden>
      <defs>
        <linearGradient id="sai-logo-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#101a18" />
          <stop offset="100%" stopColor="#0a120f" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#sai-logo-bg)" />
      {/* Anillo de radar/sonar — el barrido técnico, "intelligence" */}
      <circle
        cx="32"
        cy="26"
        r="17"
        fill="none"
        stroke="#4a72c9"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeDasharray="80.1 26.7"
        transform="rotate(-90 32 26)"
      />
      {/* Punto de señal en el hueco del anillo */}
      <circle cx="32" cy="9" r="5.2" fill="none" stroke="#f3ad3d" strokeWidth="1.2" opacity="0.4" />
      <circle cx="32" cy="9" r="2.6" fill="#f3ad3d" />
      {/* La ola — "sea" */}
      <path
        d="M6 46c6-7 12-7 18 0s12 7 18 0 12-7 18 0"
        fill="none"
        stroke="#2f9c8c"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
