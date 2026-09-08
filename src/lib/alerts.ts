import { getSupabaseServerClient } from "./supabase";
import type { ActivityId, SkillLevel } from "./types";

export interface AlertSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  locationSlug: string;
  activityId: ActivityId;
  skillLevel: SkillLevel;
  wasGood: boolean;
}

/**
 * Alertas — requiere Supabase de verdad (a diferencia del resto de la app,
 * que degrada con gracia sin él): una alerta que no se puede guardar no
 * sirve para nada, así que si Supabase no está configurado, createAlert
 * devuelve null y el botón de la UI lo explica en vez de fingir que
 * funciona.
 */
export async function createAlert(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  locationSlug: string;
  activityId: ActivityId;
  skillLevel: SkillLevel;
}): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;

  const { error } = await supabase.from("alert_subscriptions").upsert(
    {
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      location_slug: input.locationSlug,
      activity_id: input.activityId,
      skill_level: input.skillLevel,
      was_good: false,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    console.error("[alerts] fallo al crear", error.message);
    return false;
  }
  return true;
}

export async function deleteAlert(endpoint: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;
  const { error } = await supabase.from("alert_subscriptions").delete().eq("endpoint", endpoint);
  return !error;
}

export async function getAlertForEndpoint(endpoint: string): Promise<AlertSubscription | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("alert_subscriptions")
    .select("id, endpoint, p256dh, auth, location_slug, activity_id, skill_level, was_good")
    .eq("endpoint", endpoint)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    endpoint: data.endpoint,
    p256dh: data.p256dh,
    auth: data.auth,
    locationSlug: data.location_slug,
    activityId: data.activity_id,
    skillLevel: data.skill_level,
    wasGood: data.was_good,
  };
}

export async function listActiveAlerts(): Promise<AlertSubscription[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("alert_subscriptions")
    .select("id, endpoint, p256dh, auth, location_slug, activity_id, skill_level, was_good");
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    endpoint: row.endpoint,
    p256dh: row.p256dh,
    auth: row.auth,
    locationSlug: row.location_slug,
    activityId: row.activity_id,
    skillLevel: row.skill_level,
    wasGood: row.was_good,
  }));
}

export async function markAlertState(id: string, wasGood: boolean, notified: boolean): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  await supabase
    .from("alert_subscriptions")
    .update({ was_good: wasGood, ...(notified ? { last_notified_at: new Date().toISOString() } : {}) })
    .eq("id", id);
}
