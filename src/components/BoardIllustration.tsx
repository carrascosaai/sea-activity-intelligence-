import type { BoardShape } from "@/lib/boardGuides";

// Siluetas propias esquemáticas (no fotos de producto ni de ninguna marca) —
// solo para dar una idea visual de la forma relativa entre niveles, nunca
// un modelo real. Un mismo viewBox vertical para las cuatro, con un `path`
// distinto por familia de forma.
const PATHS: Record<BoardShape, string> = {
  // Punta afilada arriba (morro), cola redondeada/pin abajo — tabla de surf.
  shortboard: "M50 4 C 62 30, 74 70, 72 120 C 70 165, 62 200, 50 216 C 38 200, 30 165, 28 120 C 26 70, 38 30, 50 4 Z",
  // Morro redondeado, cantos casi paralelos, cola redondeada — paddle/windsurf.
  sup: "M50 6 C 72 10, 80 40, 80 110 C 80 175, 72 208, 50 214 C 28 208, 20 175, 20 110 C 20 40, 28 10, 50 6 Z",
  // Simétrica arriba/abajo — twin-tip de kite.
  twintip: "M50 14 C 70 18, 78 45, 78 110 C 78 175, 70 202, 50 206 C 30 202, 22 175, 22 110 C 22 45, 30 18, 50 14 Z",
  // Parecida a twin-tip pero algo más ancha y corta — wakeboard.
  wakeboard: "M50 18 C 72 22, 80 48, 80 110 C 80 172, 72 198, 50 202 C 28 198, 20 172, 20 110 C 20 48, 28 22, 50 18 Z",
};

export function BoardIllustration({ shape, sizeFactor = 1 }: { shape: BoardShape; sizeFactor?: number }) {
  const height = 96 * sizeFactor;
  return (
    <svg viewBox="0 0 100 220" width={height * (100 / 220)} height={height} className="mx-auto" aria-hidden>
      <path d={PATHS[shape]} fill="var(--color-accent, #21d6b8)" fillOpacity="0.18" stroke="var(--color-accent, #21d6b8)" strokeWidth="3" />
      <line x1="50" y1="20" x2="50" y2="200" stroke="var(--color-accent, #21d6b8)" strokeOpacity="0.35" strokeWidth="1.5" />
    </svg>
  );
}
