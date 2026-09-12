import { FREQ_LABELS } from "@/lib/ledger/recurrence";
import { formatDayYear, formatRon } from "@/lib/ledger/format";
import { categoryLabel } from "@/lib/ledger/categories";
import type { Category, RecurringBill } from "@/lib/ledger/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function RowMeta({
  bill,
  categories,
}: {
  bill: RecurringBill;
  categories: Category[];
}) {
  return (
    <p className="truncate text-xs text-muted-foreground">
      {categoryLabel(bill.category, categories)} · {FREQ_LABELS[bill.frequency]}
    </p>
  );
}

export function RecurringPanel({
  due,
  upcoming,
  paused,
  categories,
  onManage,
  onPost,
  onSkip,
}: {
  due: RecurringBill[];
  upcoming: RecurringBill[];
  paused: RecurringBill[];
  categories: Category[];
  onManage: () => void;
  onPost: (id: string) => void;
  onSkip: (id: string) => void;
}) {
  const empty = due.length + upcoming.length + paused.length === 0;
  const rest = [...upcoming, ...paused].slice(0, 6);

  return (
    <Card className="stagger-in min-w-0" style={{ animationDelay: "180ms" }}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>Recurring</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {due.length > 0
                ? `${due.length} due`
                : upcoming.length > 0
                  ? `Next ${formatDayYear(upcoming[0]!.nextDate)}`
                  : "Salary, rent, bills"}
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onManage}>
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        {empty ? (
          <div className="flex flex-col items-start gap-3 py-4">
            <p className="text-sm text-muted-foreground">
              Save a repeating income or bill. Ledger can post it when the date arrives, or wait
              for you to tap Post.
            </p>
            <Button type="button" size="sm" variant="outline" onClick={onManage}>
              Add recurring
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {due.map((bill) => (
              <li key={bill.id} className="rounded-lg bg-muted px-3 py-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{bill.payee}</p>
                    <RowMeta bill={bill} categories={categories} />
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-mono text-xs tabular-nums",
                      bill.type === "income" ? "text-income" : "text-foreground",
                    )}
                  >
                    {bill.type === "income" ? "+" : "−"}
                    {formatRon(bill.amount)}
                  </span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 min-h-9 flex-1"
                    onClick={() => onPost(bill.id)}
                  >
                    Post
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 min-h-9 flex-1"
                    onClick={() => onSkip(bill.id)}
                  >
                    Skip
                  </Button>
                </div>
              </li>
            ))}
            {rest.map((bill) => (
              <li
                key={bill.id}
                className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-2 py-1.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">
                    {bill.payee}
                    {bill.paused ? (
                      <span className="ml-2 text-xs text-subtle">Paused</span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDayYear(bill.nextDate)} · {FREQ_LABELS[bill.frequency]}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 font-mono text-xs tabular-nums",
                    bill.type === "income" ? "text-income" : "text-foreground",
                  )}
                >
                  {bill.type === "income" ? "+" : "−"}
                  {formatRon(bill.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
