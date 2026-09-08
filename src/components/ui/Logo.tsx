// Logotipo real de la app (mismo diseño que el favicon, src/app/icon.svg).
// Rediseñado (sep. 2026) tras feedback directo: la versión anterior (dos
// olas + un sol) era genérica — el tipo de marca de agua que pondría
// cualquier generador de apps por defecto, sin relación real con lo que
// hace el producto. Este diseño es un solo trazo que empieza como una
// señal/pulso de dato (la parte de "intelligence": algo que se mide) y se
// convierte en una ola limpia (la parte de "sea") — la propia forma cuenta
// qué hace la app, no solo "hay agua cerca". Colores fijos (no variables
// CSS, ver BoardIllustration.tsx del mismo motivo): funciona en cualquier
// contexto (favicon, imagen social) sin depender de que se resuelvan.
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
      {/* Señal/pulso — el dato de partida */}
      <path
        d="M7 34h6l4-15 4 30 4-15h5"
        fill="none"
        stroke="#4a72c9"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* La ola en la que se convierte */}
      <path
        d="M30 34c5-11 11-11 16 0s11 11 16 0"
        fill="none"
        stroke="#2f9c8c"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="19" r="2.6" fill="#f3ad3d" />
    </svg>
  );
}
