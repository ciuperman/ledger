import { isValid, parse, parseISO } from "date-fns";
import {
  labelsEqual,
  nextColor,
  normalizeLabel,
} from "./categories";
import { isoDate } from "./format";
import type { BookId, Category, Payee, Product, Transaction, TxType } from "./types";

const MAX_TX = 5000;
const DATE_FORMATS = [
  "yyyy-MM-dd",
  "d.M.yyyy",
  "dd.MM.yyyy",
  "d/M/yyyy",
  "dd/MM/yyyy",
  "d-M-yyyy",
  "dd-MM-yyyy",
  "d MMM yyyy",
  "dd MMM yyyy",
  "d MMMM yyyy",
];

function csvField(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

function money(n: number): string {
  return n.toFixed(2);
}

export function transactionsToCsv(
  transactions: Transaction[],
  categories: Category[],
): string {
  const header = ["Date", "Type", "Payee", "Category", "Product", "Quantity", "Income", "Expense", "Note"];
  const rows = [...transactions]
    .sort((a, b) => a.date.localeCompare(b.date) || a.payee.localeCompare(b.payee))
    .map((tx) => {
      const income = tx.type === "income" ? money(tx.amount) : "";
      const expense = tx.type === "expense" ? money(tx.amount) : "";
      return [
        tx.date,
        tx.type === "income" ? "Income" : "Expense",
        csvField(tx.payee),
        csvField(categoryLabelSafe(tx.category, categories)),
        csvField(tx.type === "income" ? (tx.product ?? "") : ""),
        tx.type === "income" && tx.quantity != null ? String(tx.quantity) : "",
        income,
        expense,
        csvField(tx.note ?? ""),
      ].join(",");
    });
  return [header.join(","), ...rows].join("\r\n");
}

function categoryLabelSafe(id: string, categories: Category[]): string {
  return categories.find((c) => c.id === id)?.label ?? "Uncategorized";
}

function stamp(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export type CsvExportResult = "empty" | "shared" | "downloaded" | "cancelled";

export async function exportTransactionsCsv(
  transactions: Transaction[],
  categories: Category[],
  book: BookId = "ledger",
): Promise<CsvExportResult> {
  if (transactions.length === 0) return "empty";
  const csv = transactionsToCsv(transactions, categories);
  const label = book === "keel" ? "Keel" : "Ledger";
  const file = new File([`\uFEFF${csv}`], `${book}-transactions-${stamp()}.csv`, {
    type: "text/csv;charset=utf-8",
  });

  try {
    if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `${label} transactions` });
      return "shared";
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
  }

  downloadFile(file);
  return "downloaded";
}

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function detectDelimiter(line: string): "," | ";" {
  let comma = 0;
  let semi = 0;
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!;
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (!inQuotes) {
      if (c === ",") comma += 1;
      if (c === ";") semi += 1;
    }
  }
  return semi > comma ? ";" : ",";
}

export function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const firstNl = src.search(/\r\n|\n|\r/);
  const firstLine = firstNl === -1 ? src : src.slice(0, firstNl);
  const delim = detectDelimiter(firstLine);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
        continue;
      }
      field += c;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      continue;
    }
    if (c === delim) {
      row.push(field);
      field = "";
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      continue;
    }
    field += c;
  }
  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

type Col =
  | "date"
  | "type"
  | "payee"
  | "category"
  | "product"
  | "quantity"
  | "income"
  | "expense"
  | "amount"
  | "note";

