export interface Webcam {
  /** ID de vídeo de YouTube fijo (cámara 24/7 con un único ID persistente). */
  youtubeVideoId: string;
  source: string;
}

/**
 * Cámaras reales en directo, verificadas manualmente (nombre del vídeo de
 * YouTube encontrado en una búsqueda real), no inventadas. Deliberadamente
 * corta: no existe cobertura real para las 3.630 playas, solo para un puñado
 * de las más conocidas — mejor una lista corta y honesta que fingir cobertura
 * nacional. Solo vídeos de ID fijo (retransmisión 24/7 persistente): los
 * embeds "canal en directo" (que cambian de vídeo según lo que esté
 * emitiendo el canal en cada momento) resultaron poco fiables — mostraban
 * "vídeo no disponible" en cuanto el canal no emitía, así que se descartó
 * ese enfoque. Si alguna de estas cámaras deja de emitir, el propio
 * reproductor de YouTube lo mostrará (no es algo que tengamos que detectar
 * nosotros), pero al menos parte de una base más estable.
 */
export const WEBCAMS: Record<string, Webcam> = {
  "la-concha-donostia-san-sebastian": {
    youtubeVideoId: "B2yCp7MFCMM",
    source: "Live Webcam Playa La Concha, Villa Favorita (YouTube)",
  },
  "playa-del-ingles-las-palmas": {
    youtubeVideoId: "Y0PrxU96vtc",
    source: "Live Webcam Gran Canaria — Playa del Inglés, Maspalomas (YouTube)",
  },
  "playa-de-somo-santander": {
    youtubeVideoId: "bV_ltoX7Jy8",
    source: "SurfCam.io — Webcam Loredo, Somo y Santander (YouTube)",
  },
  "playa-de-la-barrosa-chiclana-de-la-frontera": {
    youtubeVideoId: "w6FUEH7JJ3Y",
    source: "Webcam La Barrosa (Chiclana) — Campanario (YouTube)",
  },
  "playa-de-los-locos-torrevieja": {
    youtubeVideoId: "q7rnZo_z-ro",
    source: "Webcam Playa de Los Locos, Torrevieja (YouTube)",
  },
  "platja-de-llevant-benidorm": {
    youtubeVideoId: "7i5qu1dotFY",
    source: "Webcam Benidorm — Playa de Levante, meteo365.es (YouTube)",
  },
  "dunas-de-corralejo-las-palmas": {
    youtubeVideoId: "bgGZxUpAqk0",
    source: "Live Webcam of Corralejo Bay, Fuerteventura (YouTube)",
  },
};

export function getWebcam(locationSlug: string): Webcam | null {
  return WEBCAMS[locationSlug] ?? null;
}
