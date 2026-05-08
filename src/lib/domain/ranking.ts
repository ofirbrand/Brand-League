/**
 * Olympic-style ranking — share medal, skip the next slot.
 *
 * Examples (descending order):
 *   values [10, 10, 8, 5]      → ranks [1, 1, 3, 4]
 *   values [10, 8, 8, 5]       → ranks [1, 2, 2, 4]
 *   values [10, 10, 10, 8]     → ranks [1, 1, 1, 4]
 *
 * Mirrors Postgres `RANK() OVER (ORDER BY value DESC)`. The DB views are the
 * source of truth, but this client-side helper is used to detect "did this
 * log just bump me onto a podium?" without re-querying.
 */

export type Rankable<T> = T & { rk: number };

export function rankOlympic<T>(
  rows: T[],
  scoreOf: (row: T) => number | null,
): Rankable<T>[] {
  // Stable sort, NULL = last.
  const sorted = [...rows].sort((a, b) => {
    const va = scoreOf(a);
    const vb = scoreOf(b);
    if (va === null && vb === null) return 0;
    if (va === null) return 1;
    if (vb === null) return -1;
    return vb - va;
  });

  const ranked: Rankable<T>[] = [];
  let lastScore: number | null | undefined;
  let lastRank = 0;

  sorted.forEach((row, idx) => {
    const score = scoreOf(row);
    if (score !== lastScore) {
      lastRank = idx + 1; // skip slots for ties
      lastScore = score;
    }
    ranked.push({ ...row, rk: lastRank } as Rankable<T>);
  });

  return ranked;
}

/** Picks rows with rk ≤ 3 — i.e. the podium slice. Empty for empty input. */
export function podiumOf<T extends { rk: number }>(rows: T[]): T[] {
  return rows.filter((r) => r.rk <= 3);
}

/** Whether `userId` appears at rk ≤ 3 in the given ranked rows. */
export function isOnPodium<T extends { rk: number; user_id: string }>(
  rows: T[],
  userId: string,
): boolean {
  return rows.some((r) => r.user_id === userId && r.rk <= 3);
}
