import { getSupabaseServerClient } from "./supabase";

/**
 * Límite de peticiones por IP, respaldado en la tabla `rate_limits` de
 * Supabase (ver db/schema.sql) — así funciona igual en cualquier instancia
 * serverless, no depende de memoria local del proceso (que en Vercel no se
 * comparte entre invocaciones).
 *
 * Honestidad sobre sus límites: es "leer, luego escribir", no atómico. Bajo
 * concurrencia muy alta en la misma ventana, un puñado de peticiones de más
 * podrían colarse antes de que el contador se actualice. Para el objetivo
 * real (frenar scraping/abuso básico, no una garantía de facturación) es
 * una compensación aceptable frente a montar infraestructura adicional.
 *
 * Si Supabase no está configurado, no bloquea nada (degrada a "sin límite"),
 * igual que el resto de la app cuando falta esa pieza opcional.
 */
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return true;

  try {
    const now = new Date();
    const { data: existing } = await supabase.from("rate_limits").select("count, window_start").eq("key", key).maybeSingle();

    if (!existing || now.getTime() - new Date(existing.window_start).getTime() > windowSeconds * 1000) {
      await supabase.from("rate_limits").upsert({ key, count: 1, window_start: now.toISOString() });
      return true;
    }

    if (existing.count >= limit) return false;

    await supabase.from("rate_limits").update({ count: existing.count + 1 }).eq("key", key);
    return true;
  } catch {
    return true; // el límite de peticiones nunca debe tumbar la petición real
  }
}

/** IP del cliente a partir de las cabeceras que Vercel añade siempre. */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
