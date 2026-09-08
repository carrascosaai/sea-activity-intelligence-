"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import type { ActivityId, SkillLevel } from "@/lib/types";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type Status = "checking" | "unsupported" | "off" | "on" | "denied" | "loading" | "no-server";

function alertKey(activityId: ActivityId, locationSlug: string, level: SkillLevel) {
  return `sai-alert:${activityId}:${locationSlug}:${level}`;
}

// https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe — el
// navegador exige la clave VAPID pública como Uint8Array, no como el string base64url tal cual.
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/**
 * "Avísame cuando haya buenas condiciones" — notificación push del
 * navegador, sin cuenta ni email: la propia suscripción push (endpoint +
 * claves) es el identificador, tan anónimo como el resto de la app. Se
 * oculta sola si el navegador no soporta Push API (Safari de escritorio
 * fuera de macOS reciente, navegadores muy antiguos...) o si faltan las
 * claves VAPID en el entorno (NEXT_PUBLIC_VAPID_PUBLIC_KEY) — igual que
 * cualquier otra pieza opcional de esta app.
 */
export function AlertButton({
  activityId,
  locationSlug,
  level,
}: {
  activityId: ActivityId;
  locationSlug: string;
  level: SkillLevel;
}) {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    if (!VAPID_PUBLIC_KEY) {
      setStatus("no-server");
      return;
    }
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    try {
      setStatus(window.localStorage.getItem(alertKey(activityId, locationSlug, level)) === "1" ? "on" : "off");
    } catch {
      setStatus("off");
    }
  }, [activityId, locationSlug, level]);

  async function subscribe() {
    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!) as BufferSource,
        });
      }

      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON(), locationSlug, activityId, skillLevel: level }),
      });
      const data = await res.json();
      if (!data.ok) {
        setStatus("no-server");
        return;
      }

      try {
        window.localStorage.setItem(alertKey(activityId, locationSlug, level), "1");
      } catch {}
      setStatus("on");
    } catch (err) {
      console.error("[alerts] fallo al suscribir", err);
      setStatus("off");
    }
  }

  async function unsubscribe() {
    setStatus("loading");
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/alerts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      try {
        window.localStorage.removeItem(alertKey(activityId, locationSlug, level));
      } catch {}
      setStatus("off");
    } catch (err) {
      console.error("[alerts] fallo al cancelar", err);
      setStatus("on");
    }
  }

  if (status === "checking" || status === "unsupported" || status === "no-server") return null;

  if (status === "denied") {
    return (
      <p className="text-xs text-muted flex items-center gap-1.5">
        <BellOff className="w-3.5 h-3.5" /> Notificaciones bloqueadas en el navegador — actívalas para poder avisarte.
      </p>
    );
  }

  if (status === "on") {
    return (
      <button
        type="button"
        onClick={unsubscribe}
        className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent px-3.5 py-2 text-xs font-medium hover:bg-accent/15 transition-colors cursor-pointer"
      >
        <BellRing className="w-3.5 h-3.5" /> Alerta activa — cancelar
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={subscribe}
      disabled={status === "loading"}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 text-muted hover:text-foreground px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
    >
      <Bell className="w-3.5 h-3.5" /> {status === "loading" ? "Activando..." : "Avísame cuando haya buenas condiciones"}
    </button>
  );
}
