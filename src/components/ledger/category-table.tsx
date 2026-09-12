import type { MixSlice } from "@/lib/ledger/analytics";
import { formatRon } from "@/lib/ledger/format";
import type { CategoryId } from "@/lib/ledger/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CategoryTable({
  rows,
  focus,
  onFocus,
  onManage,
}: {
  rows: MixSlice[];
  focus: CategoryId | null;
  onFocus: (id: CategoryId) => void;
  onManage: () => void;
}) {
  return (
    <Card className="stagger-in min-w-0" style={{ animationDelay: "280ms" }}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Categories</CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={onManage}>
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nothing in this range. Add a category, then log a transaction.
          </p>
        ) : (
          <ul className="flex flex-col">
            {rows.map((row) => {
              const max = rows[0]?.value || 1;
              return (
                <li key={row.category}>
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
                      <span
                        className={cn(
                          "font-mono text-xs tabular-nums",
                          row.type === "income" ? "text-income" : "text-foreground",
                        )}
                      >
                        {row.type === "income" ? "+" : ""}
                        {formatRon(row.value)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.max((row.value / max) * 100, 2)}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-xs tabular-nums text-subtle">
                        {(row.share * 100).toFixed(0)}%
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
