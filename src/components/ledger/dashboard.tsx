import { useEffect, useLayoutEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import { Download, FileSpreadsheet, FileUp, MoreHorizontal, Package, Plus, Repeat, Smartphone, Tag, Upload, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
  balanceSeries,
  budgetProgress,
  categoryRows,
  filterFocused,
  incomeExpenseBars,
  incomePayeeMix,
  inWindow,
  kpisFor,
  spendMix,
  windowFor,
  type LedgerFocus,
} from "@/lib/ledger/analytics";
import { categoryLabel, labelsEqual } from "@/lib/ledger/categories";
import { prepareCsvExport, shareCsvFile, readCsvFile } from "@/lib/ledger/csv";
import { isoDate } from "@/lib/ledger/format";
import { withPreviewPrefix } from "@/lib/preview-path-prefix";
import { splitRecurrences } from "@/lib/ledger/recurrence";
import { useLedger } from "@/lib/ledger/store";
import type { BookId, CategoryId, TxType } from "@/lib/ledger/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { AppNav } from "@/components/app-nav";
import { AddTransaction } from "./add-transaction";
import { BudgetPanel } from "./budget-panel";
import { CategoryTable } from "./category-table";
import { DateRange } from "./date-range";
import { KpiGrid } from "./kpi-grid";
import { RecurringPanel } from "./recurring-panel";
import { TransactionsTable } from "./transactions-table";

const ManageCategories = lazy(() =>
  import("./manage-categories").then((m) => ({ default: m.ManageCategories })),
);
const ManagePayees = lazy(() =>
  import("./manage-payees").then((m) => ({ default: m.ManagePayees })),
);
const ManageProducts = lazy(() =>
  import("./manage-products").then((m) => ({ default: m.ManageProducts })),
);
const ManageBudgets = lazy(() =>
  import("./manage-budgets").then((m) => ({ default: m.ManageBudgets })),
);
const ManageRecurring = lazy(() =>
  import("./manage-recurring").then((m) => ({ default: m.ManageRecurring })),
);

const BalanceChart = lazy(() =>
  import("./balance-chart").then((m) => ({ default: m.BalanceChart })),
);
const SpendMix = lazy(() => import("./spend-mix").then((m) => ({ default: m.SpendMix })));
const IncomeMix = lazy(() => import("./income-mix").then((m) => ({ default: m.IncomeMix })));
const IncomeExpense = lazy(() =>
  import("./income-expense").then((m) => ({ default: m.IncomeExpense })),
);

function ChartFallback({ className = "h-80" }: { className?: string }) {
  return <Skeleton className={`rounded-2xl ${className}`} />;
}

function EmptyPanel({
  title,
  message,
  delay,
}: {
  title: string;
  message: string;
  delay: string;
}) {
  return (
    <Card className="stagger-in min-w-0" style={{ animationDelay: delay }}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="py-10 text-center text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

export function Dashboard({ nowIso, book = "ledger" }: { nowIso: string; book?: BookId }) {
  const hydrate = useLedger((s) => s.hydrate);
  const hydrated = useLedger((s) => s.hydrated);
  const transactions = useLedger((s) => s.transactions);
  const categories = useLedger((s) => s.categories);
  const payees = useLedger((s) => s.payees);
  const products = useLedger((s) => s.products);
  const budgets = useLedger((s) => s.budgets);
  const recurrences = useLedger((s) => s.recurrences);
  const range = useLedger((s) => s.range);
  const setRange = useLedger((s) => s.setRange);
  const repairReceiptYears = useLedger((s) => s.repairReceiptYears);
  const persistOk = useLedger((s) => s.persistOk);
  const addTransaction = useLedger((s) => s.addTransaction);
  const deleteTransaction = useLedger((s) => s.deleteTransaction);
  const postRecurrence = useLedger((s) => s.postRecurrence);
  const skipRecurrence = useLedger((s) => s.skipRecurrence);
  const exportBackup = useLedger((s) => s.exportBackup);
  const importBackup = useLedger((s) => s.importBackup);
  const importCsv = useLedger((s) => s.importCsv);
  const clearAll = useLedger((s) => s.clearAll);

  const [focus, setFocus] = useState<LedgerFocus | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [payeesOpen, setPayeesOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [budgetsOpen, setBudgetsOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [csvConfirm, setCsvConfirm] = useState<{
    count: number;
    truncated: boolean;
    scope: string;
  } | null>(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);
  const csvKindRef = useRef<TxType | "all">("all");
  const csvFileRef = useRef<File | null>(null);

  useLayoutEffect(() => {
    void (async () => {
      const posted = await hydrate(book);
      if (posted.length === 1) {
        toast.success(`Posted ${posted[0]!.payee}`);
      } else if (posted.length > 1) {
        toast.success(`Posted ${posted.length} recurring items`);
      }
    })();
  }, [hydrate, book]);

  useEffect(() => {
    if (hydrated) repairReceiptYears();
  }, [hydrated, repairReceiptYears]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const boot = () => {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    };
    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });
  }, []);

  useEffect(() => {
    if (focus?.kind === "category" && !categories.some((c) => c.id === focus.id)) {
      setFocus(null);
    }
    if (
      focus?.kind === "payee" &&
      !payees.some((p) => labelsEqual(p.name, focus.name)) &&
      !transactions.some((t) => labelsEqual(t.payee, focus.name))
    ) {
      setFocus(null);
    }
  }, [focus, categories, payees, transactions]);

  const model = useMemo(() => {
    const win = windowFor(range);
    const scoped = filterFocused(transactions, focus);
    const now = new Date(nowIso);
    return {
      win,
      now,
      kpis: kpisFor(scoped, win),
      mix: spendMix(transactions, win, categories),
      incomeMix: incomePayeeMix(transactions, win),
      cats: categoryRows(scoped, win, categories),
      bars: incomeExpenseBars(scoped, win, range),
      balance: balanceSeries(scoped, win, Boolean(focus)),
      table: scoped
        .filter((tx) => inWindow(tx, win.start, win.end))
        .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
      budgets: budgetProgress(budgets, transactions, categories, now),
      recurring: splitRecurrences(recurrences, isoDate(now)),
    };
  }, [transactions, range, focus, categories, budgets, recurrences, nowIso]);

  const categoryFocus = focus?.kind === "category" ? focus.id : null;
  const payeeFocus = focus?.kind === "payee" ? focus.name : null;

  function toggleFocus(id: CategoryId) {
    setFocus((prev) => (prev?.kind === "category" && prev.id === id ? null : { kind: "category", id }));
  }

  function togglePayee(name: string) {
    setFocus((prev) =>
      prev?.kind === "payee" && labelsEqual(prev.name, name) ? null : { kind: "payee", name },
    );
  }

  async function onImport(file: File) {
    try {
      await importBackup(file);
      toast.success("Backup restored");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    }
  }

  async function applyCsv(file: File) {
    try {
      const result = await importCsv(file, csvKindRef.current);
      const extra = result.truncated ? " First 5000 rows used." : "";
      toast.success(`Loaded ${result.imported} transactions from spreadsheet.${extra}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "CSV import failed");
    }
  }

  async function onPickCsv(file: File) {
    try {
      const preview = await readCsvFile(file);
      const type = csvKindRef.current;
      const count =
        type === "all"
          ? preview.transactions.length
          : preview.transactions.filter((tx) => tx.type === type).length;
      if (count === 0) {
        throw new Error(
          type === "expense"
            ? "No expenses in that file."
            : type === "income"
              ? "No income in that file."
              : "No transactions in that file.",
        );
      }
      if (transactions.length === 0) {
        await applyCsv(file);
        return;
      }
      const scope =
        type === "expense"
          ? "Expenses in the file replace the expenses on this device. Income stays."
          : type === "income"
            ? "Income in the file replaces the income on this device. Expenses stay."
            : "Everything in the file replaces both expenses and income on this device.";
      csvFileRef.current = file;
      setCsvConfirm({ count, truncated: preview.truncated, scope });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "CSV import failed");
    }
  }

  function beginCsvImport(type: TxType | "all") {
    csvKindRef.current = type;
    setCsvImportOpen(false);
    csvRef.current?.click();
  }

  function openCsvExport() {
    setCsvOpen(true);
  }

  async function onShareCsv(type: TxType | "all") {
    const kind = type === "expense" ? "expenses" : type === "income" ? "income" : "all";
    const prepared = prepareCsvExport(
      type === "all" ? transactions : transactions.filter((tx) => tx.type === type),
      categories,
      book,
      kind,
    );
    if (!prepared) {
      toast.error(
        type === "expense" ? "No expenses to export" : type === "income" ? "No income to export" : "No transactions to export",
      );
      return;
    }
    const result = await shareCsvFile(prepared.csv, prepared.filename, `Ledger ${kind}`);
    if (result === "cancelled") return;
    if (result === "shared") {
      setCsvOpen(false);
      return;
    }
    try {
      await navigator.clipboard.writeText(prepared.csv);
      setCsvOpen(false);
    } catch {
      toast.error("Couldn't share the file from this screen.");
    }
  }

  const isEmpty = transactions.length === 0;
  const hasAny =
    !isEmpty ||
    categories.length > 0 ||
    payees.length > 0 ||
    products.length > 0 ||
    budgets.length > 0 ||
    recurrences.length > 0;

  return (
    <div
      className="min-h-dvh bg-background pb-32 text-foreground md:pb-10"
      data-hydrated={hydrated ? "true" : "false"}
    >
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <AppNav book="ledger" persistOk={persistOk} />
          <div className="ml-auto hidden min-w-0 flex-1 justify-center md:flex">
            <div className="w-full max-w-md">
              <DateRange value={range} onChange={setRange} />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Button
              type="button"
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => window.setTimeout(() => setAddOpen(true), 40)}
            >
              <Plus />
              Add
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" aria-label="More">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Lists</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setCatsOpen(true)}>
                  <Tag />
                  Categories
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPayeesOpen(true)}>
                  <Users />
                  Payees
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setProductsOpen(true)}>
                  <Package />
                  Products
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setBudgetsOpen(true)}>
                  <Wallet />
                  Budgets
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setRecurringOpen(true)}>
                  <Repeat />
                  Recurring
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    window.location.assign(withPreviewPrefix("/?install=1&platform=ios"));
                  }}
                >
                  <Smartphone />
                  Add to iPhone
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Data</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setCsvOpen(true)}>
                  <FileSpreadsheet />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setCsvImportOpen(true)}>
                  <FileUp />
                  Import CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    exportBackup();
                    toast.success("Backup downloaded");
                  }}
                >
                  <Download />
                  Download backup
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => fileRef.current?.click()}>
                  <Upload />
                  Import backup
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setClearOpen(true)}
                  disabled={!hasAny}
                >
                  Clear all data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void onImport(file);
              }}
            />
            <input
              ref={csvRef}
              type="file"
              accept=".csv,text/csv,text/plain,text/comma-separated-values"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void onPickCsv(file);
              }}
            />
          </div>
        </div>
        <div className="border-t border-border px-4 py-2 md:hidden">
          <DateRange value={range} onChange={setRange} />
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6">
        {isEmpty ? (
          <section className="stagger-in rounded-2xl bg-card px-5 py-6 shadow-[var(--shadow-border)]">
            <p className="text-sm font-medium">Your ledger is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add categories, payees, and products, set monthly budgets, then log a transaction or a
              repeating bill — or load a spreadsheet. Everything stays on this device in RON.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setCatsOpen(true)}>
                <Tag />
                Categories
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setPayeesOpen(true)}>
                <Users />
                Payees
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setProductsOpen(true)}>
                <Package />
                Products
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setBudgetsOpen(true)}>
                <Wallet />
                Budgets
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setRecurringOpen(true)}>
                <Repeat />
                Recurring
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setCsvImportOpen(true)}>
                <FileUp />
                Import CSV
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => window.location.assign(withPreviewPrefix("/?install=1&platform=ios"))}
              >
                <Smartphone />
                Add to iPhone
              </Button>
              <Button type="button" size="sm" onClick={() => window.setTimeout(() => setAddOpen(true), 40)}>
                <Plus />
                Add transaction
              </Button>
            </div>
          </section>
        ) : null}

        {focus ? (
          <div className="flex min-w-0 items-center">
            <button
              type="button"
              onClick={() => setFocus(null)}
              className="inline-flex h-9 min-h-9 max-w-full items-center gap-2 rounded-full border border-border bg-card px-3 text-xs text-foreground"
            >
              <span className="min-w-0 truncate">
                Focus: {focus.kind === "category" ? categoryLabel(focus.id, categories) : focus.name}
              </span>
              <span className="shrink-0 text-subtle">Clear</span>
            </button>
          </div>
        ) : null}

        <KpiGrid
          net={model.kpis.net}
          income={model.kpis.income}
          expenses={model.kpis.expenses}
          savingsRate={model.kpis.savingsRate}
        />

        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <BudgetPanel
            rows={model.budgets}
            month={model.now}
            focus={categoryFocus}
            onFocus={toggleFocus}
            onManage={() => setBudgetsOpen(true)}
          />
          <RecurringPanel
            due={model.recurring.due}
            upcoming={model.recurring.upcoming}
            paused={model.recurring.paused}
            categories={categories}
            onManage={() => setRecurringOpen(true)}
            onPost={(id) => {
              const posted = postRecurrence(id);
              toast.success(
                posted.length === 1
                  ? `Posted ${posted[0]!.payee}`
                  : posted.length > 1
                    ? `Posted ${posted.length} items`
                    : "Nothing due",
              );
            }}
            onSkip={(id) => {
              skipRecurrence(id);
              toast.success("Skipped this period");
            }}
          />
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            {isEmpty ? (
              <EmptyPanel
                title="Balance trend"
                message="No balance yet. Log a transaction to start the trend."
                delay="160ms"
              />
            ) : (
              <Suspense fallback={<ChartFallback />}>
                <BalanceChart data={model.balance} focused={Boolean(focus)} />
              </Suspense>
            )}
          </div>
          {isEmpty ? (
            <EmptyPanel
              title="Spend mix"
              message="No expenses in this range. Add an expense to see the mix."
              delay="200ms"
            />
          ) : (
            <Suspense fallback={<ChartFallback className="h-80" />}>
              <SpendMix data={model.mix} focus={categoryFocus} onFocus={toggleFocus} />
            </Suspense>
          )}
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          {isEmpty ? (
            <EmptyPanel
              title="Income by payee"
              message="No income in this range. Add income to see who paid you."
              delay="220ms"
            />
          ) : (
            <Suspense fallback={<ChartFallback className="h-80" />}>
              <IncomeMix data={model.incomeMix} focus={payeeFocus} onFocus={togglePayee} />
            </Suspense>
          )}
          <div className="min-w-0 lg:col-span-2">
            {isEmpty ? (
              <EmptyPanel
                title="Income vs expenses"
                message="No income or expenses in this range."
                delay="240ms"
              />
            ) : (
              <Suspense fallback={<ChartFallback />}>
                <IncomeExpense data={model.bars} />
              </Suspense>
            )}
          </div>
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-5">
          <div className="min-w-0 lg:col-span-2">
            <CategoryTable
              rows={model.cats}
              focus={categoryFocus}
              onFocus={toggleFocus}
              onManage={() => setCatsOpen(true)}
            />
          </div>
          <div className="min-w-0 lg:col-span-3">
            <TransactionsTable
              transactions={model.table}
              categories={categories}
              emptyHint="No transactions yet."
              canExport
              onExportCsv={openCsvExport}
              onImportCsv={() => setCsvImportOpen(true)}
              onDelete={(id) => {
                deleteTransaction(id);
                toast.success("Transaction deleted");
              }}
            />
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background p-3 safe-bottom md:hidden">
        <Button type="button" className="w-full" onClick={() => window.setTimeout(() => setAddOpen(true), 40)}>
          <Plus />
          Add transaction
        </Button>
      </div>

      <AddTransaction
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultDate={isoDate(new Date(nowIso))}
        onSubmit={(input) => {
          addTransaction(input);
          const win = windowFor(range);
          const visible = inWindow(
            {
              id: "new",
              type: input.type,
              amount: input.amount,
              category: input.category,
              date: input.date,
              payee: input.payee,
            },
            win.start,
            win.end,
          );
          toast.success(visible ? "Transaction saved" : `Saved on ${input.date}. Change the range to see it.`);
        }}
      />

      <Suspense fallback={null}>
        <ManageCategories open={catsOpen} onOpenChange={setCatsOpen} />
        <ManagePayees open={payeesOpen} onOpenChange={setPayeesOpen} />
        <ManageProducts open={productsOpen} onOpenChange={setProductsOpen} />
        <ManageBudgets open={budgetsOpen} onOpenChange={setBudgetsOpen} />
        <ManageRecurring
          open={recurringOpen}
          onOpenChange={setRecurringOpen}
          defaultDate={isoDate(new Date(nowIso))}
        />
      </Suspense>

      <AlertDialog open={csvOpen} onOpenChange={setCsvOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export CSV</AlertDialogTitle>
            <AlertDialogDescription>
              Expenses and income are separate files. Export expenses when you want them analyzed.
              Income stays out of that file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4 flex flex-col gap-2">
            <Button type="button" className="w-full" onClick={() => void onShareCsv("expense")}>
              Save expenses ({transactions.filter((tx) => tx.type === "expense").length})
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => void onShareCsv("income")}>
              Save income ({transactions.filter((tx) => tx.type === "income").length})
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => void onShareCsv("all")}>
              Save all ({transactions.length})
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={csvImportOpen} onOpenChange={setCsvImportOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import CSV</AlertDialogTitle>
            <AlertDialogDescription>
              Pick one side. Importing expenses replaces only expenses. Income stays on this device, and
              the other way around.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4 flex flex-col gap-2">
            <Button type="button" className="w-full" onClick={() => beginCsvImport("expense")}>
              Load expenses
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => beginCsvImport("income")}>
              Load income
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => beginCsvImport("all")}>
              Load all
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all data?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes every transaction, category, payee, product, budget, and recurring bill stored
              on this device. Download a backup first if you want to keep your numbers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                clearAll();
                setFocus(null);
                toast.success("Ledger cleared");
              }}
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={csvConfirm !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCsvConfirm(null);
            csvFileRef.current = null;
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Load this spreadsheet?</AlertDialogTitle>
            <AlertDialogDescription>
              {csvConfirm?.count ?? 0} transactions. {csvConfirm?.scope}
              {csvConfirm?.truncated ? " Only the first 5000 rows will be used." : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const file = csvFileRef.current;
                csvFileRef.current = null;
                setCsvConfirm(null);
                if (file) void applyCsv(file);
              }}
            >
              Load spreadsheet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
