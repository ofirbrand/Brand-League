import { cn } from "@/lib/utils";

export type PodiumEntry = {
  user_id: string;
  nickname: string;
  avatar_emoji: string;
  display: string; // formatted value, e.g. "12,400" or "5.2 km" or "-2.1%"
  is_you?: boolean;
  is_awaiting?: boolean;
  no_medal?: boolean; // for negative weight loss
};

type PodiumProps = {
  /**
   * Indexed by rank (1, 2, 3). Each rank slot may hold zero or more entries
   * (Olympic-style ties → multiple winners share the medal).
   *
   * Example: { 1: [a, b], 2: [], 3: [c] } produces two golds, no silver,
   * one bronze.
   */
  byRank: Record<1 | 2 | 3, PodiumEntry[]>;
};

const SLOT_CONFIG = [
  {
    rank: 2 as const,
    medal: "🥈",
    label: "2nd",
    plinth: "plinth-silver",
    height: "h-24",
    order: "order-1",
  },
  {
    rank: 1 as const,
    medal: "🥇",
    label: "1st",
    plinth: "plinth-gold",
    height: "h-32",
    order: "order-2",
  },
  {
    rank: 3 as const,
    medal: "🥉",
    label: "3rd",
    plinth: "plinth-bronze",
    height: "h-20",
    order: "order-3",
  },
];

export function Podium({ byRank }: PodiumProps) {
  return (
    <div className="grid grid-cols-3 items-end gap-2">
      {SLOT_CONFIG.map(({ rank, medal, label, plinth, height, order }) => {
        const winners = byRank[rank] ?? [];
        const empty = winners.length === 0;
        return (
          <div
            key={rank}
            className={cn(
              "flex flex-col items-center gap-2",
              order,
            )}
          >
            <div className="text-2xl">{medal}</div>
            <div
              className={cn(
                "flex flex-wrap items-end justify-center px-1",
                winners.length > 1 ? "gap-x-1 gap-y-1" : "gap-1.5",
              )}
            >
              {empty ? (
                <GhostWinner />
              ) : (
                winners.map((w) => (
                  <Winner
                    key={w.user_id}
                    entry={w}
                    compact={winners.length > 1}
                  />
                ))
              )}
            </div>
            <div
              className={cn(
                "w-full rounded-t-xl shadow-inner",
                plinth,
                height,
                "flex items-end justify-center pb-2 text-xs font-extrabold uppercase tracking-wider text-navy-deep/70",
              )}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Winner({
  entry,
  compact = false,
}: {
  entry: PodiumEntry;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-xl transition-colors",
        compact ? "px-1 py-0.5" : "px-2 py-1",
        entry.is_you && "bg-you/15 ring-1 ring-you",
      )}
    >
      <div className={cn("leading-none", compact ? "text-xl" : "text-3xl")}>
        {entry.avatar_emoji}
      </div>
      <div
        className={cn(
          "line-clamp-2 text-center font-bold leading-tight break-words",
          compact ? "max-w-[52px] text-[10px]" : "max-w-[80px] text-[11px]",
        )}
      >
        {entry.is_you ? "You" : entry.nickname}
      </div>
      <div
        className={cn(
          "font-mono",
          compact ? "text-[9px]" : "text-[10px]",
          entry.is_awaiting
            ? "text-muted-foreground"
            : entry.no_medal
              ? "text-destructive"
              : "text-gold",
        )}
      >
        {entry.is_awaiting ? "📏 awaiting" : entry.display}
      </div>
    </div>
  );
}

function GhostWinner() {
  return (
    <div className="ghost-slot flex flex-col items-center gap-0.5 opacity-50">
      <div className="text-3xl leading-none grayscale">👻</div>
      <div className="text-[11px] font-bold text-muted-foreground">
        Be the first
      </div>
      <div className="text-[10px] font-mono text-muted-foreground">—</div>
    </div>
  );
}
