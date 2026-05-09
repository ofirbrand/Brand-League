import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  GymLog,
  Profile,
  RunLog,
  StepLog,
  WeightLog,
} from "@/lib/supabase/types";

export type WeeklyPoint = {
  week_start: string;
  value: number;
};

export type MyAllRanks = {
  steps: { rk: number; total: number } | null;
  running: { rk: number; total: number } | null;
  weight: { rk: number; loss_pct: number | null; awaiting: boolean } | null;
  gym: { rk: number; total_minutes: number } | null;
};

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as Profile;
}

export async function fetchMyRanks(userId: string): Promise<MyAllRanks> {
  const supabase = await createSupabaseServerClient();
  const [stepsRow, runningRow, weightRow, gymRow] = await Promise.all([
    supabase
      .from("v_leaderboard_steps_all_time")
      .select("rk, total_steps")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("v_leaderboard_run_all_time")
      .select("rk, total_km")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("v_leaderboard_weight_all_time")
      .select("rk, loss_pct, latest_weight_kg, baseline_weight_kg")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("v_leaderboard_gym_all_time")
      .select("rk, total_minutes")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return {
    steps: stepsRow.data
      ? { rk: stepsRow.data.rk, total: Number(stepsRow.data.total_steps ?? 0) }
      : null,
    running: runningRow.data
      ? { rk: runningRow.data.rk, total: Number(runningRow.data.total_km ?? 0) }
      : null,
    weight: weightRow.data
      ? {
          rk: weightRow.data.rk,
          loss_pct: weightRow.data.loss_pct,
          awaiting: weightRow.data.latest_weight_kg == null,
        }
      : null,
    gym: gymRow.data
      ? {
          rk: gymRow.data.rk,
          total_minutes: Number(gymRow.data.total_minutes ?? 0),
        }
      : null,
  };
}

type WeeklyView =
  | "v_weekly_step_totals"
  | "v_weekly_run_totals"
  | "v_weekly_weight_avg"
  | "v_weekly_gym_totals";

/**
 * Per-user weekly series + per-week family average.
 * `valueOf` extracts the metric from each row.
 */
async function fetchSeries<T extends { user_id: string; week_start: string }>(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  view: WeeklyView,
  userId: string,
  valueOf: (row: T) => number | null,
): Promise<{ mine: WeeklyPoint[]; family: WeeklyPoint[] }> {
  const { data, error } = await supabase
    .from(view)
    .select("*")
    .order("week_start", { ascending: true });
  if (error || !data) return { mine: [], family: [] };

  const rows = data as unknown as T[];

  const mine: WeeklyPoint[] = [];
  const familyByWeek = new Map<string, { sum: number; n: number }>();
  for (const r of rows) {
    const v = valueOf(r);
    if (v == null) continue;
    if (r.user_id === userId) mine.push({ week_start: r.week_start, value: v });
    const agg = familyByWeek.get(r.week_start) ?? { sum: 0, n: 0 };
    agg.sum += v;
    agg.n += 1;
    familyByWeek.set(r.week_start, agg);
  }

  const family: WeeklyPoint[] = [...familyByWeek.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([week_start, { sum, n }]) => ({
      week_start,
      value: n === 0 ? 0 : Math.round((sum / n) * 100) / 100,
    }));

  return { mine, family };
}

export async function fetchTrendData(userId: string) {
  const supabase = await createSupabaseServerClient();
  const [steps, running, weight, gym] = await Promise.all([
    fetchSeries<{
      user_id: string;
      week_start: string;
      total_steps: number;
    }>(supabase, "v_weekly_step_totals", userId, (r) =>
      Number(r.total_steps ?? 0),
    ),
    fetchSeries<{
      user_id: string;
      week_start: string;
      total_km: number;
    }>(supabase, "v_weekly_run_totals", userId, (r) =>
      Number(r.total_km ?? 0),
    ),
    fetchSeries<{
      user_id: string;
      week_start: string;
      loss_pct: number | null;
    }>(supabase, "v_weekly_weight_avg", userId, (r) =>
      r.loss_pct == null ? null : Number(r.loss_pct),
    ),
    fetchSeries<{
      user_id: string;
      week_start: string;
      total_minutes: number;
    }>(supabase, "v_weekly_gym_totals", userId, (r) =>
      Number(r.total_minutes ?? 0),
    ),
  ]);
  return { steps, running, weight, gym };
}

export type ActivityRow =
  | ({ kind: "step" } & StepLog)
  | ({ kind: "run" } & RunLog)
  | ({ kind: "weight" } & WeightLog)
  | ({ kind: "gym" } & GymLog);

export async function fetchMyActivity(
  userId: string,
  limit = 50,
): Promise<ActivityRow[]> {
  const supabase = await createSupabaseServerClient();
  const [steps, runs, weights, gyms] = await Promise.all([
    supabase
      .from("step_logs")
      .select("*")
      .eq("user_id", userId)
      .order("log_date", { ascending: false })
      .limit(limit),
    supabase
      .from("run_logs")
      .select("*")
      .eq("user_id", userId)
      .order("log_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", userId)
      .order("log_date", { ascending: false })
      .limit(limit),
    supabase
      .from("gym_logs")
      .select("*")
      .eq("user_id", userId)
      .order("log_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  const out: ActivityRow[] = [];
  for (const r of steps.data ?? []) out.push({ kind: "step", ...r });
  for (const r of runs.data ?? []) out.push({ kind: "run", ...r });
  for (const r of weights.data ?? []) out.push({ kind: "weight", ...r });
  for (const r of gyms.data ?? []) out.push({ kind: "gym", ...r });

  out.sort((a, b) => (a.log_date < b.log_date ? 1 : -1));
  return out.slice(0, limit);
}
