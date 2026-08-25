import { NextRequest, NextResponse } from "next/server";
import { searchLocations } from "@/lib/locations";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * Búsqueda de playas server-side. Deliberadamente NO se importa
 * src/data/beaches.json (3.630 playas, ~650 KB) desde ningún componente
 * cliente — así el bundle del navegador no crece con la cobertura nacional.
 */
export async function GET(req: NextRequest) {
  const allowed = await checkRateLimit(`search:${getClientIp(req)}`, 60, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Demasiadas peticiones, prueba en un momento." }, { status: 429 });
  }

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 20, 50);
  const results = searchLocations(q, limit);
  return NextResponse.json({ results });
}
