"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  RunLogInput,
  StepLogInput,
  WeightLogInput,
} from "@/lib/domain/validation";
import type { LogType } from "@/components/log/LogSheetContext";

/**
 * Inserts a step log (UPSERT replaces same-day entry).
 */
export async function upsertStepLog(userId: string, input: StepLogInput) {
  const supabase = createSupabaseBrowserClient();
  return supabase.from("step_logs").upsert(
    { user_id: userId, ...input },
    { onConflict: "user_id,log_date" },
  );
}

/**
 * Inserts a run log (append-only; multiple per day allowed).
 */
export async function insertRunLog(userId: string, input: RunLogInput) {
  const supabase = createSupabaseBrowserClient();
  return supabase.from("run_logs").insert({ user_id: userId, ...input });
}

/**
 * Upserts a weight log (one per day; latest replaces).
 */
export async function upsertWeightLog(userId: string, input: WeightLogInput) {
  const supabase = createSupabaseBrowserClient();
  return supabase.from("weight_logs").upsert(
    { user_id: userId, ...input },
    { onConflict: "user_id,log_date" },
  );
}

export type AnyLogInput =
  | { type: "run"; payload: RunLogInput }
  | { type: "walk"; payload: StepLogInput }
  | { type: "weight"; payload: WeightLogInput };

export async function submitLog(userId: string, log: AnyLogInput) {
  switch (log.type) {
    case "run":
      return insertRunLog(userId, log.payload);
    case "walk":
      return upsertStepLog(userId, log.payload);
    case "weight":
      return upsertWeightLog(userId, log.payload);
  }
}

/** Categories whose podiums could change after a log of this type. */
export function categoriesAffectedBy(t: LogType): Array<"steps" | "running" | "weight"> {
  if (t === "walk") return ["steps"];
  if (t === "run") return ["running"];
  return ["weight"];
}
