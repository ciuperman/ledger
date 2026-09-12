import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { MixSlice } from "@/lib/ledger/analytics";
import { formatRon } from "@/lib/ledger/format";
import type { CategoryId } from "@/lib/ledger/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ClientOnly } from "./client-only";
import { ChartTooltip } from "./chart-tooltip";

export function SpendMix({
  data,
  focus,
  onFocus,
}: {
  data: MixSlice[];
  focus: CategoryId | null;
  onFocus: (id: CategoryId) => void;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Card className="stagger-in min-w-0" style={{ animationDelay: "200ms" }}>
      <CardHeader>
        <CardTitle>Spend mix</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No expenses in this range. Add an expense to see the mix.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div
              className="relative mx-auto h-52 w-full max-w-xs overflow-hidden outline-none [&_svg]:outline-none"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <ClientOnly fallback={<Skeleton className="mx-auto size-52 rounded-full" />}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="label"
                      innerRadius="62%"
                      outerRadius="88%"
                      paddingAngle={1.5}
                      stroke="none"
                      isAnimationActive={false}
                      activeShape={false}
                      onClick={(_, index) => {
                        const slice = data[index];
                        if (slice) onFocus(slice.category);
                      }}
                      style={{ cursor: "pointer", outline: "none" }}
                    >
                      {data.map((slice) => (
                        <Cell
                          key={slice.category}
                          fill={slice.color}
                          stroke="none"
                          opacity={focus && focus !== slice.category ? 0.28 : 1}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={ChartTooltip} cursor={false} wrapperStyle={{ outline: "none" }} />
                  </PieChart>
                </ResponsiveContainer>
              </ClientOnly>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
                <span className="text-xs text-muted-foreground">Spend</span>
                <span className="font-mono text-sm tabular-nums text-foreground">
                  {formatRon(total)}
                </span>
              </div>
            </div>
            <ul className="space-y-1">
              {data.slice(0, 6).map((slice) => (
                <li key={slice.category}>
                  <button
                    type="button"
                    onClick={() => onFocus(slice.category)}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left transition-colors duration-150 hover:bg-accent",
                      focus === slice.category && "bg-accent",
                    )}
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ background: slice.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">{slice.label}</span>
                    <span className="shrink-0 font-mono text-xs tabular-nums whitespace-nowrap text-muted-foreground">
                      {(slice.share * 100).toFixed(0)}%
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
