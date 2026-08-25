import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Generoso: una sola sesión dispara varios eventos por página vista.
  const allowed = await checkRateLimit(`analytics:${getClientIp(req)}`, 120, 60);
  if (!allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: { event?: string; payload?: Record<string, unknown>; sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { event, payload = {}, sessionId = "unknown" } = body;
  if (!event) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    // Si Supabase no está configurado en este entorno (p. ej. en local sin
    // .env.local): log a consola, no bloquea nada.
    console.log("[analytics]", event, sessionId, payload);
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase
    .from("analytics_events")
    .insert({ event_name: event, session_id: sessionId, payload });

  if (error) {
    console.error("[analytics] supabase insert error", error.message);
    return NextResponse.json({ ok: true, persisted: false });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
