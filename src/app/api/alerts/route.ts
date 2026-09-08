import { NextRequest, NextResponse } from "next/server";
import { createAlert, deleteAlert } from "@/lib/alerts";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getLocationBySlug } from "@/lib/locations";
import { ACTIVITIES } from "@/lib/activities";
import type { ActivityId, SkillLevel } from "@/lib/types";

const VALID_ACTIVITIES = new Set(ACTIVITIES.map((a) => a.id));
const VALID_LEVELS = new Set<SkillLevel>(["principiante", "intermedio", "avanzado"]);

export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit(`alerts:${getClientIp(req)}`, 10, 60);
  if (!allowed) return NextResponse.json({ ok: false }, { status: 429 });

  let body: {
    subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
    locationSlug?: string;
    activityId?: string;
    skillLevel?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const endpoint = body.subscription?.endpoint;
  const p256dh = body.subscription?.keys?.p256dh;
  const auth = body.subscription?.keys?.auth;
  const { locationSlug, activityId, skillLevel } = body;

  if (
    !endpoint ||
    !p256dh ||
    !auth ||
    !locationSlug ||
    !getLocationBySlug(locationSlug) ||
    !activityId ||
    !VALID_ACTIVITIES.has(activityId as ActivityId) ||
    !skillLevel ||
    !VALID_LEVELS.has(skillLevel as SkillLevel)
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const created = await createAlert({
    endpoint,
    p256dh,
    auth,
    locationSlug,
    activityId: activityId as ActivityId,
    skillLevel: skillLevel as SkillLevel,
  });

  return NextResponse.json({ ok: created });
}

export async function DELETE(req: NextRequest) {
  let body: { endpoint?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!body.endpoint) return NextResponse.json({ ok: false }, { status: 400 });

  const ok = await deleteAlert(body.endpoint);
  return NextResponse.json({ ok });
}
