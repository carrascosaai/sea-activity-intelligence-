import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase opcional. Conectado en producción (analítica, feedback,
 * caché de previsión y límite de peticiones), pero cualquier entorno sin
 * estas credenciales (p. ej. local sin .env.local) debe seguir funcionando:
 * si no hay configuración, devuelve null y quien lo use degrada sin romper
 * nada (analítica a consola, caché desactivada, sin límite de peticiones).
 */
export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
