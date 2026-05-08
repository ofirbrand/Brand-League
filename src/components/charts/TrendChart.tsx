"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

type Point = { week_start: string; value: number };

type Series = {
  mine: Point[];
  family: Point[];
};

type Props = {
  series: Series;
  /** Serializable formatter choice; functions cannot cross the server/client boundary. */
  valueFormat: "integer" | "oneDecimalPercent";
  /** y=0 reference line — used for weight loss%. */
  showZeroBaseline?: boolean;
};

export function TrendChart({ series, valueFormat, showZeroBaseline }: Props) {
  const yFormatter =
    valueFormat === "oneDecimalPercent"
      ? (n: number) => `${n.toFixed(1)}%`
      : (n: number) => n.toLocaleString();

  // Merge mine/family into a unified per-week dataset for Recharts.
  const allWeeks = new Set<string>();
  for (const p of series.mine) allWeeks.add(p.week_start);
  for (const p of series.family) allWeeks.add(p.week_start);
  const sortedWeeks = [...allWeeks].sort();

  const mineMap = new Map(series.mine.map((p) => [p.week_start, p.value]));
  const familyMap = new Map(series.family.map((p) => [p.week_start, p.value]));

  const data = sortedWeeks.map((w) => ({
    week: w,
    mine: mineMap.get(w) ?? null,
    family: familyMap.get(w) ?? null,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border bg-card/30 text-sm text-muted-foreground">
        No data yet — log something to see your trend.
      </div>
    );
  }

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            tickFormatter={(d: string) =>
              format(new Date(`${d}T12:00:00Z`), "MMM d")
            }
            interval="preserveStartEnd"
            minTickGap={32}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            tickFormatter={yFormatter}
            width={48}
          />
          {showZeroBaseline && (
            <ReferenceLine
              y={0}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
            />
          )}
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--popover-foreground)",
              fontSize: 12,
            }}
            labelFormatter={(label) =>
              typeof label === "string"
                ? format(new Date(`${label}T12:00:00Z`), "PPP")
                : String(label ?? "")
            }
            formatter={(value, name) => [
              typeof value === "number"
                ? yFormatter(value)
                : String(value ?? ""),
              name === "mine" ? "You" : "Family avg",
            ]}
          />
          <Line
            type="monotone"
            dataKey="family"
            stroke="rgba(192,192,192,0.55)"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="mine"
            stroke="var(--gold)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--gold)" }}
            isAnimationActive={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
