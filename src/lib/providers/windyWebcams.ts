/**
 * Webcam real más cercana a una playa, vía Windy Webcams API v3 (plan gratuito).
 *
 * Reglas del plan gratuito que este módulo respeta (ver
 * https://api.windy.com/webcams/terms y /pricing):
 *  - Las URLs de imagen llevan un token que caduca a los 10 min, así que se
 *    piden desde el servidor en cada carga de página (caché corta, 4 min) y
 *    nunca se guardan.
 *  - Hay que enlazar cada imagen a su página en Windy y poner la atribución
 *    "Webcams provided by windy.com" (lo hace WindyWebcamCard).
 *  - No se estira la imagen y no se sobrecarga la API: una petición por
 *    página, cacheada, con timeout corto.
 *
 * Mismo criterio que las fotos de playa (BeachPhoto) y las webcams
 * verificadas a mano (lib/webcams.ts): mejor NO mostrar nada que mostrar la
 * cámara de otra playa haciéndola pasar por la de esta. Dos niveles:
 *  - "near": cámara de esta playa o pegada a ella (playa ≤1,5 km, costa ≤1 km,
 *    o hasta 5 km si el título de la cámara nombra la playa).
 *  - "zone": la más cercana dentro de 3 km, que NO es esta playa. Se etiqueta
 *    así en la tarjeta ("No es esta playa") y siempre con su distancia.
 * Sin clave (WINDY_WEBCAMS_API_KEY) o ante cualquier fallo, devuelve null y la
 * página cae al enlace de búsqueda de siempre.
 */

const API = "https://api.windy.com/webcams/api/v3/webcams";
const SEARCH_RADIUS_KM = 5;
/** Cámara de playa "cercana": vale sin más comprobación. */
const MAX_DISTANCE_KM = 1.5;
/** Las de "costa" (paseos marítimos, faros, calas...) son menos específicas de
 *  playa que las de categoría "beach", así que se les exige estar más cerca. */
const MAX_DISTANCE_COAST_KM = 1.0;
/** Nivel "de la zona": no es esta playa, pero enseña el mar de los alrededores.
 *  Siempre se etiqueta así y con su distancia. */
const MAX_DISTANCE_ZONE_KM = 3;
/** Playas largas (Los Lances: ~7 km): el punto central de la playa puede estar
 *  lejos de la cámara. Más allá de MAX_DISTANCE_KM solo se acepta si el nombre
 *  de la cámara contiene el nombre propio de la playa. */
const MAX_DISTANCE_NAMED_KM = 5;

export interface WindyWebcam {
  /** "near": cámara de esta playa o pegada a ella. "zone": cámara de los alrededores. */
  kind: "near" | "zone";
  id: number;
  title: string;
  imageUrl: string;
  width: number;
  height: number;
  /** Página de la cámara en windy.com (obligatorio enlazar la imagen aquí). */
  pageUrl: string;
  distanceKm: number;
  /** ISO de la última imagen recibida por Windy. */
  lastUpdatedOn: string | null;
}

interface ApiWebcam {
  webcamId: number;
  title?: string;
  status?: string;
  lastUpdatedOn?: string;
  images?: {
    current?: { preview?: string };
    sizes?: { preview?: { width: number; height: number } };
  };
  location?: { latitude: number; longitude: number };
  urls?: { detail?: string };
  categories?: { id: string }[];
}

const GENERIC_WORDS = new Set([
  "playa", "praia", "platja", "beach", "plage", "hondartza", "cala", "cove", "bahia", "punta", "puerto", "club",
  "del", "de", "la", "las", "los", "el", "els", "les", "das", "dos", "sa", "es", "en", "a", "o", "d", "l",
]);

function normalize(s: string): string {
  // ̀-ͯ = marcas diacríticas combinantes (quita los acentos tras NFD)
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** ¿El título de la cámara contiene el nombre propio (no genérico) de la playa? */
function titleMentionsBeach(title: string, beachName: string): boolean {
  const titleWords = new Set(normalize(title).split(" "));
  const tokens = normalize(beachName).split(" ").filter((w) => w.length > 3 && !GENERIC_WORDS.has(w));
  return tokens.some((t) => titleWords.has(t));
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function getWindyWebcam(lat: number, lon: number, beachName: string): Promise<WindyWebcam | null> {
  const key = process.env.WINDY_WEBCAMS_API_KEY;
  if (!key) return null;

  try {
    const url = `${API}?nearby=${lat.toFixed(5)},${lon.toFixed(5)},${SEARCH_RADIUS_KM}&include=images,location,urls,categories&lang=es&limit=20`;
    const res = await fetch(url, {
      headers: { "x-windy-api-key": key },
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 240 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { webcams?: ApiWebcam[] };

    const scored = (json.webcams ?? [])
      .filter((w) => w.status === "active" && w.images?.current?.preview && w.location && w.urls?.detail)
      .map((w) => ({
        w,
        d: haversineKm(lat, lon, w.location!.latitude, w.location!.longitude),
        isBeach: (w.categories ?? []).some((c) => c.id === "beach"),
        isCoast: (w.categories ?? []).some((c) => c.id === "coast"),
        named: titleMentionsBeach(w.title ?? "", beachName),
      }))
      .filter((c) => c.isBeach || c.isCoast);

    // Nivel "cercana": de categoría playa a ≤1,5 km, de costa a ≤1 km, o más
    // lejos si el nombre de la cámara nombra esta playa. Primero las que la
    // nombran, luego las más cercanas.
    const near = scored
      .filter((c) => (c.isBeach && c.d <= MAX_DISTANCE_KM) || (c.isCoast && c.d <= MAX_DISTANCE_COAST_KM) || (c.named && c.d <= MAX_DISTANCE_NAMED_KM))
      .sort((a, b) => Number(b.named) - Number(a.named) || a.d - b.d);
    // Nivel "de la zona": la más cercana dentro de 3 km si no hay ninguna anterior.
    const zone = scored.filter((c) => c.d <= MAX_DISTANCE_ZONE_KM).sort((a, b) => a.d - b.d);

    const best = near[0] ?? zone[0];
    if (!best) return null;
    const kind: "near" | "zone" = near[0] ? "near" : "zone";
    const size = best.w.images?.sizes?.preview ?? { width: 400, height: 224 };
    return {
      kind,
      id: best.w.webcamId,
      title: (best.w.title ?? "Webcam").trim(),
      imageUrl: best.w.images!.current!.preview!,
      width: size.width,
      height: size.height,
      pageUrl: best.w.urls!.detail!,
      distanceKm: Math.round(best.d * 10) / 10,
      lastUpdatedOn: best.w.lastUpdatedOn ?? null,
    };
  } catch {
    return null;
  }
}