const HEADER_MAP: Record<string, Col> = {
  date: "date",
  data: "date",
  zi: "date",
  type: "type",
  tip: "type",
  kind: "type",
  payee: "payee",
  merchant: "payee",
  vendor: "payee",
  beneficiar: "payee",
  name: "payee",
  nume: "payee",
  category: "category",
  categorie: "category",
  cat: "category",
  product: "product",
  produs: "product",
  item: "product",
  quantity: "quantity",
  qty: "quantity",
  cantitate: "quantity",
  income: "income",
  venit: "income",
  in: "income",
  expense: "expense",
  cheltuiala: "expense",
  cheltuieli: "expense",
  out: "expense",
  amount: "amount",
  suma: "amount",
  value: "amount",
  valoare: "amount",
  note: "note",
  notes: "note",
  nota: "note",
  description: "note",
  descriere: "note",
  memo: "note",
};

function headerKey(raw: string): Col | null {
  const cleaned = fold(raw)
    .replace(/\(ron\)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (cleaned === "kind") return "type";
  return HEADER_MAP[cleaned] ?? null;
}

function parseDateCell(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  for (const fmt of DATE_FORMATS) {
    const d = parse(s, fmt, new Date());
    if (isValid(d) && d.getFullYear() >= 1990 && d.getFullYear() <= 2100) {
      return isoDate(d);
    }
  }
  const iso = parseISO(s);
  if (isValid(iso) && iso.getFullYear() >= 1990 && iso.getFullYear() <= 2100) {
    return isoDate(iso);
  }
  return null;
}

function parseMoney(raw: string): { amount: number; negative: boolean } | null {
  let s = raw.trim();
  if (!s) return null;
  s = s.replace(/\s/g, "").replace(/lei|ron/gi, "");
  const parenNeg = s.startsWith("(") && s.endsWith(")");
  s = s.replace(/[()]/g, "");
  const negative = parenNeg || /^[-−–]/.test(s);
  s = s.replace(/^[-+−–]/, "");
  if (!s) return null;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma !== -1 && lastDot !== -1) {
    s = lastComma > lastDot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (lastComma !== -1) {
    const frac = s.length - lastComma - 1;
    s = frac === 3 && !s.includes(".") ? s.replace(",", "") : s.replace(",", ".");
  } else if (lastDot !== -1) {
    const frac = s.length - lastDot - 1;
    if (frac === 3 && (s.match(/\./g) ?? []).length > 1) s = s.replace(/\./g, "");
  }
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return null;
  return { amount: Math.round(n * 100) / 100, negative };
}

function parseType(raw: string): TxType | null {
  const s = fold(raw);
  if (["income", "in", "venit", "salary", "+"].includes(s)) return "income";
  if (["expense", "out", "cheltuiala", "cheltuieli", "spend", "-"].includes(s)) return "expense";
  return null;
}

function mapHeaders(row: string[]): Partial<Record<Col, number>> | null {
  const map: Partial<Record<Col, number>> = {};
  let hits = 0;
  row.forEach((cell, i) => {
    const key = headerKey(cell);
    if (!key || map[key] !== undefined) return;
    map[key] = i;
    hits += 1;
  });
  if (hits >= 2 && (map.date !== undefined || map.payee !== undefined)) return map;
  return null;
}

function cell(row: string[], index: number | undefined): string {
  if (index === undefined) return "";
  return row[index]?.trim() ?? "";
}

export type CsvLedger = {
  transactions: Transaction[];
  categories: Category[];
  payees: Payee[];
  products: Product[];
  truncated: boolean;
};

export function csvToLedger(text: string): CsvLedger {
  const rows = parseCsv(text);
  if (rows.length === 0) throw new Error("That spreadsheet is empty.");

  let start = 0;
  let cols = mapHeaders(rows[0]!);
  if (cols) {
    start = 1;
  } else {
    cols = {
      date: 0,
      type: 1,
      payee: 2,
      category: 3,
      income: 4,
      expense: 5,
      note: 6,
    };
    const probe = parseDateCell(rows[0]![0] ?? "");
    if (!probe && fold(rows[0]![0] ?? "") === "date") start = 1;
  }

  if (cols.date === undefined || cols.payee === undefined) {
    throw new Error("Need Date and Payee columns.");
  }
  if (
    cols.income === undefined &&
    cols.expense === undefined &&
    cols.amount === undefined
  ) {
    throw new Error("Need an Income, Expense, or Amount column.");
  }

  const categories: Category[] = [];
  const payees: Payee[] = [];
  const products: Product[] = [];
  const transactions: Transaction[] = [];

  function categoryId(label: string, type: TxType): string {
    const cleaned = normalizeLabel(label).slice(0, 40) || (type === "income" ? "Income" : "Expense");
    const existing = categories.find((c) => c.type === type && labelsEqual(c.label, cleaned));
    if (existing) return existing.id;
    const row: Category = {
      id: crypto.randomUUID(),
      label: cleaned,
      type,
      color: nextColor(categories),
    };
    categories.push(row);
    return row.id;
  }

  function addPayee(name: string, type: TxType, category: string): string {
    const cleaned = normalizeLabel(name).slice(0, 80);
    const found = payees.find((p) => p.type === type && p.category === category && labelsEqual(p.name, cleaned));
    if (found) return found.name;
    payees.push({ name: cleaned, type, category });
    return cleaned;
  }

  function addProduct(name: string, category: string): string {
    const cleaned = normalizeLabel(name).slice(0, 80);
    if (!cleaned) return "";
    const found = products.find((p) => p.category === category && labelsEqual(p.name, cleaned));
    if (found) return found.name;
    products.push({ name: cleaned, category });
    return cleaned;
  }

  for (let i = start; i < rows.length; i++) {
    if (transactions.length >= MAX_TX) break;
    const row = rows[i]!;
    const date = parseDateCell(cell(row, cols.date));
    const payeeRaw = cell(row, cols.payee);
    if (!date || !payeeRaw) continue;

    const incomeVal = parseMoney(cell(row, cols.income));
    const expenseVal = parseMoney(cell(row, cols.expense));
    const amountVal = parseMoney(cell(row, cols.amount));
    let type = parseType(cell(row, cols.type));
    let amount = 0;

    if (type === "income" && incomeVal) amount = incomeVal.amount;
    else if (type === "expense" && expenseVal) amount = expenseVal.amount;
    else if (incomeVal && !expenseVal) {
      type = "income";
      amount = incomeVal.amount;
    } else if (expenseVal && !incomeVal) {
      type = "expense";
      amount = expenseVal.amount;
    } else if (amountVal) {
      type = type ?? "expense";
      amount = amountVal.amount;
    } else continue;

    const catLabel = cell(row, cols.category);
    const noteRaw = cell(row, cols.note);
    const productRaw = cell(row, cols.product);
    const qtyRaw = cell(row, cols.quantity);
    const category = categoryId(catLabel, type);
    const qtyParsed = type === "income" && qtyRaw ? Number(qtyRaw.replace(",", ".")) : NaN;
    const quantity =
      type === "income" && Number.isFinite(qtyParsed) && qtyParsed > 0 ? Math.round(qtyParsed * 1000) / 1000 : undefined;
    const product = type === "income" && productRaw ? addProduct(productRaw, category) : undefined;
    transactions.push({
      id: crypto.randomUUID(),
      type,
      amount,
      category,
      date,
      payee: addPayee(payeeRaw, type, category),
      note: noteRaw ? normalizeLabel(noteRaw).slice(0, 160) : undefined,
      product: product || undefined,
      quantity,
    });
  }

  if (transactions.length === 0) {
    throw new Error("No transactions found in that spreadsheet.");
  }

  return {
    transactions,
    categories,
    payees,
    products,
    truncated: rows.length - start > transactions.length && transactions.length >= MAX_TX,
  };
}

export async function readCsvFile(file: File): Promise<CsvLedger> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".json")) throw new Error("Use Import backup for JSON files.");
  const text = await file.text();
  if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
    throw new Error("Use Import backup for JSON files.");
  }
  return csvToLedger(text);
}