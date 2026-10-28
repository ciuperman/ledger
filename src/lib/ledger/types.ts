export const RANGE_PRESETS = ["7d", "30d", "90d", "6m", "1y", "2y"] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number];

export const BOOKS = ["ledger", "keel"] as const;
export type BookId = (typeof BOOKS)[number];

export const TX_TYPES = ["income", "expense"] as const;
export type TxType = (typeof TX_TYPES)[number];

export const FREQUENCIES = ["weekly", "monthly", "yearly"] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export type CategoryId = string;

export type Category = {
  id: CategoryId;
  label: string;
  type: TxType;
  color: string;
};

export type ReceiptItem = {
  name: string;
  quantity?: number;
  unit?: number;
  price?: number;
};

export type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  category: CategoryId;
  date: string;
  payee: string;
  note?: string;
  product?: string;
  quantity?: number;
  items?: ReceiptItem[];
};

export type Budget = {
  id: string;
  category: CategoryId;
  monthly: number;
};

export type RecurringBill = {
  id: string;
  type: TxType;
  amount: number;
  category: CategoryId;
  payee: string;
  note?: string;
  frequency: Frequency;
  nextDate: string;
  autoPost: boolean;
  paused: boolean;
};

export type Payee = {
  name: string;
  type: TxType;
  category: CategoryId;
};

export type Product = {
  name: string;
  category: CategoryId;
};

export type Snapshot = {
  v: 2;
  updatedAt: number;
  range: RangePreset;
  transactions: Transaction[];
  categories: Category[];
  payees: Payee[];
  products: Product[];
  budgets: Budget[];
  recurrences: RecurringBill[];
};

export type PostedItem = {
  payee: string;
  amount: number;
  date: string;
};
