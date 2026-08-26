import type { BoardShape } from "@/lib/boardGuides";

// Color fijo (no depende de resolver la variable CSS dentro de un atributo
// SVG, que en algunos navegadores/build no se resuelve bien) — mismo verde-
// azulado que el resto del acento de la app.
const ACCENT = "#21d6b8";
const OUTLINE = { fill: `${ACCENT}33`, stroke: ACCENT, strokeWidth: 3 };
const STRINGER = { stroke: `${ACCENT}66`, strokeWidth: 1.5 };
const DETAIL = { fill: `${ACCENT}26`, stroke: `${ACCENT}b3`, strokeWidth: 1.5 };
const DETAIL_LINE = { fill: "none", stroke: `${ACCENT}b3`, strokeWidth: 1.5 };
const MAST = { stroke: `${ACCENT}99`, strokeWidth: 2.5 };
const FOIL = { fill: `${ACCENT}40`, stroke: `${ACCENT}b3`, strokeWidth: 1.5 };

// Siluetas propias esquemáticas (no fotos de producto ni de ninguna marca) —
// cada deporte de tabla usa un equipo físicamente distinto, así que cada uno
// tiene su propia forma, no una silueta genérica reutilizada. Solo para dar
// una idea visual relativa entre niveles, nunca un modelo real.
function BoardShapePath({ shape }: { shape: BoardShape }) {
  switch (shape) {
    case "shortboard":
      // Surf: morro afilado, cola pin/redondeada, tabla estrecha y larga.
      return (
        <>
          <path d="M50 4 C 62 30, 74 70, 72 120 C 70 165, 62 200, 50 216 C 38 200, 30 165, 28 120 C 26 70, 38 30, 50 4 Z" {...OUTLINE} />
          <line x1="50" y1="14" x2="50" y2="206" {...STRINGER} />
        </>
      );
    case "sup":
      // Paddle surf: morro redondeado, cantos casi paralelos, muy larga.
      return (
        <>
          <path d="M50 6 C 72 10, 80 40, 80 110 C 80 175, 72 208, 50 214 C 28 208, 20 175, 20 110 C 20 40, 28 10, 50 6 Z" {...OUTLINE} />
          <line x1="50" y1="16" x2="50" y2="204" {...STRINGER} />
        </>
      );
    case "bodyboard":
      // Corta, ancha, esquinas redondeadas, cola en media luna — se rema tumbado.
      return (
        <>
          <path d="M50 30 C 78 30, 90 55, 90 100 C 90 135, 84 165, 68 178 C 60 184, 40 184, 32 178 C 16 165, 10 135, 10 100 C 10 55, 22 30, 50 30 Z" {...OUTLINE} />
          <path d="M38 176 C 44 168, 56 168, 62 176" {...DETAIL_LINE} />
        </>
      );
    case "twintip":
      // Kitesurf: simétrica arriba/abajo, con marcas de fijaciones (bindings).
      return (
        <>
          <path d="M50 14 C 70 18, 78 45, 78 110 C 78 175, 70 202, 50 206 C 30 202, 22 175, 22 110 C 22 45, 30 18, 50 14 Z" {...OUTLINE} />
          <ellipse cx="50" cy="82" rx="15" ry="8" {...DETAIL} />
          <ellipse cx="50" cy="140" rx="15" ry="8" {...DETAIL} />
        </>
      );
    case "windsurf":
      // Más corta y mucho más ancha que un SUP, con carril de la orza (mástil).
      return (
        <>
          <path d="M50 10 C 80 14, 92 45, 92 100 C 92 150, 82 190, 50 208 C 18 190, 8 150, 8 100 C 8 45, 20 14, 50 10 Z" {...OUTLINE} />
          <line x1="50" y1="30" x2="50" y2="150" {...STRINGER} />
          <ellipse cx="50" cy="150" rx="6" ry="14" {...DETAIL} />
        </>
      );
    case "wingfoil":
      // Tabla corta y gruesa + mástil y ala del foil, debajo.
      return (
        <>
          <path d="M50 34 C 68 36, 76 55, 76 90 C 76 122, 68 142, 50 146 C 32 142, 24 122, 24 90 C 24 55, 32 36, 50 34 Z" {...OUTLINE} />
          <path d="M50 40 C 64 42, 70 58, 70 88" {...DETAIL_LINE} />
          <line x1="50" y1="146" x2="50" y2="190" {...MAST} />
          <ellipse cx="50" cy="196" rx="26" ry="6" {...FOIL} />
        </>
      );
    case "wakeboard":
      // Simétrica, más ancha y corta que un twin-tip, con fijaciones grandes centradas.
      return (
        <>
          <path d="M50 18 C 72 22, 80 48, 80 110 C 80 172, 72 198, 50 202 C 28 198, 20 172, 20 110 C 20 48, 28 22, 50 18 Z" {...OUTLINE} />
          <ellipse cx="50" cy="86" rx="17" ry="10" {...DETAIL} />
          <ellipse cx="50" cy="134" rx="17" ry="10" {...DETAIL} />
        </>
      );
  }
}

export function BoardIllustration({ shape, sizeFactor = 1 }: { shape: BoardShape; sizeFactor?: number }) {
  const height = 96 * sizeFactor;
  return (
    <svg viewBox="0 0 100 220" width={height * (100 / 220)} height={height} className="mx-auto" aria-hidden>
      <BoardShapePath shape={shape} />
    </svg>
  );
}
