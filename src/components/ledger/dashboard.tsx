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
import { prepareCsvExport, shareCsvFile, readCsvFile, type CsvBundle } from "@/lib/ledger/csv";
import { isoDate } from "@/lib/ledger/format";
import { splitRecurrences } from "@/lib/ledger/recurrence";
import { useLedger } from "@/lib/ledger/store";
import type { BookId, CategoryId } from "@/lib/ledger/types";
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
import { BudgetPanel } from "./budget-panel";
import { CategoryTable } from "./category-table";
import { DateRange } from "./date-range";
import { KpiGrid } from "./kpi-grid";
import { RecurringPanel } from "./recurring-panel";
import { TransactionsTable } from "./transactions-table";

const AddTransaction = lazy(() =>
  import("./add-transaction").then((m) => ({ default: m.AddTransaction })),
);
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
  const [csvConfirm, setCsvConfirm] = useState<{ count: number; truncated: boolean } | null>(null);
  const [csvExport, setCsvExport] = useState<CsvBundle | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);
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
    const inRange = scoped.filter((t) => inWindow(t, win.start, win.end));
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
      table: inRange,
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
      const result = await importCsv(file);
      const extra = result.truncated ? " First 5000 rows used." : "";
      toast.success(`Loaded ${result.imported} transactions from spreadsheet.${extra}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "CSV import failed");
    }
  }

  async function onPickCsv(file: File) {
    try {
      const preview = await readCsvFile(file);
      if (transactions.length === 0) {
        await applyCsv(file);
        return;
      }
      csvFileRef.current = file;
      setCsvConfirm({ count: preview.transactions.length, truncated: preview.truncated });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "CSV import failed");
    }
  }

  function openCsvExport() {
    const prepared = prepareCsvExport(transactions, categories, book);
    if (!prepared) {
      toast.error("No transactions to export");
      return;
    }
    setCsvExport(prepared);
  }

  function closeCsvExport() {
    setCsvExport(null);
  }

  async function onShareCsv() {
    if (!csvExport) return;
    const result = await shareCsvFile(csvExport.csv, csvExport.filename, "Ledger transactions");
    if (result === "shared") toast.success("CSV file ready — save to Files or open in Numbers");
    else if (result === "failed") toast.error("Share isn't available. Use Save CSV file.");
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
              onClick={() => setAddOpen(true)}
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
                    window.location.assign("/?install=1&platform=ios");
                  }}
                >
                  <Smartphone />
                  Add to iPhone
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Data</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => openCsvExport()}>
                  <FileSpreadsheet />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => csvRef.current?.click()}>
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
              <Button type="button" size="sm" variant="outline" onClick={() => csvRef.current?.click()}>
                <FileUp />
                Import CSV
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => window.location.assign("/?install=1&platform=ios")}
              >
                <Smartphone />
                Add to iPhone
              </Button>
              <Button type="button" size="sm" onClick={() => setAddOpen(true)}>
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
              onImportCsv={() => csvRef.current?.click()}
              onDelete={(id) => {
                deleteTransaction(id);
                toast.success("Transaction deleted");
              }}
            />
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background p-3 safe-bottom md:hidden">
        <Button type="button" className="w-full" onClick={() => setAddOpen(true)}>
          <Plus />
          Add transaction
        </Button>
      </div>

      <Suspense fallback={null}>
        <AddTransaction
          open={addOpen}
          onOpenChange={setAddOpen}
          defaultDate={isoDate(new Date(nowIso))}
          onSubmit={(input) => {
            addTransaction(input);
            toast.success("Transaction saved");
          }}
        />
      </Suspense>

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

      <AlertDialog
        open={csvExport !== null}
        onOpenChange={(open) => {
          if (!open) closeCsvExport();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export CSV</AlertDialogTitle>
            <AlertDialogDescription>
              {csvExport?.count ?? 0} transactions as a spreadsheet file
              {csvExport ? ` (${csvExport.filename})` : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {csvExport ? (
            <form
              method="post"
              action="/api/csv"
              target="ledger-csv-frame"
              className="mt-4 flex flex-col gap-2"
            >
              <input type="hidden" name="filename" value={csvExport.filename} />
              <input type="hidden" name="csv" value={csvExport.csv} />
              <Button type="submit">Save CSV file</Button>
              <Button type="button" variant="outline" onClick={() => void onShareCsv()}>
                Share file
              </Button>
              <iframe name="ledger-csv-frame" title="CSV download" className="hidden" />
            </form>
          ) : null}
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
              Ledger will show only the {csvConfirm?.count ?? 0} transactions from the file.
              Current transactions are replaced — like swapping a disc.
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
