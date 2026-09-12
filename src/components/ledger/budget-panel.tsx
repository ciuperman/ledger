import type { BudgetProgress } from "@/lib/ledger/analytics";
import { formatMonthLabel, formatRon } from "@/lib/ledger/format";
import type { CategoryId } from "@/lib/ledger/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function BudgetPanel({
  rows,
  month,
  focus,
  onFocus,
  onManage,
}: {
  rows: BudgetProgress[];
  month: Date;
  focus: CategoryId | null;
  onFocus: (id: CategoryId) => void;
  onManage: () => void;
}) {
  const visible = focus ? rows.filter((r) => r.category === focus) : rows;
  const spent = visible.reduce((s, r) => s + r.spent, 0);
  const cap = visible.reduce((s, r) => s + r.monthly, 0);

  return (
    <Card className="stagger-in min-w-0" style={{ animationDelay: "140ms" }}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>Budgets</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">{formatMonthLabel(month)}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onManage}>
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        {rows.length === 0 ? (
          <div className="flex flex-col items-start gap-3 py-4">
            <p className="text-sm text-muted-foreground">
              Set a monthly cap on an expense category. Spent this month is tracked against it.
            </p>
            <Button type="button" size="sm" variant="outline" onClick={onManage}>
              Add budget
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No budget on the focused category.
          </p>
        ) : (
          <ul className="flex flex-col">
            {visible.map((row) => {
              const over = row.remaining < 0;
              const width = Math.min(Math.max(row.ratio * 100, row.spent > 0 ? 2 : 0), 100);
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => onFocus(row.category)}
                    className={cn(
                      "flex min-h-14 w-full flex-col justify-center gap-1.5 rounded-lg px-2 py-2 text-left transition-colors duration-150 hover:bg-accent",
                      focus === row.category && "bg-accent",
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2 truncate text-sm">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ background: row.color }}
                        />
                        <span className="truncate">{row.label}</span>
                      </span>
                      <span className="font-mono text-xs tabular-nums text-foreground">
                        {formatRon(row.spent)}
                        <span className="text-subtle"> / {formatRon(row.monthly)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", over ? "bg-expense" : "bg-primary")}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          "w-12 text-right font-mono text-xs tabular-nums",
                          over ? "text-expense" : "text-subtle",
                        )}
                      >
                        {(row.ratio * 100).toFixed(0)}%
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {visible.length > 1 ? (
          <p className="mt-3 font-mono text-xs tabular-nums text-muted-foreground">
            {formatRon(spent)} of {formatRon(cap)} this month
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
