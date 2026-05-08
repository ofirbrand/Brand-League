import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { weightStatusOf } from "@/lib/domain/weight";

export type CategoryKey = "steps" | "running" | "weight";

const VIEW_BY_CATEGORY = {
  steps: "v_leaderboard_steps_all_time",
  running: "v_leaderboard_run_all_time",
  weight: "v_leaderboard_weight_all_time",
} as const;

const WEEKLY_VIEW = {
  steps: "v_leaderboard_steps_weekly",
  running: "v_leaderboard_run_weekly",
} as const;

export type LeaderRow = {
  user_id: string;
  nickname: string;
  avatar_emoji: string;
  rk: number;
  // category-specific:
  total_steps?: number;
  total_km?: number;
  total_minutes?: number;
  baseline_weight_kg?: number;
  latest_weight_kg?: number | null;
  loss_pct?: number | null;
};

/** All-time leaderboard rows for a category, sorted by rk asc. */
export async function fetchAllTimeLeaderboard(
  category: CategoryKey,
): Promise<LeaderRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(VIEW_BY_CATEGORY[category])
    .select("*")
    .order("rk", { ascending: true })
    .order("nickname", { ascending: true });

  if (error) {
    console.error("[leaderboards] all-time", category, error);
    return [];
  }
  return (data ?? []) as LeaderRow[];
}

/** Weekly leaderboard rows for steps/running scoped to `weekStart` (YYYY-MM-DD). */
export async function fetchWeeklyLeaderboard(
  category: "steps" | "running",
  weekStart: string,
): Promise<LeaderRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(WEEKLY_VIEW[category])
    .select("*")
    .eq("week_start", weekStart)
    .order("rk", { ascending: true })
    .order("nickname", { ascending: true });

  if (error) {
    console.error("[leaderboards] weekly", category, error);
    return [];
  }
  return (data ?? []) as LeaderRow[];
}

/** Returns the formatted display value for a row, given a category. */
export function displayValueOf(row: LeaderRow, category: CategoryKey): string {
  if (category === "steps") {
    return (row.total_steps ?? 0).toLocaleString();
  }
  if (category === "running") {
    return `${(row.total_km ?? 0).toFixed(1)} km`;
  }
  if (row.loss_pct == null) return "—";
  return `${row.loss_pct.toFixed(1)}%`;
}

export function isAwaitingWeight(row: LeaderRow, category: CategoryKey) {
  return (
    category === "weight" &&
    weightStatusOf(row.baseline_weight_kg, row.latest_weight_kg ?? null) ===
      "awaiting"
  );
}

export function noWeightMedal(row: LeaderRow, category: CategoryKey) {
  if (category !== "weight") return false;
  const status = weightStatusOf(
    row.baseline_weight_kg,
    row.latest_weight_kg ?? null,
  );
  return status !== "loss";
}
