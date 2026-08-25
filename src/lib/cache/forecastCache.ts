import { getSupabaseServerClient } from "../supabase";
import type { ConditionSnapshot } from "../types";

/**
 * Caché de snapshots diarios en Supabase (tabla `forecast_cache`), pensada
 * para las playas de más tráfico (ver POPULAR_LOCATIONS), rellenada por un
 * cron de Vercel (app/api/cron/refresh-cache/route.ts) cada 30 min.
 *
 * Diseño: guarda el `ConditionSnapshot[]` ya fusionado (viento + oleaje),
 * no los datos crudos por proveedor — es más simple y rápido de leer que
 * reconstruirlo en cada petición. Las tablas `weather_forecasts`/
 * `marine_forecasts` del esquema quedan para un futuro histórico más
 * granular; esto es la caché de "lo que se sirve ahora mismo".
 *
 * Si Supabase no está configurado, o el caché está vacío o caducado
 * (>45 min), devuelve null y quien llama debe hacer fetch en vivo — nunca
 * debe ser la única fuente de datos.
 */
const FRESHNESS_MS = 45 * 60 * 1000;

export async function readForecastCache(locationSlug: string, dateISO: string): Promise<ConditionSnapshot[] | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  try {
    const { data } = await supabase
      .from("forecast_cache")
      .select("snapshots, fetched_at")
      .eq("location_slug", locationSlug)
      .eq("date_iso", dateISO)
      .maybeSingle();

    if (!data) return null;
    const age = Date.now() - new Date(data.fetched_at).getTime();
    if (age > FRESHNESS_MS) return null;

    return data.snapshots as ConditionSnapshot[];
  } catch {
    return null;
  }
}

export async function writeForecastCache(
  locationSlug: string,
  dateISO: string,
  snapshots: ConditionSnapshot[]
): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase || snapshots.length === 0) return;

  try {
    await supabase
      .from("forecast_cache")
      .upsert(
        { location_slug: locationSlug, date_iso: dateISO, snapshots, fetched_at: new Date().toISOString() },
        { onConflict: "location_slug,date_iso" }
      );
  } catch {
    // el caché es una optimización, nunca debe romper la respuesta real
  }
}
