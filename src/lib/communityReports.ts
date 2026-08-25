import { getSupabaseServerClient } from "./supabase";

export interface CommunityReport {
  id: string;
  activityId: string | null;
  body: string;
  createdAt: string;
}

/** Últimos reportes reales de una playa (de cualquier actividad, no solo la que se está viendo). */
export async function getCommunityReports(locationSlug: string, limit = 8): Promise<CommunityReport[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_reports")
    .select("id, activity_id, body, created_at")
    .eq("location_slug", locationSlug)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    activityId: row.activity_id,
    body: row.body,
    createdAt: row.created_at,
  }));
}
