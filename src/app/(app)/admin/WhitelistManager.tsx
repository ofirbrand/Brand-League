"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth/errors";
import type { AllowedEmail } from "@/lib/supabase/types";

export function WhitelistManager({
  initialEmails,
}: {
  initialEmails: AllowedEmail[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [emails, setEmails] = useState(initialEmails);
  const [newEmail, setNewEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("allowed_emails")
      .insert({ email })
      .select()
      .single();
    setSubmitting(false);
    if (error) {
      toast.error(authErrorMessage(error.message));
      return;
    }
    setEmails((prev) => [data as AllowedEmail, ...prev]);
    setNewEmail("");
    toast.success("Added to whitelist");
    startTransition(() => router.refresh());
  }

  async function onRemove(email: string) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("allowed_emails")
      .delete()
      .eq("email", email);
    if (error) {
      toast.error(authErrorMessage(error.message));
      return;
    }
    setEmails((prev) => prev.filter((e) => e.email !== email));
    toast.success("Removed from whitelist");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-3">
      <form onSubmit={onAdd} className="flex gap-2">
        <Input
          type="email"
          placeholder="cousin@brand.family"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
        />
        <Button type="submit" disabled={submitting} className="gap-1">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </form>

      <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border">
        {emails.length === 0 ? (
          <li className="bg-card/40 p-4 text-center text-sm text-muted-foreground">
            No emails yet.
          </li>
        ) : (
          emails.map((e) => (
            <li
              key={e.email}
              className="flex items-center gap-3 bg-card/40 px-3 py-2"
            >
              <span className="flex-1 truncate text-sm font-mono">{e.email}</span>
              <button
                type="button"
                onClick={() => onRemove(e.email)}
                aria-label={`Remove ${e.email}`}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))
        )}
      </ul>
      <p className="text-xs text-muted-foreground">
        Removing an email here doesn&apos;t lock out anyone who already
        registered — only blocks future signups with that address.
      </p>
    </div>
  );
}
