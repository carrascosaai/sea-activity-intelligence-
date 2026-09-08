import webpush from "web-push";

/**
 * Envío de notificaciones Web Push — opcional, igual que Supabase/GA: si
 * faltan las claves VAPID (p. ej. en local sin configurar), simplemente no
 * se manda nada, no rompe nada. Las claves se generan una única vez con
 * `web-push generate-vapid-keys` (o webpush.generateVAPIDKeys()) — la
 * pública va en NEXT_PUBLIC_VAPID_PUBLIC_KEY (la usa el navegador para
 * suscribirse) y la privada en VAPID_PRIVATE_KEY (solo servidor, firma los
 * envíos para que el navegador confíe en que vienen de verdad de esta web).
 */
function getConfiguredWebPush(): typeof webpush | null {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return null;

  webpush.setVapidDetails("mailto:hola@sea-activity-intelligence.vercel.app", publicKey, privateKey);
  return webpush;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushResult {
  ok: boolean;
  /** true si el navegador dice que la suscripción ya no existe (410/404) — hay que borrarla. */
  gone: boolean;
}

export async function sendPushNotification(
  sub: PushSubscriptionRecord,
  payload: { title: string; body: string; url: string }
): Promise<PushResult> {
  const wp = getConfiguredWebPush();
  if (!wp) return { ok: false, gone: false };

  try {
    await wp.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload)
    );
    return { ok: true, gone: false };
  } catch (err) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    const gone = statusCode === 404 || statusCode === 410;
    if (!gone) console.error("[push] fallo al enviar", statusCode, err);
    return { ok: false, gone };
  }
}
