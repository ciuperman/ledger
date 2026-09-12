import type { Category, CategoryId, Payee, Product, TxType } from "./types";

export type CategoryMeta = Category;

export const STEEL_COLORS = [
  "#d7dce3",
  "#c9d0d8",
  "#b7bfc8",
  "#adb6c0",
  "#c0c8d1",
  "#98a2ad",
  "#88929c",
  "#9aa3ae",
  "#7a848f",
  "#6a7380",
] as const;

export const FALLBACK_COLOR = "#6a7380";

/** Used only when importing a v1 backup. */
export const LEGACY_CATEGORIES: Record<
  string,
  { label: string; type: TxType; color: string }
> = {
  salary: { label: "Salary", type: "income", color: "#d7dce3" },
  freelance: { label: "Freelance", type: "income", color: "#b7bfc8" },
  transfer: { label: "Transfer", type: "income", color: "#98a2ad" },
  other_income: { label: "Other income", type: "income", color: "#818a96" },
  groceries: { label: "Groceries", type: "expense", color: "#d7dce3" },
  dining: { label: "Dining", type: "expense", color: "#b7bfc8" },
  transport: { label: "Transport", type: "expense", color: "#98a2ad" },
  housing: { label: "Housing", type: "expense", color: "#c9d0d8" },
  utilities: { label: "Utilities", type: "expense", color: "#88929c" },
  health: { label: "Health", type: "expense", color: "#adb6c0" },
  shopping: { label: "Shopping", type: "expense", color: "#7a848f" },
  entertainment: { label: "Entertainment", type: "expense", color: "#c0c8d1" },
  subscriptions: { label: "Subscriptions", type: "expense", color: "#6a7380" },
  other: { label: "Other", type: "expense", color: "#9aa3ae" },
};

export function nextColor(existing: Category[]): string {
  const used = new Set(existing.map((c) => c.color.toLowerCase()));
  const free = STEEL_COLORS.find((c) => !used.has(c));
  if (free) return free;
  return STEEL_COLORS[existing.length % STEEL_COLORS.length]!;
}

export function normalizeLabel(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function labelsEqual(a: string, b: string): boolean {
  return normalizeLabel(a).toLowerCase() === normalizeLabel(b).toLowerCase();
}

export function findCategory(
  categories: Category[],
  id: CategoryId,
): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function categoryLabel(id: CategoryId, categories: Category[]): string {
  return findCategory(categories, id)?.label ?? "Uncategorized";
}

export function categoryColor(id: CategoryId, categories: Category[]): string {
  return findCategory(categories, id)?.color ?? FALLBACK_COLOR;
}

export function categoriesFor(categories: Category[], type: TxType): Category[] {
  return categories.filter((c) => c.type === type);
}

export function hasDuplicateLabel(
  categories: Category[],
  type: TxType,
  label: string,
  exceptId?: string,
): boolean {
  const normalized = normalizeLabel(label);
  if (!normalized) return false;
  return categories.some(
    (c) => c.type === type && c.id !== exceptId && labelsEqual(c.label, normalized),
  );
}

export function findPayee(
  payees: Payee[],
  name: string,
  type: TxType,
  category: CategoryId,
): Payee | undefined {
  return payees.find(
    (p) => p.type === type && p.category === category && labelsEqual(p.name, name),
  );
}

export function payeesFor(
  payees: Payee[],
  type: TxType,
  category?: CategoryId,
): Payee[] {
  return payees
    .filter((p) => {
      if (p.type !== type) return false;
      if (!category) return true;
      return p.category === category || p.category === "";
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

export function payeeNames(
  payees: Payee[],
  type: TxType,
  category?: CategoryId,
): string[] {
  const names: string[] = [];
  for (const row of payeesFor(payees, type, category)) {
    if (!names.some((n) => labelsEqual(n, row.name))) names.push(row.name);
  }
  return names;
}

export function findProduct(
  products: Product[],
  name: string,
  category: CategoryId,
): Product | undefined {
  return products.find((p) => p.category === category && labelsEqual(p.name, name));
}

export function productsFor(products: Product[], category?: CategoryId): Product[] {
  return products
    .filter((p) => {
      if (!category) return true;
      return p.category === category || p.category === "";
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

export function productNames(products: Product[], category?: CategoryId): string[] {
  const names: string[] = [];
  for (const row of productsFor(products, category)) {
    if (!names.some((n) => labelsEqual(n, row.name))) names.push(row.name);
  }
  return names;
}
