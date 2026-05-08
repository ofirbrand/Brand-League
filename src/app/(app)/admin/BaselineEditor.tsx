"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth/errors";
import type { Profile } from "@/lib/supabase/types";

export function BaselineEditor({ profiles }: { profiles: Profile[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  if (profiles.length === 0) {
    return (
      <div className="rounded-2xl border bg-card/40 p-4 text-center text-sm text-muted-foreground">
        No registered users yet.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border">
      {profiles.map((p) => (
        <Row
          key={p.user_id}
          profile={p}
          onSaved={() => startTransition(() => router.refresh())}
        />
      ))}
    </ul>
  );
}

function Row({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: () => void;
}) {
  const [value, setValue] = useState(profile.baseline_weight_kg.toString());
  const [submitting, setSubmitting] = useState(false);

  async function onSave() {
    const num = Number(value);
    if (!Number.isFinite(num) || num < 30 || num > 300) {
      toast.error("Weight must be between 30 and 300 kg.");
      return;
    }
    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("profiles")
      .update({ baseline_weight_kg: num })
      .eq("user_id", profile.user_id);
    setSubmitting(false);
    if (error) {
      toast.error(authErrorMessage(error.message));
      return;
    }
    toast.success(`Baseline updated for ${profile.nickname}`);
    onSaved();
  }

  const dirty = Number(value) !== profile.baseline_weight_kg;

  return (
    <li className="flex items-center gap-3 bg-card/40 px-3 py-2.5">
      <span className="text-2xl">{profile.avatar_emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-medium">{profile.nickname}</div>
        <div className="truncate text-xs text-muted-foreground">
          {profile.full_name}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24 font-mono"
        />
        <span className="text-xs text-muted-foreground">kg</span>
        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={!dirty || submitting}
          className="gap-1"
        >
          <Save className="h-3.5 w-3.5" />
          Save
        </Button>
      </div>
    </li>
  );
}
