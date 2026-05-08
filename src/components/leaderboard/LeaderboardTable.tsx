import { cn } from "@/lib/utils";
import type {
  CategoryKey,
  LeaderRow,
} from "@/lib/queries/leaderboards.server";
import {
  displayValueOf,
  isAwaitingWeight,
  noWeightMedal,
} from "@/lib/queries/leaderboards.server";

const MEDAL_BY_RANK: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function LeaderboardTable({
  rows,
  category,
  myId,
}: {
  rows: LeaderRow[];
  category: CategoryKey;
  myId?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border bg-card/50 p-6 text-center text-sm text-muted-foreground">
        No data yet — be the first to log!
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border">
      <table className="w-full text-sm">
        <thead className="bg-card/70 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="w-10 px-3 py-2 text-left">#</th>
            <th className="px-2 py-2 text-left">Player</th>
            <th className="px-3 py-2 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isYou = r.user_id === myId;
            const awaiting = isAwaitingWeight(r, category);
            const noMedal = noWeightMedal(r, category);
            const medal = !noMedal && r.rk <= 3 ? MEDAL_BY_RANK[r.rk] : null;
            return (
              <tr
                key={r.user_id}
                className={cn(
                  "border-t border-border/50 transition-colors",
                  isYou && "bg-you/10",
                )}
              >
                <td className="px-3 py-2.5 align-middle font-mono text-xs">
                  {medal ? (
                    <span className="text-base">{medal}</span>
                  ) : (
                    <span className="text-muted-foreground">{r.rk}</span>
                  )}
                </td>
                <td className="px-2 py-2.5 align-middle">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{r.avatar_emoji}</span>
                    <span className={cn("font-medium", isYou && "text-you")}>
                      {isYou ? "You" : r.nickname}
                    </span>
                  </div>
                </td>
                <td
                  className={cn(
                    "px-3 py-2.5 text-right font-mono text-sm tabular-nums",
                    awaiting
                      ? "text-muted-foreground"
                      : noMedal && category === "weight"
                        ? "text-destructive"
                        : "text-gold",
                  )}
                >
                  {awaiting ? "📏 awaiting" : displayValueOf(r, category)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
