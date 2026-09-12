import { useMemo, useState } from "react";
import { FileSpreadsheet, FileUp, Search, Trash2 } from "lucide-react";
import { categoryLabel } from "@/lib/ledger/categories";
import { searchTransactions } from "@/lib/ledger/analytics";
import { formatDayYear, formatRonSigned } from "@/lib/ledger/format";
import type { Category, Transaction, TxType } from "@/lib/ledger/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TYPE_FILTERS: { id: "all" | TxType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "income", label: "In" },
  { id: "expense", label: "Out" },
];

export function TransactionsTable({
  transactions,
  categories,
  onDelete,
  emptyHint,
  onExportCsv,
  onImportCsv,
  canExport,
}: {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
  emptyHint?: string;
  onExportCsv?: () => void;
  onImportCsv?: () => void;
  canExport?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TxType>("all");
  const [pending, setPending] = useState<Transaction | null>(null);

  const rows = useMemo(
    () => searchTransactions(transactions, query, typeFilter, categories),
    [transactions, query, typeFilter, categories],
  );

  const noSource = transactions.length === 0;

  return (
    <Card className="stagger-in min-w-0" style={{ animationDelay: "320ms" }}>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Transactions</CardTitle>
          <div className="flex items-center gap-1">
            {onImportCsv ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onImportCsv}
                aria-label="Import CSV"
              >
                <FileUp />
                Import
              </Button>
            ) : null}
            {onExportCsv ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onExportCsv}
                disabled={!canExport}
                aria-label="Export CSV"
              >
                <FileSpreadsheet />
                CSV
              </Button>
            ) : null}
            <span className="font-mono text-xs tabular-nums text-subtle">{rows.length}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search payee, product, note, category"
              className="pl-9"
              aria-label="Search transactions"
            />
          </div>
          <div className="flex rounded-xl bg-muted p-1">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTypeFilter(f.id)}
                className={cn(
                  "h-9 min-h-9 min-w-11 flex-1 rounded-lg px-3 text-xs font-medium transition-colors duration-150 sm:flex-none",
                  typeFilter === f.id
                    ? "bg-card text-foreground shadow-[var(--shadow-border)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {noSource
              ? emptyHint ?? "No transactions yet."
              : "No matching transactions."}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.slice(0, 80).map((tx) => (
              <li key={tx.id} className="flex items-center gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm">{tx.payee}</p>
                    <p
                      className={cn(
                        "shrink-0 font-mono text-sm tabular-nums",
                        tx.type === "income" ? "text-income" : "text-foreground",
                      )}
                    >
                      {formatRonSigned(tx.type === "income" ? tx.amount : -tx.amount)}
                    </p>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {categoryLabel(tx.category, categories)}
                    {tx.type === "income" && tx.product ? (
                      <span>
                        {" "}
                        · {tx.quantity != null ? `${tx.quantity} × ` : ""}
                        {tx.product}
                      </span>
                    ) : null}
                    <span className="text-subtle"> · {formatDayYear(tx.date)}</span>
                    {tx.note ? <span className="text-subtle"> · {tx.note}</span> : null}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${tx.payee}`}
                  onClick={() => setPending(tx)}
                  className="shrink-0 text-subtle hover:text-expense"
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {rows.length > 80 ? (
          <p className="pt-3 text-center text-xs text-subtle">
            Showing 80 of {rows.length}. Narrow the search to see the rest.
          </p>
        ) : null}
      </CardContent>

      <AlertDialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              {pending
                ? `${pending.payee} · ${categoryLabel(pending.category, categories)} will be removed from this device.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pending) onDelete(pending.id);
                setPending(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
