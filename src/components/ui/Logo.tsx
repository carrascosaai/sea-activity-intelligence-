// Logotipo real de la app (mismo diseño que el favicon, src/app/icon.svg) —
// antes se usaba el emoji 🌊 suelto en cabeceras y pie de página, lo cual
// desentonaba con el icono real de la pestaña del navegador. Un solo sitio
// para el símbolo de marca, reutilizado en todas partes.
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
      <path
        d="M8 40c4-5 10-5 14 0s10 5 14 0 10-5 14 0 10 5 14 0"
        fill="none"
        stroke="#2f9c8c"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 50c4-5 10-5 14 0s10 5 14 0 10-5 14 0 10 5 14 0"
        fill="none"
        stroke="#4a72c9"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <circle cx="46" cy="16" r="6" fill="#f3ad3d" />
    </svg>
  );
}
