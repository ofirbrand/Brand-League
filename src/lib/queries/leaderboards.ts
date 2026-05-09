"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type CategoryKey = "steps" | "running" | "weight" | "gym";

const VIEW_BY_CATEGORY = {
  steps: "v_leaderboard_steps_all_time",
  running: "v_leaderboard_run_all_time",
  weight: "v_leaderboard_weight_all_time",
  gym: "v_leaderboard_gym_all_time",
} as const;

/**
 * Returns the current user's rank in the all-time leaderboard for `category`,
 * or null if they don't appear (no profile, no data, etc.).
 */
export async function fetchMyAllTimeRank(
  userId: string,
  category: CategoryKey,
): Promise<number | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from(VIEW_BY_CATEGORY[category])
    .select("rk")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data.rk ?? null;
}
