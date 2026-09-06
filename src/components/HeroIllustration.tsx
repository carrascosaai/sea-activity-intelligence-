// Ilustración original de cabecera — escena con más profundidad que la
// versión anterior (gaviotas, velero en el horizonte, brillo del sol más
// trabajado) para que se lea como una escena real, no como una forma
// abstracta suelta.
export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 400 160"
      className="w-full h-auto max-h-40"
      role="img"
      aria-label="Ilustración de un velero navegando al atardecer sobre el mar"
    >
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#101a18" />
          <stop offset="100%" stopColor="#0a120f" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hero-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f3ad3d" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#f3ad3d" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f3ad3d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-sun-disc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6c56a" />
          <stop offset="100%" stopColor="#f2884a" />
        </linearGradient>
        <linearGradient id="hero-wave-1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2f9c8c" />
          <stop offset="100%" stopColor="#4a72c9" />
        </linearGradient>
      </defs>

      <rect width="400" height="160" fill="url(#hero-sky)" />
      <circle cx="320" cy="40" r="64" fill="url(#hero-sun)" />
      <circle cx="320" cy="40" r="15" fill="url(#hero-sun-disc)" />

      {/* Gaviotas — un par de trazos en V, el motivo más simple y reconocible de "costa". */}
      <g stroke="#85a0b6" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.55">
        <path d="M40 34c4-4 8-4 12 0 4-4 8-4 12 0" />
        <path d="M78 22c3-3 6-3 9 0 3-3 6-3 9 0" />
      </g>

      {/* Velero navegando en el horizonte. */}
      <g transform="translate(224 76)" opacity="0.92">
        <path d="M0 8h34l-6 4H4Z" fill="#101a18" />
        <path d="M2 8V-20c9 5 15 14 15 20Z" fill="#eaf3fa" opacity="0.92" />
        <path d="M-3 8V-10c-6 4-9 10-9 18Z" fill="#eaf3fa" opacity="0.7" />
        <line x1="2" y1="8" x2="2" y2="-20" stroke="#101a18" strokeWidth="1.2" />
      </g>

      <path
        d="M0 96c22-14 44-14 66 0s44 14 66 0 44-14 66 0 44 14 66 0 44-14 66 0 44 14 70 0v64H0Z"
        fill="url(#hero-wave-1)"
        opacity="0.18"
      />
      <path
        d="M0 116c22-12 44-12 66 0s44 12 66 0 44-12 66 0 44 12 66 0 44-12 66 0 44 12 70 0v44H0Z"
        fill="#4a72c9"
        opacity="0.22"
      />
      <path
        d="M0 134c22-10 44-10 66 0s44 10 66 0 44-10 66 0 44 10 66 0 44-10 66 0 44 10 70 0v26H0Z"
        fill="#2f9c8c"
        opacity="0.3"
      />
    </svg>
  );
}
