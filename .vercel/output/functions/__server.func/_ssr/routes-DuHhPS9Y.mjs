import { i as __toESM } from "../_runtime.mjs";
import { _ as addMonths, a as parse, c as eachDayOfInterval, d as isValid, f as addYears, g as startOfWeek, h as startOfDay, i as subDays, l as endOfMonth, m as differenceInCalendarDays, n as subMonths, o as format, p as addWeeks, r as parseISO, s as startOfMonth, t as subYears, u as endOfDay, v as addDays } from "../_libs/date-fns.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime, a as Overlay2, c as Title2, i as Description2, j as Slot, n as Cancel, o as Portal2, r as Content2, s as Root2, t as Action } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as create } from "../_libs/zustand.mjs";
import { C as ArrowDownRight, S as ArrowUpRight, _ as FileSpreadsheet, a as Trash2, c as Search, g as FileUp, h as Minus, l as Repeat, m as Package, n as Users, o as Tag, r as Upload, s as Smartphone, t as Wallet, u as Plus, v as Ellipsis, x as Check, y as Download } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as Root2$1, i as Portal2$1, n as Item2, o as Separator2, r as Label2, s as Trigger, t as Content2$1 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { n as Route, r as __exportAll } from "./router-BsIYv1kA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-BJ0n2gbf.js
function groupThousands(intPart) {
	return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function formatRon(n) {
	const sign = n < 0 ? "−" : "";
	const [intPart, frac] = Math.abs(n).toFixed(2).split(".");
	return `${sign}${groupThousands(intPart)},${frac} RON`;
}
function formatAxis(n) {
	const sign = n < 0 ? "−" : "";
	const abs = Math.abs(n);
	if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`;
	if (abs >= 1e3) return `${sign}${Math.round(abs / 1e3)}k`;
	return `${sign}${Math.round(abs)}`;
}
function formatRonSigned(n) {
	if (n > 0) return `+${formatRon(n)}`;
	if (n < 0) return formatRon(n);
	return formatRon(0);
}
function formatPct(ratio) {
	return `${ratio > 0 ? "+" : ratio < 0 ? "−" : ""}${Math.abs(ratio * 100).toFixed(1)}%`;
}
function formatPts(ratio) {
	return `${ratio > 0 ? "+" : ratio < 0 ? "−" : ""}${Math.abs(ratio * 100).toFixed(1)} pts`;
}
function formatDayYear(iso) {
	return format(parseISO(iso), "d MMM yyyy");
}
function formatMonthLabel(d) {
	return format(d, "MMMM yyyy");
}
function isoDate(d) {
	return format(d, "yyyy-MM-dd");
}
function signedAmount(type, amount) {
	return type === "income" ? amount : -amount;
}
function parseAmount(value) {
	const amount = Number(value.replace(",", "."));
	if (!Number.isFinite(amount) || amount <= 0) return null;
	return amount;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/types-CkA4XjsB.js
var RANGE_PRESETS = [
	"7d",
	"30d",
	"90d",
	"6m",
	"1y"
];
var FREQUENCIES = [
	"weekly",
	"monthly",
	"yearly"
];
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/input-BCuctCGE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEEL_COLORS = [
	"#d7dce3",
	"#c9d0d8",
	"#b7bfc8",
	"#adb6c0",
	"#c0c8d1",
	"#98a2ad",
	"#88929c",
	"#9aa3ae",
	"#7a848f",
	"#6a7380"
];
/** Used only when importing a v1 backup. */
var LEGACY_CATEGORIES = {
	salary: {
		label: "Salary",
		type: "income",
		color: "#d7dce3"
	},
	freelance: {
		label: "Freelance",
		type: "income",
		color: "#b7bfc8"
	},
	transfer: {
		label: "Transfer",
		type: "income",
		color: "#98a2ad"
	},
	other_income: {
		label: "Other income",
		type: "income",
		color: "#818a96"
	},
	groceries: {
		label: "Groceries",
		type: "expense",
		color: "#d7dce3"
	},
	dining: {
		label: "Dining",
		type: "expense",
		color: "#b7bfc8"
	},
	transport: {
		label: "Transport",
		type: "expense",
		color: "#98a2ad"
	},
	housing: {
		label: "Housing",
		type: "expense",
		color: "#c9d0d8"
	},
	utilities: {
		label: "Utilities",
		type: "expense",
		color: "#88929c"
	},
	health: {
		label: "Health",
		type: "expense",
		color: "#adb6c0"
	},
	shopping: {
		label: "Shopping",
		type: "expense",
		color: "#7a848f"
	},
	entertainment: {
		label: "Entertainment",
		type: "expense",
		color: "#c0c8d1"
	},
	subscriptions: {
		label: "Subscriptions",
		type: "expense",
		color: "#6a7380"
	},
	other: {
		label: "Other",
		type: "expense",
		color: "#9aa3ae"
	}
};
function nextColor(existing) {
	const used = new Set(existing.map((c) => c.color.toLowerCase()));
	const free = STEEL_COLORS.find((c) => !used.has(c));
	if (free) return free;
	return STEEL_COLORS[existing.length % STEEL_COLORS.length];
}
function normalizeLabel(value) {
	return value.trim().replace(/\s+/g, " ");
}
function labelsEqual(a, b) {
	return normalizeLabel(a).toLowerCase() === normalizeLabel(b).toLowerCase();
}
function findCategory(categories, id) {
	return categories.find((c) => c.id === id);
}
function categoryLabel(id, categories) {
	return findCategory(categories, id)?.label ?? "Uncategorized";
}
function categoryColor(id, categories) {
	return findCategory(categories, id)?.color ?? "#6a7380";
}
function categoriesFor(categories, type) {
	return categories.filter((c) => c.type === type);
}
function hasDuplicateLabel(categories, type, label, exceptId) {
	const normalized = normalizeLabel(label);
	if (!normalized) return false;
	return categories.some((c) => c.type === type && c.id !== exceptId && labelsEqual(c.label, normalized));
}
function findPayee(payees, name, type, category) {
	return payees.find((p) => p.type === type && p.category === category && labelsEqual(p.name, name));
}
function payeesFor(payees, type, category) {
	return payees.filter((p) => {
		if (p.type !== type) return false;
		if (!category) return true;
		return p.category === category || p.category === "";
	}).sort((a, b) => a.name.localeCompare(b.name, void 0, { sensitivity: "base" }));
}
function payeeNames(payees, type, category) {
	const names = [];
	for (const row of payeesFor(payees, type, category)) if (!names.some((n) => labelsEqual(n, row.name))) names.push(row.name);
	return names;
}
function findProduct(products, name, category) {
	return products.find((p) => p.category === category && labelsEqual(p.name, name));
}
function productsFor(products, category) {
	return products.filter((p) => {
		if (!category) return true;
		return p.category === category || p.category === "";
	}).sort((a, b) => a.name.localeCompare(b.name, void 0, { sensitivity: "base" }));
}
function productNames(products, category) {
	const names = [];
	for (const row of productsFor(products, category)) if (!names.some((n) => labelsEqual(n, row.name))) names.push(row.name);
	return names;
}
var MAX_TX = 5e3;
var DATE_FORMATS = [
	"yyyy-MM-dd",
	"d.M.yyyy",
	"dd.MM.yyyy",
	"d/M/yyyy",
	"dd/MM/yyyy",
	"d-M-yyyy",
	"dd-MM-yyyy",
	"d MMM yyyy",
	"dd MMM yyyy",
	"d MMMM yyyy"
];
function csvField(value) {
	if (/[",\r\n]/.test(value)) return `"${value.replaceAll("\"", "\"\"")}"`;
	return value;
}
function money(n) {
	return n.toFixed(2);
}
function transactionsToCsv(transactions, categories) {
	const header = [
		"Date",
		"Type",
		"Payee",
		"Category",
		"Product",
		"Quantity",
		"Income",
		"Expense",
		"Note"
	];
	const rows = [...transactions].sort((a, b) => a.date.localeCompare(b.date) || a.payee.localeCompare(b.payee)).map((tx) => {
		const income = tx.type === "income" ? money(tx.amount) : "";
		const expense = tx.type === "expense" ? money(tx.amount) : "";
		return [
			tx.date,
			tx.type === "income" ? "Income" : "Expense",
			csvField(tx.payee),
			csvField(categoryLabelSafe(tx.category, categories)),
			csvField(tx.type === "income" ? tx.product ?? "" : ""),
			tx.type === "income" && tx.quantity != null ? String(tx.quantity) : "",
			income,
			expense,
			csvField(tx.note ?? "")
		].join(",");
	});
	return [header.join(","), ...rows].join("\r\n");
}
function categoryLabelSafe(id, categories) {
	return categories.find((c) => c.id === id)?.label ?? "Uncategorized";
}
function stamp() {
	const now = /* @__PURE__ */ new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function downloadFile(file) {
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
async function exportTransactionsCsv(transactions, categories) {
	if (transactions.length === 0) return "empty";
	const csv = transactionsToCsv(transactions, categories);
	const file = new File([`\uFEFF${csv}`], `ledger-transactions-${stamp()}.csv`, { type: "text/csv;charset=utf-8" });
	try {
		if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
			await navigator.share({
				files: [file],
				title: "Ledger transactions"
			});
			return "shared";
		}
	} catch (err) {
		if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
	}
	downloadFile(file);
	return "downloaded";
}
function fold(value) {
	return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}
function detectDelimiter(line) {
	let comma = 0;
	let semi = 0;
	let inQuotes = false;
	for (let i = 0; i < line.length; i++) {
		const c = line[i];
		if (c === "\"") {
			if (inQuotes && line[i + 1] === "\"") {
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
function parseCsv(text) {
	const src = text.replace(/^\uFEFF/, "");
	const firstNl = src.search(/\r\n|\n|\r/);
	const delim = detectDelimiter(firstNl === -1 ? src : src.slice(0, firstNl));
	const rows = [];
	let row = [];
	let field = "";
	let inQuotes = false;
	for (let i = 0; i < src.length; i++) {
		const c = src[i];
		if (inQuotes) {
			if (c === "\"") {
				if (src[i + 1] === "\"") {
					field += "\"";
					i += 1;
				} else inQuotes = false;
				continue;
			}
			field += c;
			continue;
		}
		if (c === "\"") {
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
var HEADER_MAP = {
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
	memo: "note"
};
function headerKey(raw) {
	const cleaned = fold(raw).replace(/\(ron\)/g, "").replace(/[^a-z0-9]+/g, " ").trim();
	if (cleaned === "kind") return "type";
	return HEADER_MAP[cleaned] ?? null;
}
function parseDateCell(raw) {
	const s = raw.trim();
	if (!s) return null;
	for (const fmt of DATE_FORMATS) {
		const d = parse(s, fmt, /* @__PURE__ */ new Date());
		if (isValid(d) && d.getFullYear() >= 1990 && d.getFullYear() <= 2100) return isoDate(d);
	}
	const iso = parseISO(s);
	if (isValid(iso) && iso.getFullYear() >= 1990 && iso.getFullYear() <= 2100) return isoDate(iso);
	return null;
}
function parseMoney(raw) {
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
	if (lastComma !== -1 && lastDot !== -1) s = lastComma > lastDot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
	else if (lastComma !== -1) s = s.length - lastComma - 1 === 3 && !s.includes(".") ? s.replace(",", "") : s.replace(",", ".");
	else if (lastDot !== -1) {
		if (s.length - lastDot - 1 === 3 && (s.match(/\./g) ?? []).length > 1) s = s.replace(/\./g, "");
	}
	const n = Number(s);
	if (!Number.isFinite(n) || n <= 0) return null;
	return {
		amount: Math.round(n * 100) / 100,
		negative
	};
}
function parseType(raw) {
	const s = fold(raw);
	if ([
		"income",
		"in",
		"venit",
		"salary",
		"+"
	].includes(s)) return "income";
	if ([
		"expense",
		"out",
		"cheltuiala",
		"cheltuieli",
		"spend",
		"-"
	].includes(s)) return "expense";
	return null;
}
function mapHeaders(row) {
	const map = {};
	let hits = 0;
	row.forEach((cell, i) => {
		const key = headerKey(cell);
		if (!key || map[key] !== void 0) return;
		map[key] = i;
		hits += 1;
	});
	if (hits >= 2 && (map.date !== void 0 || map.payee !== void 0)) return map;
	return null;
}
function cell(row, index) {
	if (index === void 0) return "";
	return row[index]?.trim() ?? "";
}
function csvToLedger(text) {
	const rows = parseCsv(text);
	if (rows.length === 0) throw new Error("That spreadsheet is empty.");
	let start = 0;
	let cols = mapHeaders(rows[0]);
	if (cols) start = 1;
	else {
		cols = {
			date: 0,
			type: 1,
			payee: 2,
			category: 3,
			income: 4,
			expense: 5,
			note: 6
		};
		if (!parseDateCell(rows[0][0] ?? "") && fold(rows[0][0] ?? "") === "date") start = 1;
	}
	if (cols.date === void 0 || cols.payee === void 0) throw new Error("Need Date and Payee columns.");
	if (cols.income === void 0 && cols.expense === void 0 && cols.amount === void 0) throw new Error("Need an Income, Expense, or Amount column.");
	const categories = [];
	const payees = [];
	const products = [];
	const transactions = [];
	function categoryId(label, type) {
		const cleaned = normalizeLabel(label).slice(0, 40) || (type === "income" ? "Income" : "Expense");
		const existing = categories.find((c) => c.type === type && labelsEqual(c.label, cleaned));
		if (existing) return existing.id;
		const row = {
			id: crypto.randomUUID(),
			label: cleaned,
			type,
			color: nextColor(categories)
		};
		categories.push(row);
		return row.id;
	}
	function addPayee(name, type, category) {
		const cleaned = normalizeLabel(name).slice(0, 80);
		const found = payees.find((p) => p.type === type && p.category === category && labelsEqual(p.name, cleaned));
		if (found) return found.name;
		payees.push({
			name: cleaned,
			type,
			category
		});
		return cleaned;
	}
	function addProduct(name, category) {
		const cleaned = normalizeLabel(name).slice(0, 80);
		if (!cleaned) return "";
		const found = products.find((p) => p.category === category && labelsEqual(p.name, cleaned));
		if (found) return found.name;
		products.push({
			name: cleaned,
			category
		});
		return cleaned;
	}
	for (let i = start; i < rows.length; i++) {
		if (transactions.length >= MAX_TX) break;
		const row = rows[i];
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
		const quantity = type === "income" && Number.isFinite(qtyParsed) && qtyParsed > 0 ? Math.round(qtyParsed * 1e3) / 1e3 : void 0;
		const product = type === "income" && productRaw ? addProduct(productRaw, category) : void 0;
		transactions.push({
			id: crypto.randomUUID(),
			type,
			amount,
			category,
			date,
			payee: addPayee(payeeRaw, type, category),
			note: noteRaw ? normalizeLabel(noteRaw).slice(0, 160) : void 0,
			product: product || void 0,
			quantity
		});
	}
	if (transactions.length === 0) throw new Error("No transactions found in that spreadsheet.");
	return {
		transactions,
		categories,
		payees,
		products,
		truncated: rows.length - start > transactions.length && transactions.length >= MAX_TX
	};
}
async function readCsvFile(file) {
	if (file.name.toLowerCase().endsWith(".json")) throw new Error("Use Import backup for JSON files.");
	const text = await file.text();
	if (text.trim().startsWith("{") || text.trim().startsWith("[")) throw new Error("Use Import backup for JSON files.");
	return csvToLedger(text);
}
var STORAGE_KEY = "ledger.v2";
var IDB_NAME = "ledger-app";
var IDB_STORE = "kv";
var IDB_TIMEOUT_MS = 400;
var RANGE_SET = new Set(RANGE_PRESETS);
var FREQ_SET = new Set(FREQUENCIES);
function withTimeout(promise, ms) {
	return new Promise((resolve) => {
		const timer = window.setTimeout(() => resolve(null), ms);
		promise.then((value) => {
			window.clearTimeout(timer);
			resolve(value);
		}, () => {
			window.clearTimeout(timer);
			resolve(null);
		});
	});
}
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(IDB_NAME, 1);
		req.onupgradeneeded = () => {
			if (!req.result.objectStoreNames.contains(IDB_STORE)) req.result.createObjectStore(IDB_STORE);
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
function isTx(value) {
	if (!value || typeof value !== "object") return false;
	const t = value;
	return typeof t.id === "string" && t.id.length > 0 && (t.type === "income" || t.type === "expense") && typeof t.amount === "number" && Number.isFinite(t.amount) && t.amount > 0 && typeof t.category === "string" && t.category.length > 0 && t.category.length <= 80 && typeof t.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t.date) && typeof t.payee === "string" && t.payee.length > 0 && t.payee.length <= 80 && (t.note === void 0 || typeof t.note === "string") && (t.product === void 0 || typeof t.product === "string" && t.product.length <= 80) && (t.quantity === void 0 || typeof t.quantity === "number" && Number.isFinite(t.quantity) && t.quantity > 0 && t.quantity <= 1e6);
}
function isCategory(value) {
	if (!value || typeof value !== "object") return false;
	const c = value;
	return typeof c.id === "string" && c.id.length > 0 && c.id.length <= 80 && typeof c.label === "string" && c.label.trim().length > 0 && c.label.length <= 40 && (c.type === "income" || c.type === "expense") && typeof c.color === "string" && /^#[0-9a-fA-F]{6}$/.test(c.color);
}
function isPayeeName(value) {
	return typeof value === "string" && value.trim().length > 0 && value.length <= 80;
}
function isPayeeRow(value) {
	if (!value || typeof value !== "object") return false;
	const p = value;
	if (!isPayeeName(p.name) || p.type !== "income" && p.type !== "expense") return false;
	if (p.category === void 0) return true;
	return typeof p.category === "string" && p.category.length <= 80;
}
function isProductRow(value) {
	if (!value || typeof value !== "object") return false;
	const p = value;
	return isPayeeName(p.name) && typeof p.category === "string" && p.category.length <= 80;
}
function isBudget(value) {
	if (!value || typeof value !== "object") return false;
	const b = value;
	return typeof b.id === "string" && b.id.length > 0 && typeof b.category === "string" && b.category.length > 0 && b.category.length <= 80 && typeof b.monthly === "number" && Number.isFinite(b.monthly) && b.monthly > 0 && b.monthly <= 1e9;
}
function isRecurring(value) {
	if (!value || typeof value !== "object") return false;
	const r = value;
	return typeof r.id === "string" && r.id.length > 0 && (r.type === "income" || r.type === "expense") && typeof r.amount === "number" && Number.isFinite(r.amount) && r.amount > 0 && r.amount <= 1e9 && typeof r.category === "string" && r.category.length > 0 && r.category.length <= 80 && typeof r.payee === "string" && r.payee.length > 0 && r.payee.length <= 80 && (r.note === void 0 || typeof r.note === "string" && r.note.length <= 160) && typeof r.frequency === "string" && FREQ_SET.has(r.frequency) && typeof r.nextDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.nextDate) && typeof r.autoPost === "boolean" && typeof r.paused === "boolean";
}
function emptySnapshot(now = Date.now()) {
	return {
		v: 2,
		updatedAt: now,
		range: "30d",
		transactions: [],
		categories: [],
		payees: [],
		products: [],
		budgets: [],
		recurrences: []
	};
}
function uniquePayees(rows) {
	const out = [];
	for (const row of rows) {
		const name = normalizeLabel(row.name);
		if (!name || row.type !== "income" && row.type !== "expense") continue;
		const category = row.category ?? "";
		if (findPayee(out, name, row.type, category)) continue;
		out.push({
			name,
			type: row.type,
			category
		});
	}
	return out.sort((a, b) => a.type.localeCompare(b.type) || a.category.localeCompare(b.category) || a.name.localeCompare(b.name, void 0, { sensitivity: "base" }));
}
function readPayees(raw, transactions, recurrences) {
	const fromActivity = uniquePayees([...transactions.map((t) => ({
		name: t.payee,
		type: t.type,
		category: t.category
	})), ...recurrences.map((r) => ({
		name: r.payee,
		type: r.type,
		category: r.category
	}))]);
	if (!Array.isArray(raw)) return fromActivity.slice(0, 500);
	let rows = [];
	if (raw.every(isPayeeRow)) for (const row of raw) {
		const name = normalizeLabel(row.name);
		const category = row.category ?? "";
		if (category) {
			rows.push({
				name,
				type: row.type,
				category
			});
			continue;
		}
		const used = fromActivity.filter((p) => p.type === row.type && labelsEqual(p.name, name) && p.category);
		if (used.length > 0) rows.push(...used);
		else rows.push({
			name,
			type: row.type,
			category: ""
		});
	}
	else if (raw.every(isPayeeName)) for (const name of raw) {
		const cleaned = normalizeLabel(name);
		const used = fromActivity.filter((p) => labelsEqual(p.name, cleaned) && p.category);
		if (used.length > 0) {
			rows.push(...used);
			continue;
		}
		rows.push({
			name: cleaned,
			type: "income",
			category: ""
		}, {
			name: cleaned,
			type: "expense",
			category: ""
		});
	}
	else return fromActivity.slice(0, 500);
	return uniquePayees(rows).slice(0, 500);
}
function uniqueProducts(rows) {
	const out = [];
	for (const row of rows) {
		const name = normalizeLabel(row.name);
		if (!name) continue;
		const category = row.category ?? "";
		if (findProduct(out, name, category)) continue;
		out.push({
			name,
			category
		});
	}
	return out.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name, void 0, { sensitivity: "base" }));
}
function readQuantity(value) {
	if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > 1e6) return;
	return Math.round(value * 1e3) / 1e3;
}
function readTransactions(rows) {
	return rows.map((t) => {
		if (t.type !== "income") return {
			id: t.id,
			type: t.type,
			amount: t.amount,
			category: t.category,
			date: t.date,
			payee: t.payee,
			note: t.note
		};
		const product = t.product ? normalizeLabel(t.product).slice(0, 80) : void 0;
		return {
			...t,
			product: product || void 0,
			quantity: readQuantity(t.quantity)
		};
	});
}
function readProducts(raw, transactions) {
	const fromActivity = uniqueProducts(transactions.filter((t) => t.type === "income" && t.product).map((t) => ({
		name: t.product,
		category: t.category
	})));
	if (!Array.isArray(raw)) return fromActivity.slice(0, 500);
	if (!raw.every(isProductRow)) return fromActivity.slice(0, 500);
	return uniqueProducts([...fromActivity, ...raw]).slice(0, 500);
}
function uniqueBudgets(rows) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const row of rows) {
		if (seen.has(row.category)) continue;
		seen.add(row.category);
		out.push(row);
	}
	return out;
}
function snapshotFromParts(input) {
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
		recurrences
	};
}
function deriveFromTransactions(transactions) {
	const cats = /* @__PURE__ */ new Map();
	for (const tx of transactions) {
		if (cats.has(tx.category)) continue;
		const legacy = LEGACY_CATEGORIES[tx.category];
		cats.set(tx.category, {
			id: tx.category,
			label: legacy?.label ?? tx.category,
			type: legacy?.type ?? tx.type,
			color: legacy?.color ?? "#6a7380"
		});
	}
	return {
		categories: [...cats.values()],
		payees: uniquePayees(transactions.map((t) => ({
			name: t.payee,
			type: t.type,
			category: t.category
		})))
	};
}
function readBudgets(raw) {
	if (!Array.isArray(raw)) return [];
	return uniqueBudgets(raw.filter(isBudget)).slice(0, 100);
}
function readRecurrences(raw) {
	if (!Array.isArray(raw)) return [];
	return raw.filter(isRecurring).slice(0, 200);
}
function asSnapshot(raw) {
	if (!raw || typeof raw !== "object") return null;
	const o = raw;
	if (o.v !== 2 || typeof o.updatedAt !== "number" || !Array.isArray(o.transactions)) return null;
	if (typeof o.range !== "string" || !RANGE_SET.has(o.range)) return null;
	if (!Array.isArray(o.categories) || !Array.isArray(o.payees)) return null;
	if (o.transactions.length > 5e3 || !o.transactions.every(isTx)) return null;
	if (o.categories.length > 100 || !o.categories.every(isCategory)) return null;
	if (o.payees.length > 500) return null;
	if (Array.isArray(o.products) && o.products.length > 500) return null;
	const recurrences = readRecurrences(o.recurrences);
	return snapshotFromParts({
		range: o.range,
		transactions: o.transactions,
		categories: o.categories,
		payees: o.payees,
		products: o.products,
		budgets: readBudgets(o.budgets),
		recurrences,
		updatedAt: o.updatedAt
	});
}
function readLocalSnapshot() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return asSnapshot(JSON.parse(raw));
	} catch {
		return null;
	}
}
function writeLocalSnapshot(snap) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
		return true;
	} catch {
		return false;
	}
}
async function readIdbSnapshot() {
	try {
		const db = await openDb();
		return await new Promise((resolve, reject) => {
			const req = db.transaction(IDB_STORE, "readonly").objectStore(IDB_STORE).get(STORAGE_KEY);
			req.onsuccess = () => resolve(asSnapshot(req.result));
			req.onerror = () => reject(req.error);
		});
	} catch {
		return null;
	}
}
async function writeIdbSnapshot(snap) {
	try {
		const db = await openDb();
		await new Promise((resolve, reject) => {
			const tx = db.transaction(IDB_STORE, "readwrite");
			tx.objectStore(IDB_STORE).put(snap, STORAGE_KEY);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} catch {}
}
function pickNewest(a, b) {
	if (a && b) return a.updatedAt >= b.updatedAt ? a : b;
	return a ?? b;
}
function persistSnapshot(snap) {
	const ok = writeLocalSnapshot(snap);
	writeIdbSnapshot(snap);
	return ok;
}
async function loadSnapshot() {
	const local = readLocalSnapshot();
	if (typeof indexedDB === "undefined") return local;
	return pickNewest(local, await withTimeout(readIdbSnapshot(), IDB_TIMEOUT_MS));
}
async function parseImport(raw) {
	const { importSchema } = await import("./schema-ZgIqmu52.mjs");
	const parsed = importSchema.safeParse(raw);
	if (!parsed.success) throw new Error("That file is not a Ledger backup.");
	const data = parsed.data;
	if (Array.isArray(data)) {
		const derived = deriveFromTransactions(data);
		return snapshotFromParts({
			range: "30d",
			transactions: data,
			categories: derived.categories,
			payees: derived.payees
		});
	}
	if ("v" in data && data.v === 2) return snapshotFromParts({
		...data,
		budgets: readBudgets("budgets" in data ? data.budgets : []),
		recurrences: readRecurrences("recurrences" in data ? data.recurrences : [])
	});
	const transactions = "transactions" in data ? data.transactions : [];
	const derived = deriveFromTransactions(transactions);
	return snapshotFromParts({
		range: "range" in data && data.range ? data.range : "30d",
		transactions,
		categories: derived.categories,
		payees: derived.payees,
		updatedAt: "updatedAt" in data && typeof data.updatedAt === "number" ? data.updatedAt : Date.now()
	});
}
function downloadBackup(snap) {
	const blob = new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	const now = /* @__PURE__ */ new Date();
	const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
	a.href = url;
	a.download = `ledger-${stamp}.json`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
function readFileAsJson(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read file."));
		reader.onload = () => {
			try {
				resolve(JSON.parse(String(reader.result)));
			} catch {
				reject(/* @__PURE__ */ new Error("That file is not valid JSON."));
			}
		};
		reader.readAsText(file);
	});
}
var FREQ_LABELS = {
	weekly: "Weekly",
	monthly: "Monthly",
	yearly: "Yearly"
};
function advanceDate(iso, frequency) {
	const d = parseISO(`${iso}T00:00:00`);
	const next = frequency === "weekly" ? addWeeks(d, 1) : frequency === "yearly" ? addYears(d, 1) : addMonths(d, 1);
	return format(next, "yyyy-MM-dd");
}
function planDue(bill, today, max = 24) {
	const dates = [];
	let cursor = bill.nextDate;
	let guard = 0;
	while (cursor <= today && guard < max) {
		dates.push(cursor);
		cursor = advanceDate(cursor, bill.frequency);
		guard += 1;
	}
	return {
		dates,
		nextDate: cursor
	};
}
function splitRecurrences(rows, today) {
	const due = [];
	const upcoming = [];
	const paused = [];
	for (const row of rows) if (row.paused) paused.push(row);
	else if (row.nextDate <= today) due.push(row);
	else upcoming.push(row);
	const byDate = (a, b) => a.nextDate.localeCompare(b.nextDate) || a.payee.localeCompare(b.payee);
	due.sort(byDate);
	upcoming.sort(byDate);
	paused.sort(byDate);
	return {
		due,
		upcoming,
		paused
	};
}
function snapshotFrom(state) {
	return snapshotFromParts(state);
}
function commit(patch) {
	const current = useLedger.getState();
	const next = {
		transactions: patch.transactions ?? current.transactions,
		categories: patch.categories ?? current.categories,
		payees: patch.payees ?? current.payees,
		products: patch.products ?? current.products,
		range: patch.range ?? current.range,
		budgets: patch.budgets ?? current.budgets,
		recurrences: patch.recurrences ?? current.recurrences
	};
	const snap = snapshotFrom(next);
	const persistOk = persistSnapshot(snap);
	useLedger.setState({
		...next,
		payees: snap.payees,
		products: snap.products,
		budgets: snap.budgets,
		recurrences: snap.recurrences,
		savedAt: snap.updatedAt,
		persistOk
	});
}
function applySnapshot(snap, persistOk = true) {
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
		persistOk
	});
}
function todayIso(override) {
	return override ?? isoDate(/* @__PURE__ */ new Date());
}
function withPayee(list, name, type, category) {
	const cleaned = normalizeLabel(name);
	if (!cleaned || !category) return list;
	if (findPayee(list, cleaned, type, category)) return list;
	const loose = list.find((p) => p.type === type && labelsEqual(p.name, cleaned) && p.category === "");
	if (loose) return list.map((p) => p === loose ? {
		...p,
		category
	} : p);
	return [...list, {
		name: cleaned,
		type,
		category
	}];
}
function withProduct(list, name, category, type) {
	if (type !== "income") return list;
	const cleaned = normalizeLabel(name ?? "");
	if (!cleaned || !category) return list;
	if (findProduct(list, cleaned, category)) return list;
	const loose = list.find((p) => labelsEqual(p.name, cleaned) && p.category === "");
	if (loose) return list.map((p) => p === loose ? {
		...p,
		category
	} : p);
	return [...list, {
		name: cleaned,
		category
	}];
}
function postBills(bills, ids, today, force) {
	const current = useLedger.getState();
	const recurrences = bills.map((r) => ({ ...r }));
	const transactions = [];
	let payees = current.payees;
	const posted = [];
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
				note: row.note
			});
			posted.push({
				payee: row.payee,
				amount: row.amount,
				date
			});
		}
		row.nextDate = nextDate;
		payees = withPayee(payees, row.payee, row.type, row.category);
	}
	return {
		recurrences,
		transactions,
		payees,
		posted
	};
}
var useLedger = create((_set, get) => ({
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
	hydrate: async () => {
		if (get().hydrated) return [];
		try {
			const local = readLocalSnapshot();
			if (local) applySnapshot(local);
			else {
				const snap = emptySnapshot();
				applySnapshot(snap, persistSnapshot(snap));
			}
			const newest = await loadSnapshot();
			if (newest && newest.updatedAt > (get().savedAt ?? 0)) {
				applySnapshot(newest);
				persistSnapshot(newest);
			}
			return get().postDueRecurrences();
		} catch {
			applySnapshot(emptySnapshot(), false);
			return [];
		}
	},
	setRange: (range) => commit({ range }),
	addTransaction: (input) => {
		const row = {
			...input,
			id: crypto.randomUUID()
		};
		commit({
			transactions: [row, ...get().transactions],
			payees: withPayee(get().payees, row.payee, row.type, row.category),
			products: withProduct(get().products, row.product, row.category, row.type)
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
		const row = {
			id: crypto.randomUUID(),
			label: cleaned,
			type,
			color: nextColor(current)
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
		commit({ categories: current.map((c) => c.id === id ? {
			...c,
			label: cleaned
		} : c) });
		return true;
	},
	deleteCategory: (id) => {
		commit({
			categories: get().categories.filter((c) => c.id !== id),
			payees: get().payees.filter((p) => p.category !== id),
			products: get().products.filter((p) => p.category !== id),
			budgets: get().budgets.filter((b) => b.category !== id),
			recurrences: get().recurrences.filter((r) => r.category !== id)
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
			payees: current.map((p) => p === source ? {
				...p,
				name: cleaned
			} : p),
			transactions: get().transactions.map((t) => t.type === type && t.category === category && t.payee === source.name ? {
				...t,
				payee: cleaned
			} : t),
			recurrences: get().recurrences.map((r) => r.type === type && r.category === category && r.payee === source.name ? {
				...r,
				payee: cleaned
			} : r)
		});
		return true;
	},
	deletePayee: (name, type, category) => {
		const existing = findPayee(get().payees, name, type, category);
		if (!existing) return;
		commit({ payees: get().payees.filter((p) => p !== existing) });
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
			products: current.map((p) => p === source ? {
				...p,
				name: cleaned
			} : p),
			transactions: get().transactions.map((t) => t.type === "income" && t.category === category && t.product && labelsEqual(t.product, source.name) ? {
				...t,
				product: cleaned
			} : t)
		});
		return true;
	},
	deleteProduct: (name, category) => {
		const existing = findProduct(get().products, name, category);
		if (!existing) return;
		commit({ products: get().products.filter((p) => p !== existing) });
	},
	addBudget: ({ category, monthly }) => {
		if (!Number.isFinite(monthly) || monthly <= 0) return null;
		const cat = findCategory(get().categories, category);
		if (!cat || cat.type !== "expense") return null;
		if (get().budgets.some((b) => b.category === category)) return null;
		const row = {
			id: crypto.randomUUID(),
			category,
			monthly
		};
		commit({ budgets: [...get().budgets, row] });
		return row;
	},
	updateBudget: (id, monthly) => {
		if (!Number.isFinite(monthly) || monthly <= 0) return false;
		const current = get().budgets;
		if (!current.some((b) => b.id === id)) return false;
		commit({ budgets: current.map((b) => b.id === id ? {
			...b,
			monthly
		} : b) });
		return true;
	},
	deleteBudget: (id) => {
		commit({ budgets: get().budgets.filter((b) => b.id !== id) });
	},
	addRecurrence: (input) => {
		const row = {
			...input,
			id: crypto.randomUUID()
		};
		commit({
			recurrences: [...get().recurrences, row],
			payees: withPayee(get().payees, row.payee, row.type, row.category)
		});
		return {
			row,
			posted: !row.paused && row.autoPost ? get().postDueRecurrences() : []
		};
	},
	updateRecurrence: (id, patch) => {
		const current = get().recurrences;
		if (!current.some((r) => r.id === id)) return false;
		const recurrences = current.map((r) => r.id === id ? {
			...r,
			...patch
		} : r);
		const next = recurrences.find((r) => r.id === id);
		commit({
			recurrences,
			payees: next ? withPayee(get().payees, next.payee, next.type, next.category) : get().payees
		});
		return true;
	},
	deleteRecurrence: (id) => {
		commit({ recurrences: get().recurrences.filter((r) => r.id !== id) });
	},
	toggleRecurrencePaused: (id) => {
		const current = get().recurrences;
		commit({ recurrences: current.map((r) => r.id === id ? {
			...r,
			paused: !r.paused
		} : r) });
	},
	postRecurrence: (id, today) => {
		const result = postBills(get().recurrences, /* @__PURE__ */ new Set([id]), todayIso(today), true);
		if (result.posted.length === 0) return [];
		commit({
			recurrences: result.recurrences,
			transactions: [...result.transactions, ...get().transactions],
			payees: result.payees
		});
		return result.posted;
	},
	skipRecurrence: (id) => {
		const current = get().recurrences;
		if (!current.find((r) => r.id === id)) return;
		commit({ recurrences: current.map((r) => r.id === id ? {
			...r,
			nextDate: advanceDate(r.nextDate, r.frequency)
		} : r) });
	},
	postDueRecurrences: (today) => {
		const result = postBills(get().recurrences, null, todayIso(today), false);
		if (result.posted.length === 0) return [];
		commit({
			recurrences: result.recurrences,
			transactions: [...result.transactions, ...get().transactions],
			payees: result.payees
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
			range: "30d"
		});
	},
	exportBackup: () => {
		downloadBackup(snapshotFrom(get()));
	},
	importBackup: async (file) => {
		const snap = await parseImport(await readFileAsJson(file));
		commit({
			transactions: snap.transactions,
			categories: snap.categories,
			payees: snap.payees,
			products: snap.products,
			budgets: snap.budgets,
			recurrences: snap.recurrences,
			range: snap.range
		});
	},
	importCsv: async (file) => {
		const incoming = csvToLedger(await file.text());
		const current = get();
		const budgets = current.budgets.flatMap((b) => {
			const old = findCategory(current.categories, b.category);
			if (!old) return [];
			const next = incoming.categories.find((c) => c.type === old.type && labelsEqual(c.label, old.label));
			return next ? [{
				...b,
				category: next.id
			}] : [];
		});
		const recurrences = current.recurrences.flatMap((r) => {
			const old = findCategory(current.categories, r.category);
			if (!old) return [];
			const next = incoming.categories.find((c) => c.type === old.type && labelsEqual(c.label, old.label));
			if (!next) return [];
			return [{
				...r,
				category: next.id,
				payee: findPayee(incoming.payees, r.payee, r.type, next.id)?.name ?? r.payee
			}];
		});
		commit({
			transactions: incoming.transactions,
			categories: incoming.categories,
			payees: incoming.payees,
			products: incoming.products,
			budgets,
			recurrences
		});
		return {
			imported: incoming.transactions.length,
			truncated: incoming.truncated
		};
	}
}));
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,box-shadow,transform,opacity] duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			outline: "border border-border bg-transparent text-foreground hover:bg-accent",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			ghost: "text-foreground hover:bg-accent",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-11 min-h-11 px-4",
			sm: "h-9 min-h-9 rounded-md px-3 text-sm",
			lg: "h-12 min-h-12 rounded-lg px-5",
			icon: "size-11 min-h-11 min-w-11",
			"icon-sm": "size-9 min-h-9 min-w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		"data-slot": "input",
		className: cn("flex h-12 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base text-foreground shadow-[var(--shadow-border)] outline-none transition-[box-shadow,border-color] duration-150 placeholder:text-subtle file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 md:h-11 md:text-base", className),
		...props
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DuHhPS9Y.js
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "card",
		className: cn("rounded-2xl bg-card text-card-foreground shadow-[var(--shadow-border)]", className),
		...props
	});
}
function CardHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "card-header",
		className: cn("flex flex-col gap-1 px-4 pt-4 sm:px-5 sm:pt-5", className),
		...props
	});
}
function CardTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		"data-slot": "card-title",
		className: cn("text-sm font-medium tracking-tight text-foreground", className),
		...props
	});
}
function CardContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "card-content",
		className: cn("px-4 pb-4 sm:px-5 sm:pb-5", className),
		...props
	});
}
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-lg bg-muted", className),
		...props
	});
}
function AlertDialog({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2, {
		"data-slot": "alert-dialog",
		...props
	});
}
function AlertDialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
		className: cn("fixed inset-0 z-[80] bg-background/80", className),
		...props
	});
}
function AlertDialogContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Portal2, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		className: cn("fixed top-1/2 left-4 right-4 z-[80] max-w-md -translate-y-1/2 rounded-2xl bg-card p-5 text-card-foreground shadow-[var(--shadow-border)] sm:left-1/2 sm:right-auto sm:w-full sm:-translate-x-1/2", className),
		...props
	})] });
}
function AlertDialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-2", className),
		...props
	});
}
function AlertDialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
function AlertDialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
		className: cn("text-base font-medium", className),
		...props
	});
}
function AlertDialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function AlertDialogAction({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
		className: cn(buttonVariants(), className),
		...props
	});
}
function AlertDialogCancel({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
		className: cn(buttonVariants({ variant: "outline" }), className),
		...props
	});
}
function windowFor(preset, now = /* @__PURE__ */ new Date()) {
	const end = endOfDay(now);
	let start;
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
		case "1y": start = startOfDay(subYears(now, 1));
	}
	const days = differenceInCalendarDays(end, start);
	const priorEnd = endOfDay(subDays(start, 1));
	const priorStart = startOfDay(subDays(priorEnd, days));
	return {
		start,
		end,
		priorStart,
		priorEnd
	};
}
function monthWindow(now = /* @__PURE__ */ new Date()) {
	return {
		start: startOfMonth(now),
		end: endOfMonth(now)
	};
}
function inWindow(tx, start, end) {
	const t = startOfDay(/* @__PURE__ */ new Date(`${tx.date}T00:00:00`)).getTime();
	return t >= startOfDay(start).getTime() && t <= startOfDay(end).getTime();
}
function sums(txs) {
	let income = 0;
	let expenses = 0;
	for (const tx of txs) if (tx.type === "income") income += tx.amount;
	else expenses += tx.amount;
	return {
		income,
		expenses,
		net: income - expenses
	};
}
function change(current, previous) {
	if (previous === 0) return current === 0 ? 0 : null;
	return (current - previous) / Math.abs(previous);
}
function dailySeries(txs, start, end, pick) {
	const days = eachDayOfInterval({
		start: startOfDay(start),
		end: startOfDay(end)
	});
	const byDay = /* @__PURE__ */ new Map();
	for (const tx of txs) byDay.set(tx.date, (byDay.get(tx.date) ?? 0) + pick(tx));
	return days.map((d) => byDay.get(format(d, "yyyy-MM-dd")) ?? 0);
}
function running(values) {
	let acc = 0;
	return values.map((v) => {
		acc += v;
		return acc;
	});
}
function filterFocused(txs, focus) {
	if (!focus) return txs;
	if (focus.kind === "category") return txs.filter((t) => t.category === focus.id);
	return txs.filter((t) => labelsEqual(t.payee, focus.name));
}
function searchTransactions(txs, query, typeFilter, categories) {
	const q = query.trim().toLowerCase();
	return txs.filter((t) => {
		if (typeFilter !== "all" && t.type !== typeFilter) return false;
		if (!q) return true;
		return `${t.payee} ${t.product ?? ""} ${t.note ?? ""} ${categoryLabel(t.category, categories)}`.toLowerCase().includes(q);
	});
}
function kpisFor(txs, range) {
	const currentTxs = txs.filter((t) => inWindow(t, range.start, range.end));
	const priorTxs = txs.filter((t) => inWindow(t, range.priorStart, range.priorEnd));
	const cur = sums(currentTxs);
	const prev = sums(priorTxs);
	const incomeSeries = dailySeries(currentTxs, range.start, range.end, (t) => t.type === "income" ? t.amount : 0);
	const expenseSeries = dailySeries(currentTxs, range.start, range.end, (t) => t.type === "expense" ? t.amount : 0);
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
			series: running(netSeries)
		},
		income: {
			current: cur.income,
			previous: prev.income,
			change: priorEmpty ? null : change(cur.income, prev.income),
			series: running(incomeSeries)
		},
		expenses: {
			current: cur.expenses,
			previous: prev.expenses,
			change: priorEmpty ? null : change(cur.expenses, prev.expenses),
			series: running(expenseSeries)
		},
		savingsRate: {
			current: savingsCurrent,
			previous: savingsPrev,
			change: priorEmpty ? null : savingsCurrent - savingsPrev,
			series: savingsSeries
		}
	};
}
function spendMix(txs, range, categories) {
	const current = txs.filter((t) => t.type === "expense" && inWindow(t, range.start, range.end));
	const byCat = /* @__PURE__ */ new Map();
	for (const tx of current) {
		const prev = byCat.get(tx.category) ?? {
			value: 0,
			count: 0,
			type: tx.type
		};
		prev.value += tx.amount;
		prev.count += 1;
		byCat.set(tx.category, prev);
	}
	const total = [...byCat.values()].reduce((s, v) => s + v.value, 0);
	return [...byCat.entries()].map(([category, v]) => ({
		category,
		label: categoryLabel(category, categories),
		value: v.value,
		count: v.count,
		share: total === 0 ? 0 : v.value / total,
		color: categoryColor(category, categories),
		type: findCategory(categories, category)?.type ?? v.type
	})).sort((a, b) => b.value - a.value);
}
function payeeColor(name) {
	let hash = 0;
	for (let i = 0; i < name.length; i++) hash = hash * 31 + name.charCodeAt(i) >>> 0;
	return STEEL_COLORS[hash % STEEL_COLORS.length];
}
function incomePayeeMix(txs, range) {
	const current = txs.filter((t) => t.type === "income" && inWindow(t, range.start, range.end));
	const byPayee = /* @__PURE__ */ new Map();
	for (const tx of current) {
		const label = normalizeLabel(tx.payee) || "Unknown";
		const key = label.toLowerCase();
		const prev = byPayee.get(key) ?? {
			label,
			value: 0,
			count: 0
		};
		prev.value += tx.amount;
		prev.count += 1;
		byPayee.set(key, prev);
	}
	const total = [...byPayee.values()].reduce((s, v) => s + v.value, 0);
	return [...byPayee.values()].map((v) => ({
		payee: v.label,
		label: v.label,
		value: v.value,
		count: v.count,
		share: total === 0 ? 0 : v.value / total,
		color: payeeColor(v.label)
	})).sort((a, b) => b.value - a.value);
}
function categoryRows(txs, range, categories) {
	const current = txs.filter((t) => inWindow(t, range.start, range.end));
	const byCat = /* @__PURE__ */ new Map();
	for (const tx of current) {
		const prev = byCat.get(tx.category) ?? {
			value: 0,
			count: 0,
			type: tx.type
		};
		prev.value += tx.amount;
		prev.count += 1;
		byCat.set(tx.category, prev);
	}
	const total = [...byCat.values()].reduce((s, v) => s + v.value, 0) || 1;
	return [...byCat.entries()].map(([category, v]) => ({
		category,
		label: categoryLabel(category, categories),
		value: v.value,
		count: v.count,
		share: v.value / total,
		color: categoryColor(category, categories),
		type: findCategory(categories, category)?.type ?? v.type
	})).sort((a, b) => b.value - a.value);
}
function budgetProgress(budgets, txs, categories, now = /* @__PURE__ */ new Date()) {
	const { start, end } = monthWindow(now);
	return budgets.map((b) => {
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
			ratio: b.monthly <= 0 ? 0 : spent / b.monthly
		};
	}).sort((a, b) => b.ratio - a.ratio || a.label.localeCompare(b.label));
}
function balanceSeries(txs, range, focused) {
	const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
	const startIso = format(range.start, "yyyy-MM-dd");
	const endIso = format(range.end, "yyyy-MM-dd");
	let bal = 0;
	if (!focused) {
		for (const tx of sorted) if (tx.date < startIso) bal += signedAmount(tx.type, tx.amount);
	}
	const delta = /* @__PURE__ */ new Map();
	for (const tx of sorted) {
		if (tx.date < startIso || tx.date > endIso) continue;
		delta.set(tx.date, (delta.get(tx.date) ?? 0) + signedAmount(tx.type, tx.amount));
	}
	const days = eachDayOfInterval({
		start: startOfDay(range.start),
		end: startOfDay(range.end)
	});
	const span = days.length;
	return days.map((d) => {
		const iso = format(d, "yyyy-MM-dd");
		bal += delta.get(iso) ?? 0;
		return {
			date: iso,
			label: span <= 40 ? format(d, "d MMM") : span <= 120 ? format(d, "d MMM") : format(d, "MMM"),
			balance: bal
		};
	});
}
function iterateBuckets(start, end, step) {
	const out = [];
	if (step === "day") {
		for (const d of eachDayOfInterval({
			start: startOfDay(start),
			end: startOfDay(end)
		})) out.push({
			start: d,
			end: d,
			label: format(d, "d MMM"),
			key: format(d, "yyyy-MM-dd")
		});
		return out;
	}
	if (step === "week") {
		let cursor = startOfWeek(start, { weekStartsOn: 1 });
		if (cursor < start) cursor = addWeeks(cursor, 1);
		if (cursor > start) cursor = startOfWeek(start, { weekStartsOn: 1 });
		while (cursor <= end) {
			const bucketEnd = addDays(addWeeks(cursor, 1), -1);
			out.push({
				start: cursor,
				end: bucketEnd > end ? end : bucketEnd,
				label: format(cursor, "d MMM"),
				key: format(cursor, "yyyy-MM-dd")
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
			key: format(cursor, "yyyy-MM")
		});
		cursor = addMonths(cursor, 1);
	}
	return out;
}
function incomeExpenseBars(txs, range, preset) {
	const step = preset === "7d" || preset === "30d" ? "day" : preset === "90d" ? "week" : "month";
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
		return {
			key: b.key,
			label: b.label,
			income,
			expense
		};
	});
}
var RANGE_LABELS = {
	"7d": "7D",
	"30d": "30D",
	"90d": "90D",
	"6m": "6M",
	"1y": "1Y"
};
function DropdownMenu({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2$1, {
		"data-slot": "dropdown-menu",
		...props
	});
}
function DropdownMenuTrigger({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		"data-slot": "dropdown-menu-trigger",
		...props
	});
}
function DropdownMenuContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2$1, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$1, {
		sideOffset,
		className: cn("z-50 min-w-48 overflow-hidden rounded-xl bg-popover p-1 text-popover-foreground shadow-[var(--shadow-border)]", className),
		...props
	}) });
}
function DropdownMenuItem({ className, variant = "default", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
		className: cn("relative flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm outline-none select-none focus:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:size-4", variant === "destructive" && "text-expense focus:bg-expense/10", className),
		...props
	});
}
function DropdownMenuSeparator({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
		className: cn("-mx-1 my-1 h-px bg-border", className),
		...props
	});
}
function DropdownMenuLabel({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
		className: cn("px-3 py-2 text-xs font-medium text-muted-foreground", className),
		...props
	});
}
function BudgetPanel({ rows, month, focus, onFocus, onManage }) {
	const visible = focus ? rows.filter((r) => r.category === focus) : rows;
	const spent = visible.reduce((s, r) => s + r.spent, 0);
	const cap = visible.reduce((s, r) => s + r.monthly, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "stagger-in min-w-0",
		style: { animationDelay: "140ms" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Budgets" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs text-muted-foreground",
					children: formatMonthLabel(month)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "sm",
				onClick: onManage,
				children: "Manage"
			})]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "pt-1",
			children: [rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-start gap-3 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Set a monthly cap on an expense category. Spent this month is tracked against it."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					onClick: onManage,
					children: "Add budget"
				})]
			}) : visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-6 text-center text-sm text-muted-foreground",
				children: "No budget on the focused category."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col",
				children: visible.map((row) => {
					const over = row.remaining < 0;
					const width = Math.min(Math.max(row.ratio * 100, row.spent > 0 ? 2 : 0), 100);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onFocus(row.category),
						className: cn("flex min-h-14 w-full flex-col justify-center gap-1.5 rounded-lg px-2 py-2 text-left transition-colors duration-150 hover:bg-accent", focus === row.category && "bg-accent"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex min-w-0 items-center gap-2 truncate text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "size-2 shrink-0 rounded-full",
									style: { background: row.color }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: row.label
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-xs tabular-nums text-foreground",
								children: [formatRon(row.spent), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-subtle",
									children: [" / ", formatRon(row.monthly)]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-1.5 flex-1 overflow-hidden rounded-full bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn("h-full rounded-full", over ? "bg-expense" : "bg-primary"),
									style: { width: `${width}%` }
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("w-12 text-right font-mono text-xs tabular-nums", over ? "text-expense" : "text-subtle"),
								children: [(row.ratio * 100).toFixed(0), "%"]
							})]
						})]
					}) }, row.id);
				})
			}), visible.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 font-mono text-xs tabular-nums text-muted-foreground",
				children: [
					formatRon(spent),
					" of ",
					formatRon(cap),
					" this month"
				]
			}) : null]
		})]
	});
}
function CategoryTable({ rows, focus, onFocus, onManage }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "stagger-in min-w-0",
		style: { animationDelay: "280ms" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Categories" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "sm",
				onClick: onManage,
				children: "Manage"
			})]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "pt-1",
			children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-6 text-center text-sm text-muted-foreground",
				children: "Nothing in this range. Add a category, then log a transaction."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col",
				children: rows.map((row) => {
					const max = rows[0]?.value || 1;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onFocus(row.category),
						className: cn("flex min-h-14 w-full flex-col justify-center gap-1.5 rounded-lg px-2 py-2 text-left transition-colors duration-150 hover:bg-accent", focus === row.category && "bg-accent"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex min-w-0 items-center gap-2 truncate text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "size-2 shrink-0 rounded-full",
									style: { background: row.color }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: row.label
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("font-mono text-xs tabular-nums", row.type === "income" ? "text-income" : "text-foreground"),
								children: [row.type === "income" ? "+" : "", formatRon(row.value)]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-1.5 flex-1 overflow-hidden rounded-full bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full bg-primary",
									style: { width: `${Math.max(row.value / max * 100, 2)}%` }
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "w-8 text-right font-mono text-xs tabular-nums text-subtle",
								children: [(row.share * 100).toFixed(0), "%"]
							})]
						})]
					}) }, row.category);
				})
			})
		})]
	});
}
function DateRange({ value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "tablist",
		"aria-label": "Date range",
		className: "flex rounded-xl bg-muted p-1",
		children: RANGE_PRESETS.map((preset) => {
			const active = preset === value;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				role: "tab",
				"aria-selected": active,
				onClick: () => onChange(preset),
				className: cn("h-9 min-h-9 min-w-11 flex-1 rounded-lg px-2.5 font-mono text-xs font-medium transition-[color,background-color,box-shadow] duration-150", active ? "bg-card text-foreground shadow-[var(--shadow-border)]" : "text-muted-foreground hover:text-foreground"),
				children: RANGE_LABELS[preset]
			}, preset);
		})
	});
}
function Sparkline({ values, className }) {
	if (values.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("h-9", className) });
	const min = Math.min(...values);
	const span = Math.max(...values) - min || 1;
	const w = 120;
	const h = 36;
	const line = values.map((v, i) => {
		return [i / (values.length - 1) * w, 33 - (v - min) / span * 30];
	}).map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
	const area = `${line} L${w} ${h} L0 ${h} Z`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${w} ${h}`,
		className: cn("h-9 w-full text-primary", className),
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: area,
			fill: "currentColor",
			opacity: .12
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: line,
			fill: "none",
			stroke: "currentColor",
			strokeWidth: 1.5
		})]
	});
}
function Delta({ value, invert, unit = "pct" }) {
	if (value === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-subtle",
		children: "vs prior period"
	});
	const Icon = value === 0 ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-0.5 font-mono text-xs tabular-nums", value === 0 ? "text-muted-foreground" : (invert ? value < 0 : value > 0) ? "text-income" : "text-expense"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }),
			unit === "pts" ? formatPts(value) : formatPct(value),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-1 font-sans text-subtle",
				children: "vs prior"
			})
		]
	});
}
function KpiCard({ label, value, display, invert, delay, unit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "stagger-in rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5",
		style: { animationDelay: `${delay}ms` },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-wide text-muted-foreground uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-xl tracking-tight text-foreground tabular-nums sm:text-2xl",
				children: display
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
					value: value.change,
					invert,
					unit
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, { values: value.series })
			})
		]
	});
}
function KpiGrid({ net, income, expenses, savingsRate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
				label: "Net cashflow",
				value: net,
				display: formatRonSigned(net.current),
				delay: 0
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
				label: "Income",
				value: income,
				display: formatRon(income.current),
				delay: 40
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
				label: "Expenses",
				value: expenses,
				display: formatRon(expenses.current),
				invert: true,
				delay: 80
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
				label: "Savings rate",
				value: savingsRate,
				display: income.current <= 0 && savingsRate.current === 0 ? "—" : formatPct(savingsRate.current),
				delay: 120,
				unit: "pts"
			})
		]
	});
}
function RowMeta({ bill, categories }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "truncate text-xs text-muted-foreground",
		children: [
			categoryLabel(bill.category, categories),
			" · ",
			FREQ_LABELS[bill.frequency]
		]
	});
}
function RecurringPanel({ due, upcoming, paused, categories, onManage, onPost, onSkip }) {
	const empty = due.length + upcoming.length + paused.length === 0;
	const rest = [...upcoming, ...paused].slice(0, 6);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "stagger-in min-w-0",
		style: { animationDelay: "180ms" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Recurring" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs text-muted-foreground",
					children: due.length > 0 ? `${due.length} due` : upcoming.length > 0 ? `Next ${formatDayYear(upcoming[0].nextDate)}` : "Salary, rent, bills"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "sm",
				onClick: onManage,
				children: "Manage"
			})]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "pt-1",
			children: empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-start gap-3 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Save a repeating income or bill. Ledger can post it when the date arrives, or wait for you to tap Post."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					onClick: onManage,
					children: "Add recurring"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "flex flex-col gap-1",
				children: [due.map((bill) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg bg-muted px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm",
								children: bill.payee
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowMeta, {
								bill,
								categories
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("shrink-0 font-mono text-xs tabular-nums", bill.type === "income" ? "text-income" : "text-foreground"),
							children: [bill.type === "income" ? "+" : "−", formatRon(bill.amount)]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							className: "h-9 min-h-9 flex-1",
							onClick: () => onPost(bill.id),
							children: "Post"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: "outline",
							className: "h-9 min-h-9 flex-1",
							onClick: () => onSkip(bill.id),
							children: "Skip"
						})]
					})]
				}, bill.id)), rest.map((bill) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex min-h-11 items-center justify-between gap-3 rounded-lg px-2 py-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-sm",
							children: [bill.payee, bill.paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-xs text-subtle",
								children: "Paused"
							}) : null]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: [
								formatDayYear(bill.nextDate),
								" · ",
								FREQ_LABELS[bill.frequency]
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("shrink-0 font-mono text-xs tabular-nums", bill.type === "income" ? "text-income" : "text-foreground"),
						children: [bill.type === "income" ? "+" : "−", formatRon(bill.amount)]
					})]
				}, bill.id))]
			})
		})]
	});
}
var TYPE_FILTERS = [
	{
		id: "all",
		label: "All"
	},
	{
		id: "income",
		label: "In"
	},
	{
		id: "expense",
		label: "Out"
	}
];
function TransactionsTable({ transactions, categories, onDelete, emptyHint, onExportCsv, onImportCsv, canExport }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [typeFilter, setTypeFilter] = (0, import_react.useState)("all");
	const [pending, setPending] = (0, import_react.useState)(null);
	const rows = (0, import_react.useMemo)(() => searchTransactions(transactions, query, typeFilter, categories), [
		transactions,
		query,
		typeFilter,
		categories
	]);
	const noSource = transactions.length === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "stagger-in min-w-0",
		style: { animationDelay: "320ms" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Transactions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							onImportCsv ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "ghost",
								size: "sm",
								onClick: onImportCsv,
								"aria-label": "Import CSV",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, {}), "Import"]
							}) : null,
							onExportCsv ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "ghost",
								size: "sm",
								onClick: onExportCsv,
								disabled: !canExport,
								"aria-label": "Export CSV",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, {}), "CSV"]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs tabular-nums text-subtle",
								children: rows.length
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: "Search payee, product, note, category",
							className: "pl-9",
							"aria-label": "Search transactions"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex rounded-xl bg-muted p-1",
						children: TYPE_FILTERS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setTypeFilter(f.id),
							className: cn("h-9 min-h-9 min-w-11 flex-1 rounded-lg px-3 text-xs font-medium transition-colors duration-150 sm:flex-none", typeFilter === f.id ? "bg-card text-foreground shadow-[var(--shadow-border)]" : "text-muted-foreground hover:text-foreground"),
							children: f.label
						}, f.id))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "pt-1",
				children: [rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-6 text-center text-sm text-muted-foreground",
					children: noSource ? emptyHint ?? "No transactions yet." : "No matching transactions."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: rows.slice(0, 80).map((tx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm",
									children: tx.payee
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: cn("shrink-0 font-mono text-sm tabular-nums", tx.type === "income" ? "text-income" : "text-foreground"),
									children: formatRonSigned(tx.type === "income" ? tx.amount : -tx.amount)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-0.5 truncate text-xs text-muted-foreground",
								children: [
									categoryLabel(tx.category, categories),
									tx.type === "income" && tx.product ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										" ",
										"· ",
										tx.quantity != null ? `${tx.quantity} × ` : "",
										tx.product
									] }) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-subtle",
										children: [" · ", formatDayYear(tx.date)]
									}),
									tx.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-subtle",
										children: [" · ", tx.note]
									}) : null
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon-sm",
							"aria-label": `Delete ${tx.payee}`,
							onClick: () => setPending(tx),
							className: "shrink-0 text-subtle hover:text-expense",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
						})]
					}, tx.id))
				}), rows.length > 80 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "pt-3 text-center text-xs text-subtle",
					children: [
						"Showing 80 of ",
						rows.length,
						". Narrow the search to see the rest."
					]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: pending !== null,
				onOpenChange: (o) => !o && setPending(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete transaction?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: pending ? `${pending.payee} · ${categoryLabel(pending.category, categories)} will be removed from this device.` : null })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: () => {
						if (pending) onDelete(pending.id);
						setPending(null);
					},
					children: "Delete"
				})] })] })
			})
		]
	});
}
var AddTransaction = (0, import_react.lazy)(() => import("./add-transaction-BFM-yK5B.mjs").then((m) => ({ default: m.AddTransaction })));
var ManageCategories = (0, import_react.lazy)(() => import("./manage-categories-JLpN9rvl.mjs").then((m) => ({ default: m.ManageCategories })));
var ManagePayees = (0, import_react.lazy)(() => import("./manage-payees-D31tGR1u.mjs").then((m) => ({ default: m.ManagePayees })));
var ManageProducts = (0, import_react.lazy)(() => import("./manage-products-CMF_1yYZ.mjs").then((m) => ({ default: m.ManageProducts })));
var ManageBudgets = (0, import_react.lazy)(() => import("./manage-budgets-Vfwv2p2h.mjs").then((m) => ({ default: m.ManageBudgets })));
var ManageRecurring = (0, import_react.lazy)(() => import("./manage-recurring-REsAe-fR.mjs").then((m) => ({ default: m.ManageRecurring })));
var BalanceChart = (0, import_react.lazy)(() => import("./balance-chart-DB2EIeay.mjs").then((m) => ({ default: m.BalanceChart })));
var SpendMix = (0, import_react.lazy)(() => import("./spend-mix-CW2WJJc4.mjs").then((m) => ({ default: m.SpendMix })));
var IncomeMix = (0, import_react.lazy)(() => import("./income-mix-C75g34B1.mjs").then((m) => ({ default: m.IncomeMix })));
var IncomeExpense = (0, import_react.lazy)(() => import("./income-expense-CpTzGucD.mjs").then((m) => ({ default: m.IncomeExpense })));
function LogoMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 24 24",
		className: "size-6 text-primary",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "3",
				y: "14",
				width: "4",
				height: "7",
				rx: "1",
				fill: "currentColor",
				opacity: "0.55"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "10",
				y: "8",
				width: "4",
				height: "13",
				rx: "1",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "17",
				y: "4",
				width: "4",
				height: "17",
				rx: "1",
				fill: "currentColor",
				opacity: "0.7"
			})
		]
	});
}
function ChartFallback({ className = "h-80" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: `rounded-2xl ${className}` });
}
function EmptyPanel({ title, message, delay }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "stagger-in min-w-0",
		style: { animationDelay: delay },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: title }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-10 text-center text-sm text-muted-foreground",
			children: message
		}) })]
	});
}
function Dashboard({ nowIso }) {
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
	const [focus, setFocus] = (0, import_react.useState)(null);
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const [catsOpen, setCatsOpen] = (0, import_react.useState)(false);
	const [payeesOpen, setPayeesOpen] = (0, import_react.useState)(false);
	const [productsOpen, setProductsOpen] = (0, import_react.useState)(false);
	const [budgetsOpen, setBudgetsOpen] = (0, import_react.useState)(false);
	const [recurringOpen, setRecurringOpen] = (0, import_react.useState)(false);
	const [clearOpen, setClearOpen] = (0, import_react.useState)(false);
	const [csvConfirm, setCsvConfirm] = (0, import_react.useState)(null);
	const fileRef = (0, import_react.useRef)(null);
	const csvRef = (0, import_react.useRef)(null);
	const csvFileRef = (0, import_react.useRef)(null);
	(0, import_react.useLayoutEffect)(() => {
		(async () => {
			const posted = await hydrate();
			if (posted.length === 1) toast.success(`Posted ${posted[0].payee}`);
			else if (posted.length > 1) toast.success(`Posted ${posted.length} recurring items`);
		})();
	}, [hydrate]);
	(0, import_react.useEffect)(() => {
		if (!("serviceWorker" in navigator)) return;
		const boot = () => {
			navigator.serviceWorker.register("/sw.js").catch(() => void 0);
		};
		if (document.readyState === "complete") boot();
		else window.addEventListener("load", boot, { once: true });
	}, []);
	(0, import_react.useEffect)(() => {
		if (focus?.kind === "category" && !categories.some((c) => c.id === focus.id)) setFocus(null);
		if (focus?.kind === "payee" && !payees.some((p) => labelsEqual(p.name, focus.name)) && !transactions.some((t) => labelsEqual(t.payee, focus.name))) setFocus(null);
	}, [
		focus,
		categories,
		payees,
		transactions
	]);
	const model = (0, import_react.useMemo)(() => {
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
			recurring: splitRecurrences(recurrences, isoDate(now))
		};
	}, [
		transactions,
		range,
		focus,
		categories,
		budgets,
		recurrences,
		nowIso
	]);
	const categoryFocus = focus?.kind === "category" ? focus.id : null;
	const payeeFocus = focus?.kind === "payee" ? focus.name : null;
	function toggleFocus(id) {
		setFocus((prev) => prev?.kind === "category" && prev.id === id ? null : {
			kind: "category",
			id
		});
	}
	function togglePayee(name) {
		setFocus((prev) => prev?.kind === "payee" && labelsEqual(prev.name, name) ? null : {
			kind: "payee",
			name
		});
	}
	async function onImport(file) {
		try {
			await importBackup(file);
			toast.success("Backup restored");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Import failed");
		}
	}
	async function applyCsv(file) {
		try {
			const result = await importCsv(file);
			const extra = result.truncated ? " First 5000 rows used." : "";
			toast.success(`Loaded ${result.imported} transactions from spreadsheet.${extra}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "CSV import failed");
		}
	}
	async function onPickCsv(file) {
		try {
			const preview = await readCsvFile(file);
			if (transactions.length === 0) {
				await applyCsv(file);
				return;
			}
			csvFileRef.current = file;
			setCsvConfirm({
				count: preview.transactions.length,
				truncated: preview.truncated
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "CSV import failed");
		}
	}
	async function onExportCsv() {
		const result = await exportTransactionsCsv(transactions, categories);
		if (result === "empty") toast.error("No transactions to export");
		else if (result === "shared") toast.success("Share the CSV — open in Numbers");
		else if (result === "downloaded") toast.success("CSV downloaded — open in Numbers");
	}
	const isEmpty = transactions.length === 0;
	const hasAny = !isEmpty || categories.length > 0 || payees.length > 0 || products.length > 0 || budgets.length > 0 || recurrences.length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background pb-32 text-foreground md:pb-10",
		"data-hydrated": hydrated ? "true" : "false",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-30 border-b border-border bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold tracking-widest uppercase",
									children: "Ledger"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "flex items-center gap-1 text-xs text-subtle",
									children: persistOk ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }), "Saved on this device"] }) : "Storage blocked — download a backup"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "ml-auto hidden min-w-0 flex-1 justify-center md:flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-full max-w-md",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateRange, {
									value: range,
									onChange: setRange
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex items-center gap-1 md:ml-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									size: "sm",
									className: "hidden md:inline-flex",
									onClick: () => setAddOpen(true),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), "Add"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "ghost",
										size: "icon",
										"aria-label": "More",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {})
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
									align: "end",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, { children: "Lists" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: () => setCatsOpen(true),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {}), "Categories"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: () => setPayeesOpen(true),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {}), "Payees"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: () => setProductsOpen(true),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, {}), "Products"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: () => setBudgetsOpen(true),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, {}), "Budgets"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: () => setRecurringOpen(true),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, {}), "Recurring"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: () => {
												window.location.assign("/?install=1&platform=ios");
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {}), "Add to iPhone"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, { children: "Data" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: () => {
												onExportCsv();
											},
											disabled: isEmpty,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, {}), "Export CSV"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: () => csvRef.current?.click(),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, {}), "Import CSV"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: () => {
												exportBackup();
												toast.success("Backup downloaded");
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Download backup"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: () => fileRef.current?.click(),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {}), "Import backup"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
											variant: "destructive",
											onSelect: () => setClearOpen(true),
											disabled: !hasAny,
											children: "Clear all data"
										})
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileRef,
									type: "file",
									accept: "application/json,.json",
									className: "sr-only",
									onChange: (e) => {
										const file = e.target.files?.[0];
										e.target.value = "";
										if (file) onImport(file);
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: csvRef,
									type: "file",
									accept: ".csv,text/csv,text/plain,text/comma-separated-values",
									className: "sr-only",
									onChange: (e) => {
										const file = e.target.files?.[0];
										e.target.value = "";
										if (file) onPickCsv(file);
									}
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-border px-4 py-2 md:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateRange, {
						value: range,
						onChange: setRange
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6",
				children: [
					isEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "stagger-in rounded-2xl bg-card px-5 py-6 shadow-[var(--shadow-border)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Your ledger is empty"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Add categories, payees, and products, set monthly budgets, then log a transaction or a repeating bill — or load a spreadsheet. Everything stays on this device in RON."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										size: "sm",
										variant: "outline",
										onClick: () => setCatsOpen(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {}), "Categories"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										size: "sm",
										variant: "outline",
										onClick: () => setPayeesOpen(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {}), "Payees"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										size: "sm",
										variant: "outline",
										onClick: () => setProductsOpen(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, {}), "Products"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										size: "sm",
										variant: "outline",
										onClick: () => setBudgetsOpen(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, {}), "Budgets"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										size: "sm",
										variant: "outline",
										onClick: () => setRecurringOpen(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, {}), "Recurring"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										size: "sm",
										variant: "outline",
										onClick: () => csvRef.current?.click(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, {}), "Import CSV"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										size: "sm",
										variant: "outline",
										onClick: () => window.location.assign("/?install=1&platform=ios"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {}), "Add to iPhone"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										size: "sm",
										onClick: () => setAddOpen(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), "Add transaction"]
									})
								]
							})
						]
					}) : null,
					focus ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex min-w-0 items-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setFocus(null),
							className: "inline-flex h-9 min-h-9 max-w-full items-center gap-2 rounded-full border border-border bg-card px-3 text-xs text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 truncate",
								children: ["Focus: ", focus.kind === "category" ? categoryLabel(focus.id, categories) : focus.name]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 text-subtle",
								children: "Clear"
							})]
						})
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiGrid, {
						net: model.kpis.net,
						income: model.kpis.income,
						expenses: model.kpis.expenses,
						savingsRate: model.kpis.savingsRate
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid min-w-0 gap-4 lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetPanel, {
							rows: model.budgets,
							month: model.now,
							focus: categoryFocus,
							onFocus: toggleFocus,
							onManage: () => setBudgetsOpen(true)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecurringPanel, {
							due: model.recurring.due,
							upcoming: model.recurring.upcoming,
							paused: model.recurring.paused,
							categories,
							onManage: () => setRecurringOpen(true),
							onPost: (id) => {
								const posted = postRecurrence(id);
								toast.success(posted.length === 1 ? `Posted ${posted[0].payee}` : posted.length > 1 ? `Posted ${posted.length} items` : "Nothing due");
							},
							onSkip: (id) => {
								skipRecurrence(id);
								toast.success("Skipped this period");
							}
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid min-w-0 gap-4 lg:grid-cols-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 lg:col-span-2",
							children: isEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
								title: "Balance trend",
								message: "No balance yet. Log a transaction to start the trend.",
								delay: "160ms"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
								fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartFallback, {}),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BalanceChart, {
									data: model.balance,
									focused: Boolean(focus)
								})
							})
						}), isEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
							title: "Spend mix",
							message: "No expenses in this range. Add an expense to see the mix.",
							delay: "200ms"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
							fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartFallback, { className: "h-80" }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpendMix, {
								data: model.mix,
								focus: categoryFocus,
								onFocus: toggleFocus
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid min-w-0 gap-4 lg:grid-cols-3",
						children: [isEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
							title: "Income by payee",
							message: "No income in this range. Add income to see who paid you.",
							delay: "220ms"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
							fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartFallback, { className: "h-80" }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IncomeMix, {
								data: model.incomeMix,
								focus: payeeFocus,
								onFocus: togglePayee
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 lg:col-span-2",
							children: isEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
								title: "Income vs expenses",
								message: "No income or expenses in this range.",
								delay: "240ms"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
								fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartFallback, {}),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IncomeExpense, { data: model.bars })
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid min-w-0 gap-4 lg:grid-cols-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 lg:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryTable, {
								rows: model.cats,
								focus: categoryFocus,
								onFocus: toggleFocus,
								onManage: () => setCatsOpen(true)
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 lg:col-span-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransactionsTable, {
								transactions: model.table,
								categories,
								emptyHint: "No transactions yet.",
								canExport: !isEmpty,
								onExportCsv: () => {
									onExportCsv();
								},
								onImportCsv: () => csvRef.current?.click(),
								onDelete: (id) => {
									deleteTransaction(id);
									toast.success("Transaction deleted");
								}
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background p-3 safe-bottom md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					className: "w-full",
					onClick: () => setAddOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), "Add transaction"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
				fallback: null,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddTransaction, {
					open: addOpen,
					onOpenChange: setAddOpen,
					defaultDate: isoDate(new Date(nowIso)),
					onSubmit: (input) => {
						addTransaction(input);
						toast.success("Transaction saved");
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Suspense, {
				fallback: null,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManageCategories, {
						open: catsOpen,
						onOpenChange: setCatsOpen
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManagePayees, {
						open: payeesOpen,
						onOpenChange: setPayeesOpen
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManageProducts, {
						open: productsOpen,
						onOpenChange: setProductsOpen
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManageBudgets, {
						open: budgetsOpen,
						onOpenChange: setBudgetsOpen
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManageRecurring, {
						open: recurringOpen,
						onOpenChange: setRecurringOpen,
						defaultDate: isoDate(new Date(nowIso))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: clearOpen,
				onOpenChange: setClearOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Clear all data?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "This removes every transaction, category, payee, product, budget, and recurring bill stored on this device. Download a backup first if you want to keep your numbers." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: () => {
						clearAll();
						setFocus(null);
						toast.success("Ledger cleared");
					},
					children: "Clear"
				})] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: csvConfirm !== null,
				onOpenChange: (open) => {
					if (!open) {
						setCsvConfirm(null);
						csvFileRef.current = null;
					}
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Load this spreadsheet?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
					"Ledger will show only the ",
					csvConfirm?.count ?? 0,
					" transactions from the file. Current transactions are replaced — like swapping a disc.",
					csvConfirm?.truncated ? " Only the first 5000 rows will be used." : ""
				] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: () => {
						const file = csvFileRef.current;
						csvFileRef.current = null;
						setCsvConfirm(null);
						if (file) applyCsv(file);
					},
					children: "Load spreadsheet"
				})] })] })
			})
		]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	const { nowIso } = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, { nowIso });
}
//#endregion
export { formatDayYear as A, productNames as C, RANGE_PRESETS as D, FREQUENCIES as E, isoDate as M, parseAmount as N, cn as O, payeesFor as S, useLedger as T, Input as _, AlertDialogContent as a, normalizeLabel as b, AlertDialogHeader as c, Card as d, CardContent as f, FREQ_LABELS as g, Button as h, AlertDialogCancel as i, formatRon as j, formatAxis as k, AlertDialogTitle as l, CardTitle as m, AlertDialog as n, AlertDialogDescription as o, CardHeader as p, AlertDialogAction as r, AlertDialogFooter as s, routes_exports as t, Skeleton as u, categoriesFor as v, productsFor as w, payeeNames as x, labelsEqual as y };
