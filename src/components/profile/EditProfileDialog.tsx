"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarPicker } from "./AvatarPicker";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth/errors";
import {
  profileEditSchema,
  type ProfileEditInput,
} from "@/lib/domain/validation";
import type { Profile } from "@/lib/supabase/types";

export function EditProfileDialog({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ProfileEditInput>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      full_name: profile.full_name,
      nickname: profile.nickname,
      height_cm: profile.height_cm,
      avatar_emoji: profile.avatar_emoji,
    },
  });

  const avatarEmoji = form.watch("avatar_emoji");

  async function onSubmit(values: ProfileEditInput) {
    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.full_name.trim(),
        nickname: values.nickname.trim(),
        height_cm: values.height_cm,
        avatar_emoji: values.avatar_emoji,
      })
      .eq("user_id", profile.user_id);
    setSubmitting(false);
    if (error) {
      toast.error(authErrorMessage(error.message));
      return;
    }
    toast.success("Profile updated");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center gap-1 rounded-full border bg-card/60 px-3 py-1.5 text-xs font-medium hover:bg-accent"
        aria-label="Edit profile"
      >
        <Pencil className="h-3.5 w-3.5" />
        <span>Edit</span>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit your profile</DialogTitle>
          <DialogDescription>
            Baseline weight is locked — ask the admin to change it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Full name" error={form.formState.errors.full_name?.message}>
            <Input {...form.register("full_name")} />
          </Field>
          <Field label="Nickname" error={form.formState.errors.nickname?.message}>
            <Input {...form.register("nickname")} />
          </Field>
          <Field label="Height (cm)" error={form.formState.errors.height_cm?.message}>
            <Input
              type="number"
              step="0.5"
              inputMode="decimal"
              {...form.register("height_cm", { valueAsNumber: true })}
            />
          </Field>
          <Field
            label="Baseline weight (kg)"
            hint="Admin-only"
          >
            <Input
              type="number"
              value={profile.baseline_weight_kg}
              disabled
              readOnly
            />
          </Field>
          <div className="space-y-1.5">
            <Label>Avatar</Label>
            <AvatarPicker
              value={avatarEmoji ?? profile.avatar_emoji}
              onChange={(e) =>
                form.setValue("avatar_emoji", e, { shouldValidate: true })
              }
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
