"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import {
  runLogSchema,
  stepLogSchema,
  weightLogSchema,
  type RunLogInput,
  type StepLogInput,
  type WeightLogInput,
} from "@/lib/domain/validation";
import { todayInJerusalem } from "@/lib/domain/week";
import {
  submitLog,
  categoriesAffectedBy,
  type AnyLogInput,
} from "@/lib/queries/logs";
import { fetchMyAllTimeRank } from "@/lib/queries/leaderboards";
import { celebrate } from "@/lib/confetti";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { LogType } from "./LogSheetContext";
import { authErrorMessage } from "@/lib/auth/errors";

type Props = {
  type: LogType;
  onChangeType: () => void;
  onSubmitted: () => void;
};

export function LogForm({ type, onChangeType, onSubmitted }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (active) setUserId(data.user?.id ?? null);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (type === "run") {
    return (
      <RunFields
        submitting={submitting}
        userId={userId}
        onChangeType={onChangeType}
        onAfterSubmit={async () => {
          onSubmitted();
          router.refresh();
        }}
        setSubmitting={setSubmitting}
      />
    );
  }
  if (type === "walk") {
    return (
      <WalkFields
        submitting={submitting}
        userId={userId}
        onChangeType={onChangeType}
        onAfterSubmit={async () => {
          onSubmitted();
          router.refresh();
        }}
        setSubmitting={setSubmitting}
      />
    );
  }
  return (
    <WeightFields
      submitting={submitting}
      userId={userId}
      onChangeType={onChangeType}
      onAfterSubmit={async () => {
        onSubmitted();
        router.refresh();
      }}
      setSubmitting={setSubmitting}
    />
  );
}

// =====================================================================
// Per-type forms
// =====================================================================

type FieldsProps = {
  submitting: boolean;
  setSubmitting: (b: boolean) => void;
  userId: string | null;
  onChangeType: () => void;
  onAfterSubmit: () => Promise<void>;
};

function RunFields(props: FieldsProps) {
  const today = useMemo(() => todayInJerusalem(), []);
  const form = useForm<RunLogInput>({
    resolver: zodResolver(runLogSchema),
    defaultValues: { log_date: today },
  });

  return (
    <FormShell
      label="Run"
      onChangeType={props.onChangeType}
      onSubmit={form.handleSubmit(async (values) => {
        await runSubmit(
          props,
          { type: "run", payload: values },
          () => form.reset(),
        );
      })}
      submitting={props.submitting}
    >
      <DateField form={form} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Distance (km)" error={form.formState.errors.distance_km?.message}>
          <Input
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder="5.2"
            {...form.register("distance_km", { valueAsNumber: true })}
          />
        </Field>
        <Field
          label="Duration (min)"
          error={form.formState.errors.duration_min?.message}
        >
          <Input
            type="number"
            step="1"
            inputMode="numeric"
            placeholder="30"
            {...form.register("duration_min", { valueAsNumber: true })}
          />
        </Field>
      </div>
    </FormShell>
  );
}

function WalkFields(props: FieldsProps) {
  const today = useMemo(() => todayInJerusalem(), []);
  const form = useForm<StepLogInput>({
    resolver: zodResolver(stepLogSchema),
    defaultValues: { log_date: today },
  });

  return (
    <FormShell
      label="Walk"
      onChangeType={props.onChangeType}
      onSubmit={form.handleSubmit(async (values) => {
        await runSubmit(
          props,
          { type: "walk", payload: values },
          () => form.reset(),
        );
      })}
      submitting={props.submitting}
    >
      <DateField form={form} />
      <Field label="Steps today" error={form.formState.errors.steps?.message}>
        <Input
          type="number"
          inputMode="numeric"
          step="1"
          placeholder="8500"
          {...form.register("steps", { valueAsNumber: true })}
        />
      </Field>
      <p className="text-xs text-muted-foreground">
        Re-logging today replaces your current daily total.
      </p>
    </FormShell>
  );
}

