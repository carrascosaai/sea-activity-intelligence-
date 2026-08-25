import { NextRequest, NextResponse } from "next/server";
import { POPULAR_LOCATIONS } from "@/lib/locations";
import { getDailySnapshots } from "@/lib/forecast";
import { writeForecastCache } from "@/lib/cache/forecastCache";
import { todayISO, tomorrowISO } from "@/lib/time";

/**
 * Refresca la caché de previsión (forecast_cache) para las playas
 * destacadas, hoy y mañana. Lo llama el cron de Vercel (ver vercel.json) —
 * protegido con CRON_SECRET para que no sea una ruta pública que cualquiera
 * pueda golpear para forzar refrescos.
 *
 * Si no hay locations destacadas o Supabase no está configurado, no falla:
 * simplemente no hay nada que cachear (getDailySnapshots sigue funcionando
 * en vivo igual).
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dates = [todayISO(), tomorrowISO()];
  let refreshed = 0;
  let failed = 0;

  for (const location of POPULAR_LOCATIONS) {
    for (const dateISO of dates) {
      try {
        // getDailySnapshots ya escribe en caché con `after()` tras un fetch en
        // vivo, pero aquí queremos garantizar que se guarda antes de seguir
        // con la siguiente playa (el cron no tiene un "after" al que esperar).
        const snapshots = await getDailySnapshots(location, dateISO);
        if (snapshots.length > 0) {
          await writeForecastCache(location.slug, dateISO, snapshots);
          refreshed++;
        }
      } catch {
        failed++;
      }
    }
  }

  return NextResponse.json({ ok: true, refreshed, failed, locations: POPULAR_LOCATIONS.length });
}
