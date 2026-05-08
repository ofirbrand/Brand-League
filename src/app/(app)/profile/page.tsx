import { redirect } from "next/navigation";
import Link from "next/link";
import {
  fetchMyProfile,
  fetchMyRanks,
  fetchTrendData,
  fetchMyActivity,
} from "@/lib/queries/profile.server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendChart } from "@/components/charts/TrendChart";
import { RankingsCards } from "@/components/profile/RankingsCards";
import { ActivityHistory } from "@/components/profile/ActivityHistory";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { SignOutButton } from "@/components/profile/SignOutButton";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) redirect("/login");

  const profile = await fetchMyProfile(user.id);
  if (!profile) {
    return (
      <div className="rounded-2xl border bg-card/40 p-6 text-center text-sm">
        Profile is missing — please sign out and back in.
      </div>
    );
  }

  const [ranks, trends, activity] = await Promise.all([
    fetchMyRanks(user.id),
    fetchTrendData(user.id),
    fetchMyActivity(user.id, 50),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-5xl">{profile.avatar_emoji}</div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">
              {profile.nickname}
            </h1>
            <p className="text-xs text-muted-foreground">
              {profile.full_name} · {user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <EditProfileDialog profile={profile} />
        </div>
      </header>

      <RankingsCards ranks={ranks} />

      {profile.is_admin && (
        <div className="rounded-2xl border border-gold/40 bg-gold/5 px-4 py-3 text-sm">
          <Link href="/admin" className="font-semibold text-gold">
            🛡 Admin panel →
          </Link>
        </div>
      )}

      {/* Trend charts */}
      <div className="space-y-4">
        <ChartCard title="Steps per week" emoji="👟">
          <TrendChart
            series={trends.steps}
            valueFormat="integer"
          />
        </ChartCard>
        <ChartCard title="Running km per week" emoji="🏃">
          <TrendChart
            series={trends.running}
            valueFormat="integer"
          />
        </ChartCard>
        <ChartCard title="Weight loss % per week" emoji="⚖️">
          <TrendChart
            series={trends.weight}
            valueFormat="oneDecimalPercent"
            showZeroBaseline
          />
        </ChartCard>
      </div>

      {/* Activity history */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Activity history
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHistory rows={activity} />
        </CardContent>
      </Card>

      <div className="flex justify-center pt-2">
        <SignOutButton />
      </div>
    </div>
  );
}

function ChartCard({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <span className="text-base">{emoji}</span>
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  );
}
