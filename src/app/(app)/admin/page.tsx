import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WhitelistManager } from "./WhitelistManager";
import { BaselineEditor } from "./BaselineEditor";
import type { AllowedEmail, Profile } from "@/lib/supabase/types";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) notFound();

  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!me?.is_admin) notFound();

  const [emailsRes, profilesRes] = await Promise.all([
    supabase
      .from("allowed_emails")
      .select("*")
      .order("added_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("*")
      .order("nickname", { ascending: true }),
  ]);

  const emails = (emailsRes.data ?? []) as AllowedEmail[];
  const profiles = (profilesRes.data ?? []) as Profile[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight md:text-3xl">
          🛡 Admin
        </h1>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Family-only powers
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email whitelist</CardTitle>
        </CardHeader>
        <CardContent>
          <WhitelistManager initialEmails={emails} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit baseline weights</CardTitle>
        </CardHeader>
        <CardContent>
          <BaselineEditor profiles={profiles} />
        </CardContent>
      </Card>
    </div>
  );
}
