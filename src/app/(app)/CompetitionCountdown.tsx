"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  endAtIso: string;
};

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
};

function computeRemaining(endAtMs: number, nowMs: number): Remaining {
  const total = Math.max(0, endAtMs - nowMs);
  const seconds = Math.floor(total / 1000) % 60;
  const minutes = Math.floor(total / (1000 * 60)) % 60;
  const hours = Math.floor(total / (1000 * 60 * 60)) % 24;
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, total };
}

const ZERO: Remaining = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };

/** Pads to two digits; days uses 3 digits when >=100. */
function pad(n: number, width: 2 | 3 = 2): string {
  return String(n).padStart(width, "0");
}

export function CompetitionCountdown({ label, endAtIso }: Props) {
  const endAtMs = new Date(endAtIso).getTime();
  // null until the client effect has computed the first real remaining value;
  // keeps SSR / first client render in sync (both show placeholder zeros).
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(computeRemaining(endAtMs, Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endAtMs]);

  const display = remaining ?? ZERO;
  const expired = remaining !== null && remaining.total <= 0;
  const dayWidth: 2 | 3 = display.days >= 100 ? 3 : 2;

  return (
    <section
      aria-label={label}
      className={cn(
        "relative overflow-hidden rounded-xl bg-gradient-to-b from-[#0e1c33] to-[#081325]",
        "ring-1 ring-gold/30 shadow-[0_0_0_1px_rgba(255,215,0,0.05),0_8px_30px_-12px_rgba(255,215,0,0.25)]",
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <header className="flex items-center justify-between gap-2 border-b border-white/5 px-4 py-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              expired ? "bg-muted-foreground" : "bg-destructive animate-pulse",
            )}
            aria-hidden
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            {expired ? "Final" : "Live"}
          </span>
        </div>
        <h2 className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-gold/90">
          {label}
        </h2>
        <div className="flex items-center gap-1" aria-hidden>
          <span className="block h-1.5 w-1.5 rounded-full bg-gold/70" />
          <span className="block h-1.5 w-1.5 rounded-full bg-gold/40" />
          <span className="block h-1.5 w-1.5 rounded-full bg-gold/20" />
        </div>
      </header>

      {expired ? (
        <div className="px-4 py-6 text-center">
          <p className="font-mono text-2xl font-extrabold uppercase tracking-[0.3em] text-gold">
            Competition ended
          </p>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-1.5 px-3 py-4 sm:gap-2 sm:px-4">
          <Segment value={pad(display.days, dayWidth)} unit="Days" />
          <Separator />
          <Segment value={pad(display.hours)} unit="Hours" />
          <Separator />
          <Segment value={pad(display.minutes)} unit="Mins" />
          <Separator />
          <Segment
            value={pad(display.seconds)}
            unit="Secs"
            tickKey={display.seconds}
          />
        </div>
      )}
    </section>
  );
}

function Segment({
  value,
  unit,
  tickKey,
}: {
  value: string;
  unit: string;
  tickKey?: number;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-md",
          "bg-[#050d1c] ring-1 ring-inset ring-gold/15",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),inset_0_-12px_24px_-12px_rgba(0,0,0,0.6)]",
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/60" />
        <div
          key={tickKey}
          className="px-1 py-2 text-center font-mono text-3xl font-extrabold leading-none tracking-tight text-gold tabular-nums sm:py-3 sm:text-4xl md:text-5xl"
          style={{ textShadow: "0 0 10px rgba(255, 215, 0, 0.35)" }}
        >
          {value}
        </div>
      </div>
      <span className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground sm:text-[10px]">
        {unit}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <div
      aria-hidden
      className="flex shrink-0 self-stretch items-center pb-5 text-xl font-extrabold leading-none text-gold/40 sm:text-2xl"
    >
      :
    </div>
  );
}
