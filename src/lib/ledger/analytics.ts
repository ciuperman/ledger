import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import {
  categoryColor,
  categoryLabel,
  findCategory,
  labelsEqual,
  normalizeLabel,
  STEEL_COLORS,
} from "./categories";
import { signedAmount } from "./format";
import type {
  Budget,
  Category,
  CategoryId,
  RangePreset,
  Transaction,
  TxType,
} from "./types";

export type DateWindow = {
  start: Date;
  end: Date;
  priorStart: Date;
  priorEnd: Date;
};

export type KpiPoint = {
  current: number;
  previous: number;
  change: number | null;
  series: number[];
};

export type MixSlice = {
  category: CategoryId;
  label: string;
  value: number;
  share: number;
  color: string;
  count: number;
  type: TxType;
};

export type LedgerFocus =
  | { kind: "category"; id: CategoryId }
  | { kind: "payee"; name: string };

export type PayeeSlice = {
  payee: string;
  label: string;
  value: number;
  share: number;
  color: string;
  count: number;
};

export type BarPoint = {
  key: string;
  label: string;
  income: number;
  expense: number;
};

export type BalancePoint = {
  date: string;
  label: string;
  balance: number;
};

export type BudgetProgress = {
  id: string;
  category: CategoryId;
  label: string;
  color: string;
  monthly: number;
  spent: number;
  remaining: number;
  ratio: number;
};

export function windowFor(preset: RangePreset, now = new Date()): DateWindow {
  const end = endOfDay(now);
  let start: Date;
  switch (preset) {
    case "7d":
      start = startOfDay(subDays(now, 6));
      break;
    case "30d":
      start = startOfDay(subDays(now, 29));
      break;
    case "90d":
      start = startOfDay(subDays(now, 89));
      break;
    case "6m":
      start = startOfDay(subMonths(now, 6));
      break;
    case "1y":
      start = startOfDay(subYears(now, 1));
      break;
    case "2y":
      start = startOfDay(subYears(now, 2));
      break;
  }
  const days = differenceInCalendarDays(end, start);
  const priorEnd = endOfDay(subDays(start, 1));
  const priorStart = startOfDay(subDays(priorEnd, days));
  return { start, end, priorStart, priorEnd };
}

export function monthWindow(now = new Date()): { start: Date; end: Date } {
  return { start: startOfMonth(now), end: endOfMonth(now) };
}

export function inWindow(tx: Transaction, start: Date, end: Date): boolean {
  const t = startOfDay(new Date(`${tx.date}T00:00:00`)).getTime();
  return t >= startOfDay(start).getTime() && t <= startOfDay(end).getTime();
}

function sums(txs: Transaction[]) {
  let income = 0;
  let expenses = 0;
  for (const tx of txs) {
    if (tx.type === "income") income += tx.amount;
    else expenses += tx.amount;
  }
  return { income, expenses, net: income - expenses };
}

function change(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return (current - previous) / Math.abs(previous);
}

function dailySeries(
  txs: Transaction[],
  start: Date,
  end: Date,
  pick: (tx: Transaction) => number,
): number[] {
  const days = eachDayOfInterval({ start: startOfDay(start), end: startOfDay(end) });
  const byDay = new Map<string, number>();
  for (const tx of txs) {
    byDay.set(tx.date, (byDay.get(tx.date) ?? 0) + pick(tx));
  }
  return days.map((d) => byDay.get(format(d, "yyyy-MM-dd")) ?? 0);
}

function running(values: number[]): number[] {
  let acc = 0;
  return values.map((v) => {
    acc += v;
    return acc;
  });
}

export function filterFocused(
  txs: Transaction[],
  focus: LedgerFocus | null,
): Transaction[] {
  if (!focus) return txs;
  if (focus.kind === "category") return txs.filter((t) => t.category === focus.id);
  return txs.filter((t) => labelsEqual(t.payee, focus.name));
}

export function searchTransactions(
  txs: Transaction[],
  query: string,
  typeFilter: "all" | TxType,
  categories: Category[],
): Transaction[] {
  const q = query.trim().toLowerCase();
  return txs.filter((t) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (!q) return true;
    const items = t.items?.map((item) => item.name).join(" ") ?? "";
    const hay = `${t.payee} ${t.product ?? ""} ${items} ${t.note ?? ""} ${categoryLabel(t.category, categories)}`.toLowerCase();
    return hay.includes(q);
  });
}

