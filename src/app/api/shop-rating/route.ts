import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Una valoración por click, no hace falta que sea muy permisivo — frena
  // intentos de inflar/hundir la media de una tienda a base de peticiones.
  const allowed = await checkRateLimit(`shop-rating:${getClientIp(req)}`, 10, 60);
  if (!allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: { shopSlug?: string; rating?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { shopSlug, rating } = body;
  if (!shopSlug || !Number.isInteger(rating) || rating! < 1 || rating! > 5) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    console.log("[shop-rating]", shopSlug, rating);
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase.from("shop_ratings").insert({ shop_slug: shopSlug, rating });
  if (error) {
    console.error("[shop-rating] supabase insert error", error.message);
    return NextResponse.json({ ok: true, persisted: false });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
