import {
  FALLBACK_COLOR,
  LEGACY_CATEGORIES,
  findPayee,
  findProduct,
  labelsEqual,
  normalizeLabel,
} from "./categories";
import type {
  BookId,
  Budget,
  Category,
  Payee,
  Product,
  RangePreset,
  RecurringBill,
  Snapshot,
  Transaction,
} from "./types";
import { FREQUENCIES, RANGE_PRESETS } from "./types";

export const STORAGE_KEY = "ledger.v2";
export const KEEL_STORAGE_KEY = "keel.v2";

export function storageKeyFor(book: BookId = "ledger"): string {
  return book === "keel" ? KEEL_STORAGE_KEY : STORAGE_KEY;
}
const IDB_NAME = "ledger-app";
const IDB_STORE = "kv";
const IDB_TIMEOUT_MS = 400;
const RANGE_SET = new Set<string>(RANGE_PRESETS);
const FREQ_SET = new Set<string>(FREQUENCIES);

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      () => {
        window.clearTimeout(timer);
        resolve(null);
      },
    );
  });
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(IDB_STORE)) {
        req.result.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function isTx(value: unknown): value is Transaction {
  if (!value || typeof value !== "object") return false;
  const t = value as Partial<Transaction>;
  return (
    typeof t.id === "string" &&
    t.id.length > 0 &&
    (t.type === "income" || t.type === "expense") &&
    typeof t.amount === "number" &&
    Number.isFinite(t.amount) &&
    t.amount > 0 &&
    typeof t.category === "string" &&
    t.category.length > 0 &&
    t.category.length <= 80 &&
    typeof t.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(t.date) &&
    typeof t.payee === "string" &&
    t.payee.length > 0 &&
    t.payee.length <= 80 &&
    (t.note === undefined || typeof t.note === "string") &&
    (t.product === undefined || (typeof t.product === "string" && t.product.length <= 80)) &&
    (t.quantity === undefined ||
      (typeof t.quantity === "number" &&
        Number.isFinite(t.quantity) &&
        t.quantity > 0 &&
        t.quantity <= 1_000_000))
  );
}

function isCategory(value: unknown): value is Category {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<Category>;
  return (
    typeof c.id === "string" &&
    c.id.length > 0 &&
    c.id.length <= 80 &&
    typeof c.label === "string" &&
    c.label.trim().length > 0 &&
    c.label.length <= 40 &&
    (c.type === "income" || c.type === "expense") &&
    typeof c.color === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(c.color)
  );
}

function isPayeeName(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 80;
}

function isPayeeRow(value: unknown): value is Payee {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<Payee> & { category?: unknown };
  if (!isPayeeName(p.name) || (p.type !== "income" && p.type !== "expense")) return false;
  if (p.category === undefined) return true;
  return typeof p.category === "string" && p.category.length <= 80;
}

function isProductRow(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<Product>;
  return isPayeeName(p.name) && typeof p.category === "string" && p.category.length <= 80;
}

export function isBudget(value: unknown): value is Budget {
  if (!value || typeof value !== "object") return false;
  const b = value as Partial<Budget>;
  return (
    typeof b.id === "string" &&
    b.id.length > 0 &&
    typeof b.category === "string" &&
    b.category.length > 0 &&
    b.category.length <= 80 &&
    typeof b.monthly === "number" &&
    Number.isFinite(b.monthly) &&
    b.monthly > 0 &&
    b.monthly <= 1_000_000_000
  );
}

export function isRecurring(value: unknown): value is RecurringBill {
  if (!value || typeof value !== "object") return false;
  const r = value as Partial<RecurringBill>;
  return (
    typeof r.id === "string" &&
    r.id.length > 0 &&
    (r.type === "income" || r.type === "expense") &&
    typeof r.amount === "number" &&
    Number.isFinite(r.amount) &&
    r.amount > 0 &&
    r.amount <= 1_000_000_000 &&
    typeof r.category === "string" &&
    r.category.length > 0 &&
    r.category.length <= 80 &&
    typeof r.payee === "string" &&
    r.payee.length > 0 &&
    r.payee.length <= 80 &&
    (r.note === undefined || (typeof r.note === "string" && r.note.length <= 160)) &&
    typeof r.frequency === "string" &&
    FREQ_SET.has(r.frequency) &&
    typeof r.nextDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(r.nextDate) &&
    typeof r.autoPost === "boolean" &&
    typeof r.paused === "boolean"
  );
}

export function emptySnapshot(now = Date.now()): Snapshot {
  return {
    v: 2,
    updatedAt: now,
    range: "30d",
    transactions: [],
    categories: [],
    payees: [],
    products: [],
    budgets: [],
    recurrences: [],
  };
}

function uniquePayees(rows: Payee[]): Payee[] {
  const out: Payee[] = [];
  for (const row of rows) {
    const name = normalizeLabel(row.name);
    if (!name || (row.type !== "income" && row.type !== "expense")) continue;
    const category = row.category ?? "";
    if (findPayee(out, name, row.type, category)) continue;
    out.push({ name, type: row.type, category });
  }
  return out.sort(
    (a, b) =>
      a.type.localeCompare(b.type) ||
      a.category.localeCompare(b.category) ||
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

function readPayees(
  raw: unknown,
  transactions: Transaction[],
  recurrences: RecurringBill[],
): Payee[] {
  const fromActivity: Payee[] = uniquePayees([
    ...transactions.map((t) => ({ name: t.payee, type: t.type, category: t.category })),
    ...recurrences.map((r) => ({ name: r.payee, type: r.type, category: r.category })),
  ]);
  if (!Array.isArray(raw)) return fromActivity.slice(0, 500);

  let rows: Payee[] = [];
  if (raw.every(isPayeeRow)) {
    for (const row of raw as Array<Payee & { category?: string }>) {
      const name = normalizeLabel(row.name);
      const category = row.category ?? "";
      if (category) {
        rows.push({ name, type: row.type, category });
        continue;
      }
      const used = fromActivity.filter((p) => p.type === row.type && labelsEqual(p.name, name) && p.category);
      if (used.length > 0) rows.push(...used);
      else rows.push({ name, type: row.type, category: "" });
    }
  } else if (raw.every(isPayeeName)) {
    for (const name of raw as string[]) {
      const cleaned = normalizeLabel(name);
      const used = fromActivity.filter((p) => labelsEqual(p.name, cleaned) && p.category);
      if (used.length > 0) {
        rows.push(...used);
        continue;
      }
      rows.push({ name: cleaned, type: "income", category: "" }, { name: cleaned, type: "expense", category: "" });
    }
  } else {
    return fromActivity.slice(0, 500);
  }

  return uniquePayees(rows).slice(0, 500);
}

function uniqueProducts(rows: Product[]): Product[] {
  const out: Product[] = [];
  for (const row of rows) {
    const name = normalizeLabel(row.name);
    if (!name) continue;
    const category = row.category ?? "";
    if (findProduct(out, name, category)) continue;
    out.push({ name, category });
  }
  return out.sort(
    (a, b) =>
      a.category.localeCompare(b.category) ||
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

function readQuantity(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > 1_000_000) {
    return undefined;
  }
  return Math.round(value * 1000) / 1000;
}

function readTransactions(rows: Transaction[]): Transaction[] {
  return rows.map((t) => {
    if (t.type !== "income") {
      return {
        id: t.id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        date: t.date,
        payee: t.payee,
        note: t.note,
      };
    }
    const product = t.product ? normalizeLabel(t.product).slice(0, 80) : undefined;
    return {
      ...t,
      product: product || undefined,
      quantity: readQuantity(t.quantity),
    };
  });
}

function readProducts(raw: unknown, transactions: Transaction[]): Product[] {
  const fromActivity = uniqueProducts(
    transactions
      .filter((t) => t.type === "income" && t.product)
      .map((t) => ({ name: t.product!, category: t.category })),
  );
  if (!Array.isArray(raw)) return fromActivity.slice(0, 500);
  if (!raw.every(isProductRow)) return fromActivity.slice(0, 500);
  return uniqueProducts([...fromActivity, ...(raw as Product[])]).slice(0, 500);
}

function uniqueBudgets(rows: Budget[]): Budget[] {
  const seen = new Set<string>();
  const out: Budget[] = [];
  for (const row of rows) {
    if (seen.has(row.category)) continue;
    seen.add(row.category);
    out.push(row);
  }
  return out;
}

export function snapshotFromParts(input: {
  range: RangePreset;
  transactions: Transaction[];
  categories: Category[];
  payees: unknown;
  products?: unknown;
  budgets?: Budget[];
  recurrences?: RecurringBill[];
  updatedAt?: number;
}): Snapshot {
  const recurrences = input.recurrences ?? [];
  const transactions = readTransactions(input.transactions);
  return {
    v: 2,
    updatedAt: input.updatedAt ?? Date.now(),
    range: input.range,
    transactions,
    categories: input.categories,
    payees: readPayees(input.payees, transactions, recurrences),
    products: readProducts(input.products, transactions),
    budgets: uniqueBudgets(input.budgets ?? []),
    recurrences,
  };
}

function deriveFromTransactions(transactions: Transaction[]): {
  categories: Category[];
  payees: Payee[];
} {
  const cats = new Map<string, Category>();
  for (const tx of transactions) {
    if (cats.has(tx.category)) continue;
    const legacy = LEGACY_CATEGORIES[tx.category];
    cats.set(tx.category, {
      id: tx.category,
      label: legacy?.label ?? tx.category,
      type: legacy?.type ?? tx.type,
      color: legacy?.color ?? FALLBACK_COLOR,
    });
  }
  return {
    categories: [...cats.values()],
    payees: uniquePayees(transactions.map((t) => ({ name: t.payee, type: t.type, category: t.category }))),
  };
}

function readBudgets(raw: unknown): Budget[] {
  if (!Array.isArray(raw)) return [];
  return uniqueBudgets(raw.filter(isBudget)).slice(0, 100);
}

function readRecurrences(raw: unknown): RecurringBill[] {
  if (!Array.isArray(raw)) return [];
  return (raw.filter(isRecurring) as RecurringBill[]).slice(0, 200);
}

export function asSnapshot(raw: unknown): Snapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.v !== 2 || typeof o.updatedAt !== "number" || !Array.isArray(o.transactions)) {
    return null;
  }
  if (typeof o.range !== "string" || !RANGE_SET.has(o.range)) return null;
  if (!Array.isArray(o.categories) || !Array.isArray(o.payees)) return null;
  if (o.transactions.length > 5000 || !o.transactions.every(isTx)) return null;
  if (o.categories.length > 100 || !o.categories.every(isCategory)) return null;
  if (o.payees.length > 500) return null;
  if (Array.isArray(o.products) && o.products.length > 500) return null;
  const recurrences = readRecurrences(o.recurrences);
  return snapshotFromParts({
    range: o.range as RangePreset,
    transactions: o.transactions as Transaction[],
    categories: o.categories as Category[],
    payees: o.payees as Payee[] | string[],
    products: o.products,
    budgets: readBudgets(o.budgets),
    recurrences,
    updatedAt: o.updatedAt,
  });
}

export function readLocalSnapshot(book: BookId = "ledger"): Snapshot | null {
  try {
    const raw = localStorage.getItem(storageKeyFor(book));
    if (!raw) return null;
    return asSnapshot(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeLocalSnapshot(snap: Snapshot, book: BookId = "ledger"): boolean {
  try {
    localStorage.setItem(storageKeyFor(book), JSON.stringify(snap));
    return true;
  } catch {
    return false;
  }
}

export async function readIdbSnapshot(book: BookId = "ledger"): Promise<Snapshot | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(storageKeyFor(book));
      req.onsuccess = () => resolve(asSnapshot(req.result));
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function writeIdbSnapshot(snap: Snapshot, book: BookId = "ledger"): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(snap, storageKeyFor(book));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* private mode / disabled IDB */
  }
}

export function pickNewest(a: Snapshot | null, b: Snapshot | null): Snapshot | null {
  if (a && b) return a.updatedAt >= b.updatedAt ? a : b;
  return a ?? b;
}

export function persistSnapshot(snap: Snapshot, book: BookId = "ledger"): boolean {
  const ok = writeLocalSnapshot(snap, book);
  void writeIdbSnapshot(snap, book);
  return ok;
}

export async function loadSnapshot(book: BookId = "ledger"): Promise<Snapshot | null> {
  const local = readLocalSnapshot(book);
  if (typeof indexedDB === "undefined") return local;
  const idb = await withTimeout(readIdbSnapshot(book), IDB_TIMEOUT_MS);
  return pickNewest(local, idb);
}

export async function parseImport(raw: unknown): Promise<Snapshot> {
  const { importSchema } = await import("./schema");
  const parsed = importSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("That file is not a Ledger backup.");
  }
  const data = parsed.data;
  if (Array.isArray(data)) {
    const derived = deriveFromTransactions(data);
    return snapshotFromParts({
      range: "30d",
      transactions: data,
      categories: derived.categories,
      payees: derived.payees,
    });
  }
  if ("v" in data && data.v === 2) {
    return snapshotFromParts({
      ...data,
      budgets: readBudgets("budgets" in data ? data.budgets : []),
      recurrences: readRecurrences("recurrences" in data ? data.recurrences : []),
    });
  }
  const transactions = "transactions" in data ? data.transactions : [];
  const derived = deriveFromTransactions(transactions);
  const range = "range" in data && data.range ? data.range : "30d";
  return snapshotFromParts({
    range,
    transactions,
    categories: derived.categories,
    payees: derived.payees,
    updatedAt: "updatedAt" in data && typeof data.updatedAt === "number" ? data.updatedAt : Date.now(),
  });
}

export function downloadBackup(snap: Snapshot, book: BookId = "ledger"): void {
  const blob = new Blob([JSON.stringify(snap, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  a.href = url;
  a.download = `${book}-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function readFileAsJson(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)));
      } catch {
        reject(new Error("That file is not valid JSON."));
      }
    };
    reader.readAsText(file);
  });
}