export function kpisFor(
  txs: Transaction[],
  range: DateWindow,
): { net: KpiPoint; income: KpiPoint; expenses: KpiPoint; savingsRate: KpiPoint } {
  const currentTxs = txs.filter((t) => inWindow(t, range.start, range.end));
  const priorTxs = txs.filter((t) => inWindow(t, range.priorStart, range.priorEnd));
  const cur = sums(currentTxs);
  const prev = sums(priorTxs);
  const incomeSeries = dailySeries(currentTxs, range.start, range.end, (t) =>
    t.type === "income" ? t.amount : 0,
  );
  const expenseSeries = dailySeries(currentTxs, range.start, range.end, (t) =>
    t.type === "expense" ? t.amount : 0,
  );
  const netSeries = incomeSeries.map((v, i) => v - (expenseSeries[i] ?? 0));
  const runInc = running(incomeSeries);
  const runExp = running(expenseSeries);
  const savingsSeries = runInc.map((inc, i) => {
    const exp = runExp[i] ?? 0;
    return inc <= 0 ? 0 : (inc - exp) / inc;
  });
  const savingsCurrent = cur.income <= 0 ? 0 : cur.net / cur.income;
  const savingsPrev = prev.income <= 0 ? 0 : prev.net / prev.income;
  const priorEmpty = priorTxs.length === 0;
  return {
    net: {
      current: cur.net,
      previous: prev.net,
      change: priorEmpty ? null : change(cur.net, prev.net),
      series: running(netSeries),
    },
    income: {
      current: cur.income,
      previous: prev.income,
      change: priorEmpty ? null : change(cur.income, prev.income),
      series: running(incomeSeries),
    },
    expenses: {
      current: cur.expenses,
      previous: prev.expenses,
      change: priorEmpty ? null : change(cur.expenses, prev.expenses),
      series: running(expenseSeries),
    },
    savingsRate: {
      current: savingsCurrent,
      previous: savingsPrev,
      change: priorEmpty ? null : savingsCurrent - savingsPrev,
      series: savingsSeries,
    },
  };
}

export function spendMix(
  txs: Transaction[],
  range: DateWindow,
  categories: Category[],
): MixSlice[] {
  const current = txs.filter(
    (t) => t.type === "expense" && inWindow(t, range.start, range.end),
  );
  const byCat = new Map<CategoryId, { value: number; count: number; type: TxType }>();
  for (const tx of current) {
    const prev = byCat.get(tx.category) ?? { value: 0, count: 0, type: tx.type };
    prev.value += tx.amount;
    prev.count += 1;
    byCat.set(tx.category, prev);
  }
  const total = [...byCat.values()].reduce((s, v) => s + v.value, 0);
  return [...byCat.entries()]
    .map(([category, v]) => ({
      category,
      label: categoryLabel(category, categories),
      value: v.value,
      count: v.count,
      share: total === 0 ? 0 : v.value / total,
      color: categoryColor(category, categories),
      type: findCategory(categories, category)?.type ?? v.type,
    }))
    .sort((a, b) => b.value - a.value);
}

function payeeColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return STEEL_COLORS[hash % STEEL_COLORS.length]!;
}

export function incomePayeeMix(txs: Transaction[], range: DateWindow): PayeeSlice[] {
  const current = txs.filter((t) => t.type === "income" && inWindow(t, range.start, range.end));
  const byPayee = new Map<string, { label: string; value: number; count: number }>();
  for (const tx of current) {
    const label = normalizeLabel(tx.payee) || "Unknown";
    const key = label.toLowerCase();
    const prev = byPayee.get(key) ?? { label, value: 0, count: 0 };
    prev.value += tx.amount;
    prev.count += 1;
    byPayee.set(key, prev);
  }
  const total = [...byPayee.values()].reduce((s, v) => s + v.value, 0);
  return [...byPayee.values()]
    .map((v) => ({
      payee: v.label,
      label: v.label,
      value: v.value,
      count: v.count,
      share: total === 0 ? 0 : v.value / total,
      color: payeeColor(v.label),
    }))
    .sort((a, b) => b.value - a.value);
}

export function categoryRows(
  txs: Transaction[],
  range: DateWindow,
  categories: Category[],
): MixSlice[] {
  const current = txs.filter((t) => inWindow(t, range.start, range.end));
  const byCat = new Map<CategoryId, { value: number; count: number; type: TxType }>();
  for (const tx of current) {
    const prev = byCat.get(tx.category) ?? { value: 0, count: 0, type: tx.type };
    prev.value += tx.amount;
    prev.count += 1;
    byCat.set(tx.category, prev);
  }
  const total = [...byCat.values()].reduce((s, v) => s + v.value, 0) || 1;
  return [...byCat.entries()]
    .map(([category, v]) => ({
      category,
      label: categoryLabel(category, categories),
      value: v.value,
      count: v.count,
      share: v.value / total,
      color: categoryColor(category, categories),
      type: findCategory(categories, category)?.type ?? v.type,
    }))
    .sort((a, b) => b.value - a.value);
}

