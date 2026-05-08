/**
 * Weight loss math.
 *
 * Decision (locked in plan):
 *   loss_pct = (baseline - current) / baseline * 100
 *   - baseline = registration weight (admin-only edit post-signup)
 *   - current  = latest weight log
 *   - negatives ALLOWED (gain shows as negative pct, sorts to bottom, no medal)
 *   - new users with no weight log show "📏 Awaiting first check-in", not 0%
 */

export function lossPct(
  baseline: number | null | undefined,
  current: number | null | undefined,
): number | null {
  if (baseline == null || current == null || baseline <= 0) return null;
  return Math.round(((baseline - current) / baseline) * 1000) / 10;
}

export type WeightStatus = "awaiting" | "loss" | "gain" | "even";

export function weightStatusOf(
  baseline: number | null | undefined,
  current: number | null | undefined,
): WeightStatus {
  const pct = lossPct(baseline, current);
  if (pct == null) return "awaiting";
  if (pct > 0.05) return "loss";
  if (pct < -0.05) return "gain";
  return "even";
}

/** Returns true iff the user qualifies for a podium medal (loss > 0). */
export function isWeightMedalEligible(
  baseline: number | null | undefined,
  current: number | null | undefined,
): boolean {
  return weightStatusOf(baseline, current) === "loss";
}
