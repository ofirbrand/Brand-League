"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ActivityRow } from "@/lib/queries/profile.server";
import { authErrorMessage } from "@/lib/auth/errors";
import { todayInJerusalem } from "@/lib/domain/week";
import { cn } from "@/lib/utils";

const KIND_META = {
  step: { emoji: "👟", label: "Steps" },
  run: { emoji: "🏃", label: "Run" },
  weight: { emoji: "⚖️", label: "Weight" },
  gym: { emoji: "🏋️", label: "Gym" },
} as const;

const FILTER_LABEL: Record<"all" | "step" | "run" | "weight" | "gym", string> = {
  all: "All",
  step: "Steps",
  run: "Runs",
  weight: "Weight",
  gym: "Gym",
};

export function ActivityHistory({ rows }: { rows: ActivityRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<
    "all" | "step" | "run" | "weight" | "gym"
  >("all");

  const today = todayInJerusalem();
  const visible = rows.filter((r) => filter === "all" || r.kind === filter);

  async function onDelete(row: ActivityRow) {
    const supabase = createSupabaseBrowserClient();
    let error: { message: string } | null = null;

    if (row.kind === "step") {
      const res = await supabase
        .from("step_logs")
        .delete()
        .eq("user_id", row.user_id)
        .eq("log_date", row.log_date);
      error = res.error;
    } else if (row.kind === "run") {
      const res = await supabase.from("run_logs").delete().eq("id", row.id);
      error = res.error;
    } else if (row.kind === "gym") {
      const res = await supabase.from("gym_logs").delete().eq("id", row.id);
      error = res.error;
    } else {
      const res = await supabase
        .from("weight_logs")
        .delete()
        .eq("user_id", row.user_id)
        .eq("log_date", row.log_date);
      error = res.error;
    }

    if (error) {
      toast.error(authErrorMessage(error.message));
      return;
    }
    toast.success("Removed");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {(["all", "run", "step", "weight", "gym"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filter === k
                ? "bg-gold text-navy-deep"
                : "bg-card/50 text-muted-foreground hover:bg-card",
            )}
          >
            {FILTER_LABEL[k]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border bg-card/40 p-6 text-center text-sm text-muted-foreground">
          No entries yet — tap the + to log something.
        </div>
      ) : (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border">
          {visible.map((row) => {
            const stepLocked = row.kind === "step" && row.log_date < today;
            return (
              <li
                key={
                  row.kind === "run"
                    ? `run-${row.id}`
                    : row.kind === "gym"
                      ? `gym-${row.id}`
                      : `${row.kind}-${row.user_id}-${row.log_date}`
                }
                className="flex items-center gap-3 bg-card/40 px-3 py-2.5"
              >
                <div className="text-2xl">{KIND_META[row.kind].emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">
                    {KIND_META[row.kind].label} ·{" "}
                    <span className="font-normal text-muted-foreground">
                      {format(new Date(`${row.log_date}T12:00:00Z`), "EEE, MMM d")}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-gold">
                    {summary(row)}
                  </div>
                </div>
                {stepLocked ? (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                    title="Past-day step entries can't be edited or deleted."
                  >
                    Locked
                  </span>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This rebases the leaderboard. There&apos;s no undo.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={isPending}
                          onClick={() => onDelete(row)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function summary(row: ActivityRow): string {
  if (row.kind === "step") return `${row.steps.toLocaleString()} steps`;
  if (row.kind === "run")
    return `${row.distance_km.toFixed(1)} km · ${row.duration_min} min`;
  if (row.kind === "gym") return `${row.duration_min} min · ${row.activity}`;
  return `${row.weight_kg.toFixed(1)} kg`;
}
