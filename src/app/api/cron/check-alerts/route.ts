import { NextRequest, NextResponse } from "next/server";
import { listActiveAlerts, markAlertState, deleteAlert } from "@/lib/alerts";
import { getLocationBySlug, displayName } from "@/lib/locations";
import { getActivity } from "@/lib/activities";
import { getDailySnapshots } from "@/lib/forecast";
import { buildHourlyScores, findClosestHourIndex } from "@/lib/scoring/dayScores";
import { currentHourMadrid, todayISO } from "@/lib/time";
import { sendPushNotification } from "@/lib/pushNotifications";
import type { ConditionSnapshot, ScoreBand } from "@/lib/types";

function isGoodBand(band: ScoreBand): boolean {
  return band === "ideal" || band === "buena";
}

/**
 * Revisa todas las alertas activas y avisa por Web Push a quien acaba de
 * ENTRAR en buenas condiciones (ideal/buena) — no cada vez que se revisa
 * mientras se mantienen buenas, para no repetir el aviso (ver was_good en
 * db/schema.sql). Protegido con CRON_SECRET, igual que refresh-cache.
 *
 * Vercel Hobby solo permite cron una vez al día (ver TODO.md/README) — muy
 * poco para un aviso de "se acaba de abrir tu ventana", así que esta ruta
 * NO se dispara desde vercel.json: la llama un workflow de GitHub Actions
 * cada 20 min (.github/workflows/check-alerts.yml), gratis, sin depender
 * de un plan de pago de Vercel para algo tan simple como una petición HTTP
 * periódica.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const alerts = await listActiveAlerts();
  const dateISO = todayISO();
  const hour = currentHourMadrid();
  const snapshotsByLocation = new Map<string, ConditionSnapshot[]>();

  let notified = 0;
  let checked = 0;
  let removed = 0;

  for (const alert of alerts) {
    const location = getLocationBySlug(alert.locationSlug);
    if (!location) continue;

    let snapshots = snapshotsByLocation.get(alert.locationSlug);
    if (!snapshots) {
      try {
        snapshots = await getDailySnapshots(location, dateISO);
      } catch {
        snapshots = [];
      }
      snapshotsByLocation.set(alert.locationSlug, snapshots);
    }
    if (snapshots.length === 0) continue;

    checked++;
    const hourly = buildHourlyScores(snapshots, alert.activityId, alert.skillLevel);
    const idx = findClosestHourIndex(hourly, hour);
    const isGood = isGoodBand(hourly[idx].band);

    if (isGood && !alert.wasGood) {
      const activity = getActivity(alert.activityId);
      const result = await sendPushNotification(
        { endpoint: alert.endpoint, p256dh: alert.p256dh, auth: alert.auth },
        {
          title: `${activity.emoji} Buenas condiciones para ${activity.name.toLowerCase()}`,
          body: `${displayName(location)} — puntuación ${hourly[idx].score}/100 ahora mismo.`,
          url: `/resultado?activity=${alert.activityId}&location=${alert.locationSlug}&level=${alert.skillLevel}&when=now`,
        }
      );
      if (result.gone) {
        await deleteAlert(alert.endpoint);
        removed++;
        continue;
      }
      if (result.ok) notified++;
      await markAlertState(alert.id, true, result.ok);
    } else if (!isGood && alert.wasGood) {
      await markAlertState(alert.id, false, false);
    }
  }

  return NextResponse.json({ checked, notified, removed, total: alerts.length });
}
