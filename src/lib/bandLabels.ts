import type { ScoreBand } from "./types";

export const BAND_META: Record<
  ScoreBand,
  { emoji: string; label: string; textClass: string; bgClass: string; ringClass: string }
> = {
  ideal: {
    emoji: "🟢",
    label: "CONDICIONES IDEALES",
    textClass: "text-score-green",
    bgClass: "bg-score-green/15",
    ringClass: "ring-score-green/40",
  },
  buena: {
    emoji: "🟢",
    label: "BUENAS CONDICIONES",
    textClass: "text-accent",
    bgClass: "bg-accent/15",
    ringClass: "ring-accent/40",
  },
  aceptable: {
    emoji: "🟡",
    label: "CONDICIONES ACEPTABLES",
    textClass: "text-score-amber",
    bgClass: "bg-score-amber/15",
    ringClass: "ring-score-amber/40",
  },
  mala: {
    emoji: "🟠",
    label: "CONDICIONES MALAS",
    textClass: "text-score-orange",
    bgClass: "bg-score-orange/15",
    ringClass: "ring-score-orange/40",
  },
  peligrosa: {
    emoji: "🔴",
    label: "NO RECOMENDADO",
    textClass: "text-score-red",
    bgClass: "bg-score-red/15",
    ringClass: "ring-score-red/40",
  },
};

/** true para las bandas que deben tratarse como "no recomendado" en listados/rankings. */
export function isPoorBand(band: ScoreBand): boolean {
  return band === "mala" || band === "peligrosa";
}

/** Clase Tailwind de fondo sólido por banda — para barras/puntos, no texto. */
export const BAND_BAR_CLASS: Record<ScoreBand, string> = {
  ideal: "bg-score-green",
  buena: "bg-accent",
  aceptable: "bg-score-amber",
  mala: "bg-score-orange",
  peligrosa: "bg-score-red",
};

/** Color hexadecimal por banda — para contextos que no aceptan clases Tailwind (Leaflet/SVG). */
export const BAND_HEX: Record<ScoreBand, string> = {
  ideal: "#2fd06a",
  buena: "#21d6b8",
  aceptable: "#f3ad3d",
  mala: "#f2884a",
  peligrosa: "#f2564a",
};
