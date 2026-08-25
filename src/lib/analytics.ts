// Eventos definidos en el brief (punto 16).
export type AnalyticsEvent =
  | "location_selected"
  | "activity_selected"
  | "skill_selected"
  | "forecast_viewed"
  | "recommendation_viewed"
  | "location_clicked"
  | "business_clicked"
  | "booking_clicked"
  | "favorite_created"
  // No estaba en el brief original: se añadió para poder validar (o corregir)
  // los umbrales de scoring con datos de uso real — ver VALIDATION.md.
  | "recommendation_feedback"
  // Tiendas cerca de la playa (ver lib/shops.ts) — uso real del enlace a
  // Google Maps y de las valoraciones propias de la comunidad.
  | "shop_maps_clicked"
  | "shop_rated";

const SESSION_KEY = "sai_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Analítica best-effort: nunca debe romper la experiencia del usuario si falla. */
export function track(event: AnalyticsEvent, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ event, payload, sessionId: getSessionId() });
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/analytics", blob);
    } else {
      fetch("/api/analytics", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  } catch {
    // best-effort: nunca bloquear la UI por analítica
  }
}