export function budgetProgress(
  budgets: Budget[],
  txs: Transaction[],
  categories: Category[],
  now = new Date(),
): BudgetProgress[] {
  const { start, end } = monthWindow(now);
  return budgets
    .map((b) => {
      let spent = 0;
      for (const tx of txs) {
        if (tx.type !== "expense" || tx.category !== b.category) continue;
        if (!inWindow(tx, start, end)) continue;
        spent += tx.amount;
      }
      return {
        id: b.id,
        category: b.category,
        label: categoryLabel(b.category, categories),
        color: categoryColor(b.category, categories),
        monthly: b.monthly,
        spent,
        remaining: b.monthly - spent,
        ratio: b.monthly <= 0 ? 0 : spent / b.monthly,
      };
    })
    .sort((a, b) => b.ratio - a.ratio || a.label.localeCompare(b.label));
}

export function balanceSeries(
  txs: Transaction[],
  range: DateWindow,
  focused: boolean,
): BalancePoint[] {
  const sorted = [...txs].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  );
  const startIso = format(range.start, "yyyy-MM-dd");
  const endIso = format(range.end, "yyyy-MM-dd");
  let bal = 0;
  if (!focused) {
    for (const tx of sorted) {
      if (tx.date < startIso) bal += signedAmount(tx.type, tx.amount);
    }
  }
  const delta = new Map<string, number>();
  for (const tx of sorted) {
    if (tx.date < startIso || tx.date > endIso) continue;
    delta.set(tx.date, (delta.get(tx.date) ?? 0) + signedAmount(tx.type, tx.amount));
  }
  const days = eachDayOfInterval({
    start: startOfDay(range.start),
    end: startOfDay(range.end),
  });
  const span = days.length;
  return days.map((d) => {
    const iso = format(d, "yyyy-MM-dd");
    bal += delta.get(iso) ?? 0;
    const label =
      span <= 40 ? format(d, "d MMM") : span <= 120 ? format(d, "d MMM") : format(d, "MMM");
    return { date: iso, label, balance: bal };
  });
}

function iterateBuckets(
  start: Date,
  end: Date,
  step: "day" | "week" | "month",
): { start: Date; end: Date; label: string; key: string }[] {
  const out: { start: Date; end: Date; label: string; key: string }[] = [];
  if (step === "day") {
    for (const d of eachDayOfInterval({ start: startOfDay(start), end: startOfDay(end) })) {
      out.push({
        start: d,
        end: d,
        label: format(d, "d MMM"),
        key: format(d, "yyyy-MM-dd"),
      });
    }
    return out;
  }
  if (step === "week") {
    let cursor = startOfWeek(start, { weekStartsOn: 1 });
    if (cursor < start) cursor = addWeeks(cursor, 1);
    if (cursor > start) {
      cursor = startOfWeek(start, { weekStartsOn: 1 });
    }
    while (cursor <= end) {
      const bucketEnd = addDays(addWeeks(cursor, 1), -1);
      out.push({
        start: cursor,
        end: bucketEnd > end ? end : bucketEnd,
        label: format(cursor, "d MMM"),
        key: format(cursor, "yyyy-MM-dd"),
      });
      cursor = addWeeks(cursor, 1);
    }
    return out;
  }
  let cursor = startOfMonth(start);
  while (cursor <= end) {
    const bucketEnd = addDays(addMonths(cursor, 1), -1);
    out.push({
      start: cursor,
      end: bucketEnd > end ? end : bucketEnd,
      label: format(cursor, "MMM"),
      key: format(cursor, "yyyy-MM"),
    });
    cursor = addMonths(cursor, 1);
  }
  return out;
}

export function incomeExpenseBars(
  txs: Transaction[],
  range: DateWindow,
  preset: RangePreset,
): BarPoint[] {
  const step: "day" | "week" | "month" =
    preset === "7d" || preset === "30d" ? "day" : preset === "90d" ? "week" : "month";
  const buckets = iterateBuckets(range.start, range.end, step);
  const current = txs.filter((t) => inWindow(t, range.start, range.end));
  return buckets.map((b) => {
    let income = 0;
    let expense = 0;
    for (const tx of current) {
      if (!inWindow(tx, b.start, b.end)) continue;
      if (tx.type === "income") income += tx.amount;
      else expense += tx.amount;
    }
    return { key: b.key, label: b.label, income, expense };
  });
}

export const RANGE_LABELS: Record<RangePreset, string> = {
  "7d": "7D",
  "30d": "30D",
  "90d": "90D",
  "6m": "6M",
  "1y": "1Y",
  "2y": "2Y",
};
