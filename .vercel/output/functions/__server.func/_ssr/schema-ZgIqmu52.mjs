import { a as number, c as union, i as literal, n as array, o as object, r as boolean, s as string, t as _enum } from "../_libs/zod.mjs";
import { D as RANGE_PRESETS, E as FREQUENCIES } from "./routes-DuHhPS9Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/schema-ZgIqmu52.js
var transactionSchema = object({
	id: string().min(1).max(80),
	type: _enum(["income", "expense"]),
	amount: number().finite().positive().max(1e9),
	category: string().trim().min(1).max(80),
	date: string().regex(/^\d{4}-\d{2}-\d{2}$/),
	payee: string().trim().min(1).max(80),
	note: string().trim().max(160).optional(),
	product: string().trim().min(1).max(80).optional(),
	quantity: number().finite().positive().max(1e6).optional()
});
var categorySchema = object({
	id: string().min(1).max(80),
	label: string().trim().min(1).max(40),
	type: _enum(["income", "expense"]),
	color: string().regex(/^#[0-9a-fA-F]{6}$/)
});
var budgetSchema = object({
	id: string().min(1).max(80),
	category: string().trim().min(1).max(80),
	monthly: number().finite().positive().max(1e9)
});
var recurringSchema = object({
	id: string().min(1).max(80),
	type: _enum(["income", "expense"]),
	amount: number().finite().positive().max(1e9),
	category: string().trim().min(1).max(80),
	payee: string().trim().min(1).max(80),
	note: string().trim().max(160).optional(),
	frequency: _enum(FREQUENCIES),
	nextDate: string().regex(/^\d{4}-\d{2}-\d{2}$/),
	autoPost: boolean(),
	paused: boolean()
});
var payeeSchema = object({
	name: string().trim().min(1).max(80),
	type: _enum(["income", "expense"]),
	category: string().trim().max(80).optional()
});
var productSchema = object({
	name: string().trim().min(1).max(80),
	category: string().trim().max(80)
});
var snapshotSchema = object({
	v: literal(2),
	updatedAt: number().finite(),
	range: _enum(RANGE_PRESETS),
	transactions: array(transactionSchema).max(5e3),
	categories: array(categorySchema).max(100),
	payees: array(union([string().trim().min(1).max(80), payeeSchema])).max(500),
	products: array(productSchema).max(500).optional(),
	budgets: array(budgetSchema).max(100).optional(),
	recurrences: array(recurringSchema).max(200).optional()
});
var legacySnapshotSchema = object({
	v: literal(1),
	updatedAt: number().finite().optional(),
	range: _enum(RANGE_PRESETS).optional(),
	transactions: array(transactionSchema).max(5e3)
});
var importSchema = union([
	snapshotSchema,
	legacySnapshotSchema,
	array(transactionSchema).max(5e3),
	object({ transactions: array(transactionSchema).max(5e3) })
]);
//#endregion
export { importSchema };
