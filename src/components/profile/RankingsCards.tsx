import type { MyAllRanks } from "@/lib/queries/profile.server";
import { Footprints, PersonStanding, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

const PODIUM_TINT = (rk?: number | null) =>
  rk === 1
    ? "border-gold/60 bg-gold/10 text-gold"
    : rk === 2
      ? "border-silver/60 bg-silver/10"
      : rk === 3
        ? "border-bronze/60 bg-bronze/10"
        : "border-border bg-card/40 text-muted-foreground";

export function RankingsCards({ ranks }: { ranks: MyAllRanks }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      <Card
        Icon={Footprints}
        label="Steps"
        rk={ranks.steps?.rk}
        sub={
          ranks.steps
            ? `${ranks.steps.total.toLocaleString()} total`
            : "no data"
        }
      />
      <Card
        Icon={PersonStanding}
        label="Running"
        rk={ranks.running?.rk}
        sub={
          ranks.running ? `${ranks.running.total.toFixed(1)} km` : "no data"
        }
      />
      <Card
        Icon={Scale}
        label="Weight"
        rk={ranks.weight?.rk}
        sub={
          ranks.weight?.awaiting
            ? "📏 awaiting"
            : ranks.weight?.loss_pct == null
              ? "—"
              : `${ranks.weight.loss_pct.toFixed(1)}%`
        }
      />
    </div>
  );
}

function Card({
  Icon,
  label,
  rk,
  sub,
}: {
  Icon: typeof Footprints;
  label: string;
  rk?: number | null;
  sub: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-2xl border p-3 text-center transition-colors",
        PODIUM_TINT(rk),
      )}
    >
      <Icon className="h-4 w-4 opacity-70" strokeWidth={1.7} />
      <div className="text-[10px] font-bold uppercase tracking-wide opacity-80">
        {label}
      </div>
      <div className="text-2xl font-extrabold leading-none">
        {rk == null ? "—" : `#${rk}`}
      </div>
      <div className="text-[10px] tabular-nums opacity-70">{sub}</div>
    </div>
  );
}
