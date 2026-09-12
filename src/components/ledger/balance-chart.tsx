import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BalancePoint } from "@/lib/ledger/analytics";
import { formatAxis } from "@/lib/ledger/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientOnly } from "./client-only";
import { ChartTooltip } from "./chart-tooltip";
import { Skeleton } from "@/components/ui/skeleton";

export function BalanceChart({
  data,
  focused,
}: {
  data: BalancePoint[];
  focused: boolean;
}) {
  return (
    <Card className="stagger-in min-w-0" style={{ animationDelay: "160ms" }}>
      <CardHeader>
        <CardTitle>{focused ? "Focused cumulative" : "Balance trend"}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.every((d) => d.balance === 0) ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {focused ? "No activity in this focus." : "No balance yet. Log a transaction to start the trend."}
          </p>
        ) : (
        <div className="h-64 w-full">
          <ClientOnly fallback={<Skeleton className="h-full w-full" />}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-line)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--color-chart-line)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="var(--color-chart-grid)"
                  vertical={false}
                  strokeDasharray="3 6"
                />
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
                <Tooltip
                  cursor={{ stroke: "var(--color-border)" }}
                  content={ChartTooltip}
                />
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
              </AreaChart>
            </ResponsiveContainer>
          </ClientOnly>
        </div>
        )}
      </CardContent>
    </Card>
  );
}
