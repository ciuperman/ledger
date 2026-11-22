import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BalancePoint } from "@/lib/ledger/analytics";
import { formatAxis, formatRon } from "@/lib/ledger/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientOnly } from "./client-only";
import { Skeleton } from "@/components/ui/skeleton";

const SERIES = [
  { key: "balance", name: "Balance", color: "var(--color-chart-line)" },
  { key: "ma20", name: "MA20", color: "var(--color-ma-20)" },
  { key: "ma50", name: "MA50", color: "var(--color-ma-50)" },
  { key: "ma200", name: "MA200", color: "var(--color-ma-200)" },
  { key: "rsi", name: "RSI", color: "var(--color-rsi)" },
] as const;

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string; dataKey?: string | number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-popover px-3 py-2 text-xs shadow-[var(--shadow-border)]">
      {label ? <p className="mb-1 text-muted-foreground">{label}</p> : null}
      <ul className="space-y-0.5">
        {payload.map((item) => {
          const n = typeof item.value === "number" ? item.value : Number(item.value);
          const text = !Number.isFinite(n)
            ? "—"
            : item.dataKey === "rsi"
              ? n.toFixed(1)
              : formatRon(n);
          return (
            <li
              key={String(item.dataKey ?? item.name)}
              className="flex items-center justify-between gap-6 tabular-nums text-foreground"
            >
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full" style={{ background: item.color }} />
                {item.name}
              </span>
              <span className="font-mono">{text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Legend() {
  return (
    <ul className="mb-2 flex flex-wrap gap-x-3 gap-y-1">
      {SERIES.map((series) => (
        <li key={series.key} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-0.5 w-3 rounded-full" style={{ background: series.color }} />
          {series.name}
        </li>
      ))}
    </ul>
  );
}

export function BalanceChart({
  data,
  focused,
}: {
  data: BalancePoint[];
  focused: boolean;
}) {
  const flat = data.every((d) => d.balance === 0);
  return (
    <Card className="stagger-in min-w-0" style={{ animationDelay: "160ms" }}>
      <CardHeader>
        <CardTitle>{focused ? "Focused cumulative" : "Balance trend"}</CardTitle>
      </CardHeader>
      <CardContent>
        {flat ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {focused ? "No activity in this focus." : "No balance yet. Log a transaction to start the trend."}
          </p>
        ) : (
          <ClientOnly fallback={<Skeleton className="h-80 w-full" />}>
            <Legend />
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-line)" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="var(--color-chart-line)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-chart-grid)" vertical={false} strokeDasharray="3 6" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={28}
                  />
                  <YAxis
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                    tickFormatter={(v: number) => formatAxis(v)}
                    domain={[
                      (min: number) => min - Math.max(Math.abs(min) * 0.05, 50),
                      (max: number) => max + Math.max(Math.abs(max) * 0.05, 50),
                    ]}
                  />
                  <Tooltip cursor={{ stroke: "var(--color-border)" }} content={TrendTooltip} />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="Balance"
                    stroke="var(--color-chart-line)"
                    fill="url(#balFill)"
                    strokeWidth={1.75}
                    dot={false}
                    activeDot={{ r: 3, strokeWidth: 0, fill: "var(--color-primary)" }}
                  />
                  <Line type="monotone" dataKey="ma20" name="MA20" stroke="var(--color-ma-20)" strokeWidth={1.5} dot={false} connectNulls={false} />
                  <Line type="monotone" dataKey="ma50" name="MA50" stroke="var(--color-ma-50)" strokeWidth={1.5} dot={false} connectNulls={false} />
                  <Line type="monotone" dataKey="ma200" name="MA200" stroke="var(--color-ma-200)" strokeWidth={1.5} dot={false} connectNulls={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-chart-grid)" vertical={false} strokeDasharray="3 6" />
                  <XAxis dataKey="label" hide />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[30, 70]}
                    width={36}
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip cursor={{ stroke: "var(--color-border)" }} content={TrendTooltip} />
                  <ReferenceLine y={70} stroke="var(--color-ma-200)" strokeDasharray="3 6" strokeOpacity={0.7} />
                  <ReferenceLine y={30} stroke="var(--color-chart-grid)" strokeDasharray="3 6" />
                  <Line type="monotone" dataKey="rsi" name="RSI" stroke="var(--color-rsi)" strokeWidth={1.5} dot={false} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ClientOnly>
        )}
      </CardContent>
    </Card>
  );
}
