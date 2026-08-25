type IconProps = { className?: string };

const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function WindIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common}>
      <path d="M3 8h11a3 3 0 1 0-2.5-4.6" />
      <path d="M3 13h15a3 3 0 1 1-2.5 4.6" />
      <path d="M3 18h8" />
    </svg>
  );
}

export function WaveIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common}>
      <path d="M2 15c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5 2 5 0" />
      <path d="M2 10c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5 2 5 0" opacity="0.45" />
    </svg>
  );
}

export function PeriodIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common}>
      <path d="M3 12c1.2-3 2.8-3 4 0s2.8 3 4 0 2.8-3 4 0 2.8 3 4 0" />
      <path d="M5 5v2M12 4v3M19 5v2" opacity="0.6" />
    </svg>
  );
}

export function WaterTempIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common}>
      <path d="M12 3v9.5" />
      <circle cx="12" cy="17" r="3.2" />
      <path d="M4 19c1.2-1.4 2.8-1.4 4 0s2.8 1.4 4 0" opacity="0.5" />
    </svg>
  );
}

export function AirTempIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function RainIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common}>
      <path d="M7 15a4.5 4.5 0 0 1 .5-9 5.5 5.5 0 0 1 10.6 1.7A3.5 3.5 0 0 1 17 15H7Z" />
      <path d="M8 19l-1 2M12.5 19l-1 2M17 19l-1 2" />
    </svg>
  );
}
