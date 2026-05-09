import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  fetchAllTimeLeaderboard,
  displayValueOf,
  isAwaitingWeight,
  noWeightMedal,
  type CategoryKey,
  type LeaderRow,
} from "@/lib/queries/leaderboards.server";
import { Podium, type PodiumEntry } from "@/components/podium/Podium";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HomeMountConfetti } from "./HomeMountConfetti";

const SECTIONS: Array<{
  category: CategoryKey;
  title: string;
  emoji: string;
  href: string;
  description: string;
}> = [
  {
    category: "steps",
    title: "Steps",
    emoji: "👟",
    href: "/steps",
    description: "All-time cumulative",
  },
  {
    category: "running",
    title: "Running",
    emoji: "🏃",
    href: "/running",
    description: "All-time cumulative km",
  },
  {
    category: "weight",
    title: "Weight Loss",
    emoji: "⚖️",
    href: "/weight",
    description: "Loss % from baseline",
  },
  {
    category: "gym",
    title: "Gym",
    emoji: "🏋️",
    href: "/gym",
    description: "All-time cumulative minutes",
  },
];

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const myId = auth.user?.id;

  const [stepsRows, runningRows, weightRows, gymRows] = await Promise.all([
    fetchAllTimeLeaderboard("steps"),
    fetchAllTimeLeaderboard("running"),
    fetchAllTimeLeaderboard("weight"),
    fetchAllTimeLeaderboard("gym"),
  ]);

  const buckets: Record<CategoryKey, LeaderRow[]> = {
    steps: stepsRows,
    running: runningRows,
    weight: weightRows,
    gym: gymRows,
  };

  return (
    <div className="space-y-6">
      <HomeMountConfetti />

      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          The Brand Sport League
        </h1>
      </header>

      {SECTIONS.map((s) => {
        const podium = buildPodium(buckets[s.category], s.category, myId);
        return (
          <Card key={s.category} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{s.emoji}</span>
                  <span>{s.title}</span>
                </CardTitle>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {s.description}
                </p>
              </div>
              <Link
                href={s.href}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
              >
                View <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent className="pt-2 pb-5">
              <Podium byRank={podium} />
            </CardContent>
          </Card>
        );
      })}
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
    if (row.rk > 3) break; // sorted asc
    const rk = row.rk as 1 | 2 | 3;

    // Weight category: skip medals for users with no medal eligibility (gain or even).
    if (category === "weight" && noWeightMedal(row, category)) {
      continue;
    }

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
