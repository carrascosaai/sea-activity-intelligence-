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
 * ese enfoque.
 *
 * AUDITORÍA (sep. 2026, scripts/verify-webcams.mjs): cuatro de las siete
 * cámaras originales estaban rotas sin que nadie lo detectara — un directo
 * caído (Playa del Inglés), un vídeo borrado (Torrevieja), y dos cuyo autor
 * desactivó la inserción (Corralejo, Benidorm Levante: en directo pero el
 * reproductor mostraba "vídeo no disponible"). Se retiraron. Un directo de
 * YouTube puede morir o cerrar la inserción en cualquier momento, así que
 * hay que volver a pasar el script de vez en cuando (npm run verify:webcams).
 */
export const WEBCAMS: Record<string, Webcam> = {
  "la-concha-donostia-san-sebastian": {
    youtubeVideoId: "B2yCp7MFCMM",
    source: "Live Webcam Playa La Concha, Villa Favorita (YouTube)",
  },
  "playa-de-somo-santander": {
    youtubeVideoId: "bV_ltoX7Jy8",
    source: "SurfCam.io — Webcam Loredo, Somo y Santander (YouTube)",
  },
  "playa-de-la-barrosa-chiclana-de-la-frontera": {
    youtubeVideoId: "w6FUEH7JJ3Y",
    source: "Webcam La Barrosa (Chiclana) — Campanario (YouTube)",
  },
  "playa-de-la-salve-laredo": {
    youtubeVideoId: "FCZCS7QCsls",
    source: "Webcam en directo desde Laredo, Cantabria (YouTube)",
  },
  // Las dos entradas de OSM "Platja Nord de Gandia" son tramos de la misma
  // playa (a ~1,4 km entre sí) y la cámara enfoca el paseo de Gandia playa.
  "platja-nord-de-gandia-gandia": {
    youtubeVideoId: "pjzMaHgcn7M",
    source: "Gandia Beach — Valencia, Spain — Live Cam (YouTube)",
  },
  "platja-nord-de-gandia-gandia-2": {
    youtubeVideoId: "pjzMaHgcn7M",
    source: "Gandia Beach — Valencia, Spain — Live Cam (YouTube)",
  },
  "platja-de-palmira-santa-ponca": {
    youtubeVideoId: "DM9VFnG7T1o",
    source: "Mallorca Webcam — Playa Palmira, Paguera (YouTube)",
  },
  "platja-gran-de-tora-santa-ponca": {
    youtubeVideoId: "otI3wxSgXNc",
    source: "Mallorca Webcam — Playa Tora, Paguera (YouTube)",
  },
};

export function getWebcam(locationSlug: string): Webcam | null {
  return WEBCAMS[locationSlug] ?? null;
}
