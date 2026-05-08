import {
  fetchAllTimeLeaderboard,
  fetchWeeklyLeaderboard,
  displayValueOf,
  isAwaitingWeight,
  noWeightMedal,
  type CategoryKey,
  type LeaderRow,
} from "@/lib/queries/leaderboards.server";
import { Podium, type PodiumEntry } from "@/components/podium/Podium";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { ShareButton } from "@/components/podium/ShareButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  currentWeekStart,
  formatWeekLabel,
  isoWeekNumber,
} from "@/lib/domain/week";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CategoryConfig = {
  category: CategoryKey;
  title: string;
  emoji: string;
  description: string;
  /** Weight category has no weekly podium concept (loss is a lifetime metric). */
  hasWeekly: boolean;
};

const CONFIG: Record<CategoryKey, CategoryConfig> = {
  steps: {
    category: "steps",
    title: "Steps",
    emoji: "👟",
    description: "All-time cumulative steps",
    hasWeekly: true,
  },
  running: {
    category: "running",
    title: "Running",
    emoji: "🏃",
    description: "All-time cumulative kilometers",
    hasWeekly: true,
  },
  weight: {
    category: "weight",
    title: "Weight Loss",
    emoji: "⚖️",
    description: "Loss % from registration baseline",
    hasWeekly: false,
  },
};

export async function CategoryView({ category }: { category: CategoryKey }) {
  const cfg = CONFIG[category];
  const weekStart = currentWeekStart();

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const myId = auth.user?.id;

  const allTime = await fetchAllTimeLeaderboard(category);
  const weekly =
    cfg.hasWeekly && (category === "steps" || category === "running")
      ? await fetchWeeklyLeaderboard(category, weekStart)
      : [];

  const podium = buildPodium(weekly, category, myId);
  const shareText = buildShareText(cfg, weekly, weekStart);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight md:text-3xl">
            <span className="text-3xl">{cfg.emoji}</span>
            <span>{cfg.title}</span>
          </h1>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
            {cfg.description}
          </p>
        </div>
        <ShareButton title={`${cfg.title} podium`} text={shareText} />
      </header>

      {cfg.hasWeekly && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {formatWeekLabel(weekStart)} podium
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-5">
            <Podium byRank={podium} />
          </CardContent>
        </Card>
      )}

      <section className="space-y-2">
        <h2 className="px-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          All-time leaderboard
        </h2>
        <LeaderboardTable rows={allTime} category={category} myId={myId} />
      </section>
    </div>
  );
}

function buildPodium(
  rows: LeaderRow[],
  category: CategoryKey,
  myId: string | undefined,
): Record<1 | 2 | 3, PodiumEntry[]> {
  const out: Record<1 | 2 | 3, PodiumEntry[]> = { 1: [], 2: [], 3: [] };
  for (const row of rows) {
    if (row.rk > 3) break;
    const rk = row.rk as 1 | 2 | 3;
    if (category === "weight" && noWeightMedal(row, category)) continue;
    out[rk].push({
      user_id: row.user_id,
      nickname: row.nickname,
      avatar_emoji: row.avatar_emoji,
      display: displayValueOf(row, category),
      is_you: row.user_id === myId,
      is_awaiting: isAwaitingWeight(row, category),
    });
  }
  return out;
}

function buildShareText(
  cfg: CategoryConfig,
  rows: LeaderRow[],
  weekStart: string,
): string {
  const week = isoWeekNumber(weekStart);
  const top3 = rows
    .filter((r) => r.rk <= 3)
    .slice(0, 3)
    .map((r, i) => {
      const medal = ["🥇", "🥈", "🥉"][i];
      const display = displayValueOf(r, cfg.category);
      return `${medal} ${r.nickname} ${display}`;
    })
    .join(" / ");
  const podiumStr = top3 || "no logs yet";
  return `🏆 Brand Sport League — Week ${week} ${cfg.title} Podium: ${podiumStr}`;
}
