import { create } from "zustand";
import {
  findCategory,
  findPayee,
  findProduct,
  hasDuplicateLabel,
  labelsEqual,
  nextColor,
  normalizeLabel,
} from "./categories";
import { isoDate } from "./format";
import { csvToLedger } from "./csv";
import {
  downloadBackup,
  emptySnapshot,
  loadSnapshot,
  parseImport,
  persistSnapshot,
  readFileAsJson,
  readLocalSnapshot,
  receiptDate,
  snapshotFromParts,
} from "./persist";
import { advanceDate, planDue } from "./recurrence";
import type {
  BookId,
  Budget,
  Category,
  CategoryId,
  Payee,
  PostedItem,
  Product,
  RangePreset,
  RecurringBill,
  Snapshot,
  Transaction,
  TxType,
} from "./types";

type RecurringInput = Omit<RecurringBill, "id">;

type LedgerState = {
  hydrated: boolean;
  book: BookId;
  transactions: Transaction[];
  categories: Category[];
  payees: Payee[];
  products: Product[];
  budgets: Budget[];
  recurrences: RecurringBill[];
  range: RangePreset;
  savedAt: number | null;
  persistOk: boolean;
  hydrate: (book?: BookId) => Promise<PostedItem[]>;
  setRange: (range: RangePreset) => void;
  repairReceiptYears: () => void;
  addTransaction: (input: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (input: { label: string; type: TxType }) => Category | null;
  updateCategory: (id: string, label: string) => boolean;
  deleteCategory: (id: string) => void;
  addPayee: (name: string, type: TxType, category: CategoryId) => string | null;
  renamePayee: (from: string, to: string, type: TxType, category: CategoryId) => boolean;
  deletePayee: (name: string, type: TxType, category: CategoryId) => void;
  addProduct: (name: string, category: CategoryId) => string | null;
  renameProduct: (from: string, to: string, category: CategoryId) => boolean;
  deleteProduct: (name: string, category: CategoryId) => void;
  addBudget: (input: { category: string; monthly: number }) => Budget | null;
  updateBudget: (id: string, monthly: number) => boolean;
  deleteBudget: (id: string) => void;
  addRecurrence: (input: RecurringInput) => { row: RecurringBill; posted: PostedItem[] };
  updateRecurrence: (id: string, patch: Partial<RecurringInput>) => boolean;
  deleteRecurrence: (id: string) => void;
  toggleRecurrencePaused: (id: string) => void;
  postRecurrence: (id: string, today?: string) => PostedItem[];
  skipRecurrence: (id: string) => void;
  postDueRecurrences: (today?: string) => PostedItem[];
  clearAll: () => void;
  exportBackup: () => void;
  importBackup: (file: File) => Promise<void>;
  importCsv: (file: File, type: TxType | "all") => Promise<{ imported: number; truncated: boolean }>;
};

type Persistable = Pick<
  LedgerState,
  "transactions" | "categories" | "payees" | "products" | "range" | "budgets" | "recurrences"
>;

function snapshotFrom(state: Persistable): Snapshot {
  return snapshotFromParts(state);
}

function commit(patch: Partial<Persistable>) {
  const current = useLedger.getState();
  const next: Persistable = {
    transactions: patch.transactions ?? current.transactions,
    categories: patch.categories ?? current.categories,
    payees: patch.payees ?? current.payees,
    products: patch.products ?? current.products,
    range: patch.range ?? current.range,
    budgets: patch.budgets ?? current.budgets,
    recurrences: patch.recurrences ?? current.recurrences,
  };
  const snap = snapshotFrom(next);
  const persistOk = persistSnapshot(snap, current.book);
  useLedger.setState({
    ...next,
    payees: snap.payees,
    products: snap.products,
    budgets: snap.budgets,
    recurrences: snap.recurrences,
    savedAt: snap.updatedAt,
    persistOk,
  });
}

function applySnapshot(snap: Snapshot, persistOk = true) {
  useLedger.setState({
    hydrated: true,
    transactions: snap.transactions,
    categories: snap.categories,
    payees: snap.payees,
    products: snap.products,
    budgets: snap.budgets,
    recurrences: snap.recurrences,
    range: snap.range,
    savedAt: snap.updatedAt,
    persistOk,
  });
}

function todayIso(override?: string): string {
  return override ?? isoDate(new Date());
}

function withPayee(list: Payee[], name: string, type: TxType, category: CategoryId): Payee[] {
  const cleaned = normalizeLabel(name);
  if (!cleaned || !category) return list;
  if (findPayee(list, cleaned, type, category)) return list;
  const loose = list.find((p) => p.type === type && labelsEqual(p.name, cleaned) && p.category === "");
  if (loose) {
    return list.map((p) => (p === loose ? { ...p, category } : p));
  }
  return [...list, { name: cleaned, type, category }];
}

function withProduct(list: Product[], name: string | undefined, category: CategoryId, type: TxType): Product[] {
  if (type !== "income") return list;
  const cleaned = normalizeLabel(name ?? "");
  if (!cleaned || !category) return list;
  if (findProduct(list, cleaned, category)) return list;
  const loose = list.find((p) => labelsEqual(p.name, cleaned) && p.category === "");
  if (loose) {
    return list.map((p) => (p === loose ? { ...p, category } : p));
  }
  return [...list, { name: cleaned, category }];
}

function postBills(
  bills: RecurringBill[],
  ids: Set<string> | null,
  today: string,
  force: boolean,
): { recurrences: RecurringBill[]; transactions: Transaction[]; payees: Payee[]; posted: PostedItem[] } {
  const current = useLedger.getState();
  const recurrences = bills.map((r) => ({ ...r }));
  const transactions: Transaction[] = [];
  let payees = current.payees;
  const posted: PostedItem[] = [];

  for (const row of recurrences) {
    if (ids && !ids.has(row.id)) continue;
    if (row.paused) continue;
    if (!force && !row.autoPost) continue;
    const { dates, nextDate } = planDue(row, today);
    if (dates.length === 0) continue;
    for (const date of dates) {
      transactions.push({
        id: crypto.randomUUID(),
        type: row.type,
        amount: row.amount,
        category: row.category,
        date,
        payee: row.payee,
        note: row.note,
      });
      posted.push({ payee: row.payee, amount: row.amount, date });
    }
    row.nextDate = nextDate;
    payees = withPayee(payees, row.payee, row.type, row.category);
  }

  return { recurrences, transactions, payees, posted };
}

export const useLedger = create<LedgerState>((_set, get) => ({
  hydrated: false,
  book: "ledger",
  transactions: [],
  categories: [],
  payees: [],
  products: [],
  budgets: [],
  recurrences: [],
  range: "30d",
  savedAt: null,
  persistOk: true,

  hydrate: async (book = "ledger") => {
    if (get().hydrated && get().book === book) return [];
    useLedger.setState({
      book,
      hydrated: false,
      transactions: [],
      categories: [],
      payees: [],
      products: [],
      budgets: [],
      recurrences: [],
      range: "30d",
      savedAt: null,
      persistOk: true,
    });
    try {
      const local = readLocalSnapshot(book);
      if (local) {
        applySnapshot(local);
      } else {
        const snap = emptySnapshot();
        applySnapshot(snap, persistSnapshot(snap, book));
      }
      const newest = await loadSnapshot(book);
      if (newest && newest.updatedAt > (get().savedAt ?? 0)) {
        applySnapshot(newest);
        persistSnapshot(newest, book);
      }
      return get().postDueRecurrences();
    } catch {
      applySnapshot(emptySnapshot(), false);
      return [];
    }
  },

  setRange: (range) => commit({ range }),

  repairReceiptYears: () => {
    const current = get().transactions;
    let changed = false;
    const transactions = current.map((tx) => {
      const date = receiptDate(tx.date);
      if (date === tx.date) return tx;
      changed = true;
      return { ...tx, date };
    });
    if (changed) commit({ transactions });
  },

  addTransaction: (input) => {
    const row: Transaction = { ...input, id: crypto.randomUUID() };
    commit({
      transactions: [row, ...get().transactions],
      payees: withPayee(get().payees, row.payee, row.type, row.category),
      products: withProduct(get().products, row.product, row.category, row.type),
    });
  },

  deleteTransaction: (id) => {
    commit({ transactions: get().transactions.filter((t) => t.id !== id) });
  },

  addCategory: ({ label, type }) => {
    const cleaned = normalizeLabel(label);
    if (!cleaned || cleaned.length > 40) return null;
    const current = get().categories;
    if (hasDuplicateLabel(current, type, cleaned)) return null;
    const row: Category = {
      id: crypto.randomUUID(),
      label: cleaned,
      type,
      color: nextColor(current),
    };
    commit({ categories: [...current, row] });
    return row;
  },

  updateCategory: (id, label) => {
    const cleaned = normalizeLabel(label);
    if (!cleaned || cleaned.length > 40) return false;
    const current = get().categories;
    const existing = findCategory(current, id);
    if (!existing) return false;
    if (hasDuplicateLabel(current, existing.type, cleaned, id)) return false;
    commit({
      categories: current.map((c) => (c.id === id ? { ...c, label: cleaned } : c)),
    });
    return true;
  },

  deleteCategory: (id) => {
    commit({
      categories: get().categories.filter((c) => c.id !== id),
      payees: get().payees.filter((p) => p.category !== id),
      products: get().products.filter((p) => p.category !== id),
      budgets: get().budgets.filter((b) => b.category !== id),
      recurrences: get().recurrences.filter((r) => r.category !== id),
    });
  },

  addPayee: (name, type, category) => {
    const cleaned = normalizeLabel(name);
    if (!cleaned || cleaned.length > 80 || !category) return null;
    const existing = findPayee(get().payees, cleaned, type, category);
    if (existing) return existing.name;
    commit({ payees: withPayee(get().payees, cleaned, type, category) });
    return cleaned;
  },

  renamePayee: (from, to, type, category) => {
    const cleaned = normalizeLabel(to);
    if (!cleaned || cleaned.length > 80) return false;
    const current = get().payees;
    const source = findPayee(current, from, type, category);
    if (!source) return false;
    const clash = findPayee(current, cleaned, type, category);
    if (clash && clash !== source) return false;
    commit({
      payees: current.map((p) => (p === source ? { ...p, name: cleaned } : p)),
      transactions: get().transactions.map((t) =>
        t.type === type && t.category === category && t.payee === source.name
          ? { ...t, payee: cleaned }
          : t,
      ),
      recurrences: get().recurrences.map((r) =>
        r.type === type && r.category === category && r.payee === source.name
          ? { ...r, payee: cleaned }
          : r,
      ),
    });
    return true;
  },

  deletePayee: (name, type, category) => {
    const existing = findPayee(get().payees, name, type, category);
    if (!existing) return;
    commit({
      payees: get().payees.filter((p) => p !== existing),
    });
  },

  addProduct: (name, category) => {
    const cleaned = normalizeLabel(name);
    if (!cleaned || cleaned.length > 80 || !category) return null;
    const existing = findProduct(get().products, cleaned, category);
    if (existing) return existing.name;
    commit({ products: withProduct(get().products, cleaned, category, "income") });
    return cleaned;
  },

  renameProduct: (from, to, category) => {
    const cleaned = normalizeLabel(to);
    if (!cleaned || cleaned.length > 80) return false;
    const current = get().products;
    const source = findProduct(current, from, category);
    if (!source) return false;
    const clash = findProduct(current, cleaned, category);
    if (clash && clash !== source) return false;
    commit({
      products: current.map((p) => (p === source ? { ...p, name: cleaned } : p)),
      transactions: get().transactions.map((t) =>
        t.type === "income" && t.category === category && t.product && labelsEqual(t.product, source.name)
          ? { ...t, product: cleaned }
          : t,
      ),
    });
    return true;
  },

  deleteProduct: (name, category) => {
    const existing = findProduct(get().products, name, category);
    if (!existing) return;
    commit({
      products: get().products.filter((p) => p !== existing),
    });
  },

  addBudget: ({ category, monthly }) => {
    if (!Number.isFinite(monthly) || monthly <= 0) return null;
    const cat = findCategory(get().categories, category);
    if (!cat || cat.type !== "expense") return null;
    if (get().budgets.some((b) => b.category === category)) return null;
    const row: Budget = { id: crypto.randomUUID(), category, monthly };
    commit({ budgets: [...get().budgets, row] });
    return row;
  },

  updateBudget: (id, monthly) => {
    if (!Number.isFinite(monthly) || monthly <= 0) return false;
    const current = get().budgets;
    if (!current.some((b) => b.id === id)) return false;
    commit({
      budgets: current.map((b) => (b.id === id ? { ...b, monthly } : b)),
    });
    return true;
  },

  deleteBudget: (id) => {
    commit({ budgets: get().budgets.filter((b) => b.id !== id) });
  },

  addRecurrence: (input) => {
    const row: RecurringBill = { ...input, id: crypto.randomUUID() };
    commit({
      recurrences: [...get().recurrences, row],
      payees: withPayee(get().payees, row.payee, row.type, row.category),
    });
    const posted =
      !row.paused && row.autoPost ? get().postDueRecurrences() : [];
    return { row, posted };
  },

  updateRecurrence: (id, patch) => {
    const current = get().recurrences;
    if (!current.some((r) => r.id === id)) return false;
    const recurrences = current.map((r) => (r.id === id ? { ...r, ...patch } : r));
    const next = recurrences.find((r) => r.id === id);
    commit({
      recurrences,
      payees: next ? withPayee(get().payees, next.payee, next.type, next.category) : get().payees,
    });
    return true;
  },

  deleteRecurrence: (id) => {
    commit({ recurrences: get().recurrences.filter((r) => r.id !== id) });
  },

  toggleRecurrencePaused: (id) => {
    const current = get().recurrences;
    commit({
      recurrences: current.map((r) => (r.id === id ? { ...r, paused: !r.paused } : r)),
    });
  },

  postRecurrence: (id, today) => {
    const result = postBills(get().recurrences, new Set([id]), todayIso(today), true);
    if (result.posted.length === 0) return [];
    commit({
      recurrences: result.recurrences,
      transactions: [...result.transactions, ...get().transactions],
      payees: result.payees,
    });
    return result.posted;
  },

  skipRecurrence: (id) => {
    const current = get().recurrences;
    const row = current.find((r) => r.id === id);
    if (!row) return;
    commit({
      recurrences: current.map((r) =>
        r.id === id ? { ...r, nextDate: advanceDate(r.nextDate, r.frequency) } : r,
      ),
    });
  },

  postDueRecurrences: (today) => {
    const result = postBills(get().recurrences, null, todayIso(today), false);
    if (result.posted.length === 0) return [];
    commit({
      recurrences: result.recurrences,
      transactions: [...result.transactions, ...get().transactions],
      payees: result.payees,
    });
    return result.posted;
  },

  clearAll: () => {
    commit({
      transactions: [],
      categories: [],
      payees: [],
      products: [],
      budgets: [],
      recurrences: [],
      range: "30d",
    });
  },

  exportBackup: () => {
    downloadBackup(snapshotFrom(get()), get().book);
  },

  importBackup: async (file) => {
    const raw = await readFileAsJson(file);
    const snap = await parseImport(raw);
    commit({
      transactions: snap.transactions,
      categories: snap.categories,
      payees: snap.payees,
      products: snap.products,
      budgets: snap.budgets,
      recurrences: snap.recurrences,
      range: snap.range,
    });
  },

  importCsv: async (file, type) => {
    const parsed = csvToLedger(await file.text());
    if (type === "all") {
      if (parsed.transactions.length === 0) throw new Error("No transactions in that file.");
      const current = get();
      const budgets = current.budgets.flatMap((budget) => {
        const old = findCategory(current.categories, budget.category);
        if (!old) return [];
        const next = parsed.categories.find(
          (category) => category.type === old.type && labelsEqual(category.label, old.label),
        );
        return next ? [{ ...budget, category: next.id }] : [];
      });
      const recurrences = current.recurrences.flatMap((row) => {
        const old = findCategory(current.categories, row.category);
        if (!old) return [];
        const next = parsed.categories.find(
          (category) => category.type === old.type && labelsEqual(category.label, old.label),
        );
        if (!next) return [];
        return [
          {
            ...row,
            category: next.id,
            payee: findPayee(parsed.payees, row.payee, row.type, next.id)?.name ?? row.payee,
          },
        ];
      });
      commit({
        transactions: parsed.transactions,
        categories: parsed.categories,
        payees: parsed.payees,
        products: parsed.products,
        budgets,
        recurrences,
      });
      return { imported: parsed.transactions.length, truncated: parsed.truncated };
    }
    const incoming = {
      ...parsed,
      transactions: parsed.transactions.filter((tx) => tx.type === type),
      categories: parsed.categories.filter((category) => category.type === type),
      payees: parsed.payees.filter((payee) => payee.type === type),
      products: type === "income" ? parsed.products : [],
    };
    if (incoming.transactions.length === 0) {
      throw new Error(type === "expense" ? "No expenses in that file." : "No income in that file.");
    }
    const current = get();
    const keptTransactions = current.transactions.filter((tx) => tx.type !== type);
    const categories = [
      ...current.categories.filter((category) => category.type !== type),
      ...incoming.categories,
    ];
    const payees = [...current.payees.filter((payee) => payee.type !== type), ...incoming.payees];
    const products = type === "income" ? incoming.products : current.products;
    const budgets = current.budgets.flatMap((budget) => {
      const old = findCategory(current.categories, budget.category);
      if (!old) return [];
      if (old.type !== type) return [budget];
      const next = incoming.categories.find(
        (category) => category.type === old.type && labelsEqual(category.label, old.label),
      );
      return next ? [{ ...budget, category: next.id }] : [];
    });
    const recurrences = current.recurrences.flatMap((row) => {
      const old = findCategory(current.categories, row.category);
      if (!old) return [];
      if (old.type !== type) return [row];
      const next = incoming.categories.find(
        (category) => category.type === old.type && labelsEqual(category.label, old.label),
      );
      if (!next) return [];
      return [
        {
          ...row,
          category: next.id,
          payee: findPayee(incoming.payees, row.payee, row.type, next.id)?.name ?? row.payee,
        },
      ];
    });
    commit({
      transactions: [...incoming.transactions, ...keptTransactions],
      categories,
      payees,
      products,
      budgets,
      recurrences,
    });
    return { imported: incoming.transactions.length, truncated: parsed.truncated };
  },
}));
