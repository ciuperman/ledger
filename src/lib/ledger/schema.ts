import { z } from "zod";
import { FREQUENCIES, RANGE_PRESETS } from "./types";

export const transactionSchema = z.object({
  id: z.string().min(1).max(80),
  type: z.enum(["income", "expense"]),
  amount: z.number().finite().positive().max(1_000_000_000),
  category: z.string().trim().min(1).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  payee: z.string().trim().min(1).max(80),
  note: z.string().trim().max(160).optional(),
  product: z.string().trim().min(1).max(80).optional(),
  quantity: z.number().finite().positive().max(1_000_000).optional(),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        quantity: z.number().finite().positive().max(1_000_000).optional(),
        price: z.number().finite().min(0).max(1_000_000_000).optional(),
      }),
    )
    .max(40)
    .optional(),
});

export const categorySchema = z.object({
  id: z.string().min(1).max(80),
  label: z.string().trim().min(1).max(40),
  type: z.enum(["income", "expense"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const budgetSchema = z.object({
  id: z.string().min(1).max(80),
  category: z.string().trim().min(1).max(80),
  monthly: z.number().finite().positive().max(1_000_000_000),
});

export const recurringSchema = z.object({
  id: z.string().min(1).max(80),
  type: z.enum(["income", "expense"]),
  amount: z.number().finite().positive().max(1_000_000_000),
  category: z.string().trim().min(1).max(80),
  payee: z.string().trim().min(1).max(80),
  note: z.string().trim().max(160).optional(),
  frequency: z.enum(FREQUENCIES),
  nextDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  autoPost: z.boolean(),
  paused: z.boolean(),
});

export const payeeSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: z.enum(["income", "expense"]),
  category: z.string().trim().max(80).optional(),
});

export const productSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.string().trim().max(80),
});

export const snapshotSchema = z.object({
  v: z.literal(2),
  updatedAt: z.number().finite(),
  range: z.enum(RANGE_PRESETS),
  transactions: z.array(transactionSchema).max(5000),
  categories: z.array(categorySchema).max(100),
  payees: z
    .array(z.union([z.string().trim().min(1).max(80), payeeSchema]))
    .max(500),
  products: z.array(productSchema).max(500).optional(),
  budgets: z.array(budgetSchema).max(100).optional(),
  recurrences: z.array(recurringSchema).max(200).optional(),
});

export const legacySnapshotSchema = z.object({
  v: z.literal(1),
  updatedAt: z.number().finite().optional(),
  range: z.enum(RANGE_PRESETS).optional(),
  transactions: z.array(transactionSchema).max(5000),
});

export const importSchema = z.union([
  snapshotSchema,
  legacySnapshotSchema,
  z.array(transactionSchema).max(5000),
  z.object({ transactions: z.array(transactionSchema).max(5000) }),
]);
