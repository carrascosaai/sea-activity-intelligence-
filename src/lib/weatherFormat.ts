const COMPASS_POINTS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

/** Grados (0-360) a punto cardinal de 16 direcciones, p. ej. 45º -> "NE". */
export function compassDirection(deg: number | null): string | null {
  if (deg == null) return null;
  const idx = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16;
  return COMPASS_POINTS[idx];
}

// Rosa de los vientos clásica de 8 direcciones usada en España (sobre todo
// Mediterráneo/Estrecho): Levante = viento del Este, Poniente = del Oeste,
// etc. Es terminología real y estandarizada, no una etiqueta inventada.
const NAMED_WINDS = ["Tramontana", "Gregal", "Levante", "Xaloc", "Mediodía", "Lebeche", "Poniente", "Mistral"];

/** Grados (0-360) al nombre tradicional del viento, p. ej. 90º -> "Levante". */
export function namedWind(deg: number | null): string | null {
  if (deg == null) return null;
  const idx = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
  return NAMED_WINDS[idx];
}

// Códigos WMO de tiempo (estándar usado por Open-Meteo) -> descripción en
// español. https://open-meteo.com/en/docs (sección "WMO Weather interpretation codes")
const WEATHER_CODE_LABELS: Record<number, string> = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna intensa",
  56: "Llovizna helada ligera",
  57: "Llovizna helada intensa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia intensa",
  66: "Lluvia helada ligera",
  67: "Lluvia helada intensa",
  71: "Nevada ligera",
  73: "Nevada moderada",
  75: "Nevada intensa",
  77: "Granos de nieve",
  80: "Chubascos ligeros",
  81: "Chubascos moderados",
  82: "Chubascos violentos",
  85: "Chubascos de nieve ligeros",
  86: "Chubascos de nieve intensos",
  95: "Tormenta",
  96: "Tormenta con granizo ligero",
  99: "Tormenta con granizo intenso",
};

export function weatherCodeLabel(code: number): string {
  return WEATHER_CODE_LABELS[code] ?? "Condiciones variables";
}
