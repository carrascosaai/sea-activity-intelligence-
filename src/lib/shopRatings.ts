import { getSupabaseServerClient } from "./supabase";

export interface ShopRatingSummary {
  avg: number;
  count: number;
}

/**
 * Media y nº de valoraciones propias (no de Google) para un grupo de tiendas,
 * de una sola consulta. Si Supabase no está configurado, degrada a "sin
 * valoraciones" para todas — nunca rompe la página de resultado.
 */
export async function getShopRatingSummaries(slugs: string[]): Promise<Record<string, ShopRatingSummary>> {
  if (slugs.length === 0) return {};
  const supabase = getSupabaseServerClient();
  if (!supabase) return {};

  const { data, error } = await supabase.from("shop_ratings").select("shop_slug, rating").in("shop_slug", slugs);
  if (error || !data) return {};

  const bySlug: Record<string, number[]> = {};
  for (const row of data) {
    (bySlug[row.shop_slug] ??= []).push(row.rating);
  }

  const summaries: Record<string, ShopRatingSummary> = {};
  for (const [slug, ratings] of Object.entries(bySlug)) {
    summaries[slug] = {
      avg: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
      count: ratings.length,
    };
  }
  return summaries;
}
