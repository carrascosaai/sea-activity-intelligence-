// Para las playas sin cámara verificada e insertada (la inmensa mayoría —
// ver lib/webcams.ts): en vez de no ofrecer nada, un enlace de búsqueda real.
// No es una cámara nuestra, es honesto sobre eso, pero da a cualquiera un
// camino de un clic para intentar encontrar una.
export function WebcamSearchLink({ locationLabel }: { locationLabel: string }) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`webcam en directo ${locationLabel} playa`)}&tbm=isch`;

  return (
    <a
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-2xl bg-surface border border-border p-4 hover:border-accent/40 transition-colors"
    >
      <span className="text-xl">📷</span>
      <span className="text-sm">
        <span className="block font-medium">Buscar una cámara en directo de esta zona</span>
        <span className="block text-xs text-muted mt-0.5">
          No tenemos una cámara verificada para esta playa — esto busca en Google.
        </span>
      </span>
    </a>
  );
}
