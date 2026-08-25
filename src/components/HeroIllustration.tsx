export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 400 160"
      className="w-full h-auto max-h-40"
      role="img"
      aria-label="Ilustración de olas del mar"
    >
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f2438" />
          <stop offset="100%" stopColor="#071019" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hero-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f3ad3d" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f3ad3d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-wave-1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#21d6b8" />
          <stop offset="100%" stopColor="#2f9de0" />
        </linearGradient>
      </defs>

      <rect width="400" height="160" fill="url(#hero-sky)" />
      <circle cx="320" cy="40" r="60" fill="url(#hero-sun)" />
      <circle cx="320" cy="40" r="16" fill="#f3ad3d" opacity="0.85" />

      <path
        d="M0 96c22-14 44-14 66 0s44 14 66 0 44-14 66 0 44 14 66 0 44-14 66 0 44 14 70 0v64H0Z"
        fill="url(#hero-wave-1)"
        opacity="0.18"
      />
      <path
        d="M0 116c22-12 44-12 66 0s44 12 66 0 44-12 66 0 44 12 66 0 44-12 66 0 44 12 70 0v44H0Z"
        fill="#2f9de0"
        opacity="0.22"
      />
      <path
        d="M0 134c22-10 44-10 66 0s44 10 66 0 44-10 66 0 44 10 66 0 44-10 66 0 44 10 70 0v26H0Z"
        fill="#21d6b8"
        opacity="0.3"
      />

      <g transform="translate(150 78) rotate(-14)" opacity="0.95">
        <ellipse cx="0" cy="0" rx="34" ry="9" fill="#eaf3fa" opacity="0.9" />
        <ellipse cx="0" cy="0" rx="34" ry="9" fill="none" stroke="#0f1c2c" strokeWidth="1" opacity="0.15" />
      </g>
    </svg>
  );
}