function WeightFields(props: FieldsProps) {
  const today = useMemo(() => todayInJerusalem(), []);
  const form = useForm<WeightLogInput>({
    resolver: zodResolver(weightLogSchema),
    defaultValues: { log_date: today },
  });

  return (
    <FormShell
      label="Weight"
      onChangeType={props.onChangeType}
      onSubmit={form.handleSubmit(async (values) => {
        await runSubmit(
          props,
          { type: "weight", payload: values },
          () => form.reset(),
        );
      })}
      submitting={props.submitting}
    >
      <DateField form={form} />
      <Field label="Weight (kg)" error={form.formState.errors.weight_kg?.message}>
        <Input
          type="number"
          step="0.1"
          inputMode="decimal"
          placeholder="74.5"
          {...form.register("weight_kg", { valueAsNumber: true })}
        />
      </Field>
    </FormShell>
  );
}

// =====================================================================
// Submit pipeline
// =====================================================================

async function runSubmit(
  props: FieldsProps,
  log: AnyLogInput,
  resetForm: () => void,
) {
  if (!props.userId) {
    toast.error("Not signed in.");
    return;
  }
  props.setSubmitting(true);

  // Snapshot ranks BEFORE the write so we can detect a podium-move.
  const affected = categoriesAffectedBy(log.type);
  const before = await Promise.all(
    affected.map((c) => fetchMyAllTimeRank(props.userId!, c)),
  );

  const { error } = await submitLog(props.userId, log);
  if (error) {
    props.setSubmitting(false);
    toast.error(authErrorMessage(error.message));
    return;
  }

  const after = await Promise.all(
    affected.map((c) => fetchMyAllTimeRank(props.userId!, c)),
  );

  const movedToPodium = before.some((b, i) => {
    const a = after[i];
    if (a == null) return false;
    if (a > 3) return false;
    return b == null || b > 3;
  });

  toast.success(messageFor(log));
  if (movedToPodium) {
    toast.success("🥇 New podium spot!");
    celebrate("podium");
  }
  resetForm();
  props.setSubmitting(false);
  await props.onAfterSubmit();
}

function messageFor(log: AnyLogInput): string {
  if (log.type === "run") {
    return `🏃 Logged ${log.payload.distance_km} km in ${log.payload.duration_min} min`;
  }
  if (log.type === "walk") {
    return `👟 Logged ${log.payload.steps.toLocaleString()} steps`;
  }
  return `⚖️ Logged ${log.payload.weight_kg} kg`;
}

// =====================================================================
// Reusable bits
// =====================================================================

function FormShell({
  label,
  onChangeType,
  onSubmit,
  submitting,
  children,
}: {
  label: string;
  onChangeType: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  children: React.ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <button
        type="button"
        onClick={onChangeType}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Change type
      </button>
      <div className="rounded-2xl border bg-card/50 p-4 space-y-4">
        <div className="text-sm font-bold uppercase tracking-wide text-gold">
          {label}
        </div>
        {children}
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Saving…" : "Save log"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function DateField<TForm extends { log_date: string }>({
  form,
}: {
  form: UseFormReturn<TForm>;
}) {
  const today = useMemo(() => todayInJerusalem(), []);
  // Cast through unknown to satisfy generic field name typing for log_date.
  const value = form.watch("log_date" as never) as unknown as string;

  return (
    <Field label="Date" error={form.formState.errors.log_date?.message as string}>
      <Popover>
        <PopoverTrigger
          className={cn(
            "inline-flex w-full items-center rounded-md border border-input bg-background px-3 py-2 text-left text-sm font-normal shadow-xs transition-colors hover:bg-accent",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(new Date(`${value}T12:00:00Z`), "PPP") : "Pick a date"}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? new Date(`${value}T12:00:00Z`) : undefined}
            onSelect={(d) => {
              if (!d) return;
              const iso = format(d, "yyyy-MM-dd");
              form.setValue("log_date" as never, iso as never, {
                shouldValidate: true,
              });
            }}
            disabled={{ after: new Date(`${today}T23:59:59Z`) }}
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
