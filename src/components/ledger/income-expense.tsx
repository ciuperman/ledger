import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BarPoint } from "@/lib/ledger/analytics";
import { formatAxis } from "@/lib/ledger/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientOnly } from "./client-only";
import { ChartTooltip } from "./chart-tooltip";

export function IncomeExpense({ data }: { data: BarPoint[] }) {
  return (
    <Card className="stagger-in min-w-0" style={{ animationDelay: "240ms" }}>
      <CardHeader>
        <CardTitle>Income vs expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {data.every((d) => d.income === 0 && d.expense === 0) ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No income or expenses in this range.
          </p>
        ) : (
        <div className="h-64 w-full">
          <ClientOnly fallback={<Skeleton className="h-full w-full" />}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  tickFormatter={(v: number) => formatAxis(v)}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-accent)" }}
                  content={ChartTooltip}
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="var(--color-income)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={18}
                />
                <Bar
                  dataKey="expense"
                  name="Expenses"
                  fill="var(--color-expense)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </ClientOnly>
        </div>
        )}
      </CardContent>
    </Card>
  );
}
