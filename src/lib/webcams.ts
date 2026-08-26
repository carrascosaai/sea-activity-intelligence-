export interface Webcam {
  /** ID de vídeo de YouTube fijo (cámara 24/7 con un único ID persistente). */
  youtubeVideoId?: string;
  /** ID de canal de YouTube, para retransmisiones que cambian de vídeo en directo (embed especial live_stream). */
  youtubeChannelId?: string;
  source: string;
}

/**
 * Cámaras reales en directo, verificadas manualmente (nombre del canal/vídeo
 * de YouTube encontrado en una búsqueda real), no inventadas. Deliberadamente
 * corta: no existe cobertura real para las 3.630 playas, solo para un puñado
 * de las más conocidas — mejor una lista corta y honesta que fingir cobertura
 * nacional. Si algún día una de estas cámaras deja de emitir, el propio
 * reproductor de YouTube lo mostrará (no es algo que tengamos que detectar
 * nosotros).
 */
export const WEBCAMS: Record<string, Webcam> = {
  "zurriola-donostia-san-sebastian": {
    youtubeChannelId: "UCIF1lF5u-ABw3sdNvV3MxOg",
    source: "Webcam Zurriola (YouTube)",
  },
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
};

export function getWebcam(locationSlug: string): Webcam | null {
  return WEBCAMS[locationSlug] ?? null;
}
