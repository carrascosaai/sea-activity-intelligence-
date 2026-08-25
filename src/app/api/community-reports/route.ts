import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getLocationBySlug } from "@/lib/locations";

export async function POST(req: NextRequest) {
  // Más restrictivo que otras rutas: es texto libre público, no un click.
  const allowed = await checkRateLimit(`community-report:${getClientIp(req)}`, 5, 60);
  if (!allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: { locationSlug?: string; activityId?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { locationSlug, activityId, text } = body;
  const trimmed = text?.trim();
  if (!locationSlug || !getLocationBySlug(locationSlug) || !trimmed || trimmed.length < 3 || trimmed.length > 280) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    console.log("[community-report]", locationSlug, activityId, trimmed);
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase
    .from("community_reports")
    .insert({ location_slug: locationSlug, activity_id: activityId ?? null, body: trimmed });

  if (error) {
    console.error("[community-report] supabase insert error", error.message);
    return NextResponse.json({ ok: true, persisted: false });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
