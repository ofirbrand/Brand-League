"use client";

import { Dumbbell, Footprints, PersonStanding, Scale } from "lucide-react";
import type { LogType } from "./LogSheetContext";
import { cn } from "@/lib/utils";

const TYPES: ReadonlyArray<{
  type: LogType;
  label: string;
  hint: string;
  Icon: typeof Footprints;
  iconClass: string;
}> = [
  {
    type: "run",
    label: "Run",
    hint: "Distance + duration",
    Icon: PersonStanding,
    iconClass: "text-rose-300",
  },
  {
    type: "walk",
    label: "Walk",
    hint: "Daily step count",
    Icon: Footprints,
    iconClass: "text-sky-300",
  },
  {
    type: "weight",
    label: "Weight",
    hint: "Current check-in",
    Icon: Scale,
    iconClass: "text-emerald-300",
  },
  {
    type: "gym",
    label: "Gym",
    hint: "Duration + activity",
    Icon: Dumbbell,
    iconClass: "text-amber-300",
  },
];

export function LogTypeCards({
  onSelect,
}: {
  onSelect: (t: LogType) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {TYPES.map(({ type, label, hint, Icon, iconClass }) => (
        <button
          key={type}
          type="button"
          onClick={() => onSelect(type)}
          className={cn(
            "group flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card/70 p-4 text-center transition-all",
            "hover:-translate-y-0.5 hover:bg-card hover:ring-2 hover:ring-gold/50",
          )}
        >
          <Icon
            className={cn(
              "h-8 w-8 transition-transform group-hover:scale-110",
              iconClass,
            )}
            strokeWidth={1.5}
          />
          <div>
            <div className="text-sm font-bold">{label}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {hint}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
