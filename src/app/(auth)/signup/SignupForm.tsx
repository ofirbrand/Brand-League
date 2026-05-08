"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarPicker } from "@/components/profile/AvatarPicker";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth/errors";
import {
  signupProfileSchema,
  type SignupProfileInput,
} from "@/lib/domain/validation";
import { DEFAULT_AVATAR } from "@/lib/domain/avatars";
import { toast } from "sonner";

export function SignupForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupProfileInput>({
    resolver: zodResolver(signupProfileSchema),
    defaultValues: { avatar_emoji: DEFAULT_AVATAR },
  });

  const avatarEmoji = watch("avatar_emoji");

  async function onSubmit(values: SignupProfileInput) {
    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        data: {
          full_name: values.full_name.trim(),
          nickname: values.nickname.trim(),
          height_cm: values.height_cm,
          baseline_weight_kg: values.baseline_weight_kg,
          avatar_emoji: values.avatar_emoji,
        },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined,
      },
    });
    setSubmitting(false);

    if (error) {
      toast.error(authErrorMessage(error.message));
      return;
    }

    setConfirmationSent(true);
    toast.success("Confirmation email sent — check your inbox.");
    setTimeout(() => router.push("/login"), 4000);
  }

  if (confirmationSent) {
    return (
      <div className="rounded-2xl border bg-card/70 p-6 text-center">
        <div className="text-5xl">📬</div>
        <h2 className="mt-3 text-lg font-bold">One more step</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to your email. Click it, then come back
          and log in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field
        label="Email"
        error={errors.email?.message}
      >
        <Input
          type="email"
          autoComplete="email"
          {...register("email")}
        />
      </Field>

      <Field label="Password" error={errors.password?.message}>
        <Input
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
      </Field>

      <Field label="Full name" error={errors.full_name?.message}>
        <Input autoComplete="name" {...register("full_name")} />
      </Field>

      <Field
        label="Nickname (shown on the leaderboard)"
        error={errors.nickname?.message}
      >
        <Input autoComplete="nickname" {...register("nickname")} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Height (cm)" error={errors.height_cm?.message}>
          <Input
            type="number"
            step="0.5"
            inputMode="decimal"
            {...register("height_cm", { valueAsNumber: true })}
          />
        </Field>
        <Field
          label="Current weight (kg)"
          error={errors.baseline_weight_kg?.message}
          hint="Locked as your baseline"
        >
          <Input
            type="number"
            step="0.1"
            inputMode="decimal"
            {...register("baseline_weight_kg", { valueAsNumber: true })}
          />
        </Field>
      </div>

      <div className="space-y-1.5">
        <Label>Pick an avatar</Label>
        <AvatarPicker
          value={avatarEmoji ?? DEFAULT_AVATAR}
          onChange={(e) =>
            setValue("avatar_emoji", e, { shouldValidate: true })
          }
        />
        {errors.avatar_emoji && (
          <p className="text-sm text-destructive">
            {errors.avatar_emoji.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Creating account…" : "Join the league 🏆"}
      </Button>
    </form>
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
        {hint && (
          <span className="text-xs text-muted-foreground">{hint}</span>
        )}
      </div>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
