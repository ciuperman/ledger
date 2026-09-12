import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as DrawerHeader, n as DrawerContent, o as DrawerTitle, r as DrawerDescription, t as Drawer$1 } from "./drawer-BHmLbExC.mjs";
import { t as Label } from "./label-D9jqqRMg.mjs";
import { a as Trash2, f as Pencil, u as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { N as parseAmount, O as cn, T as useLedger, _ as Input, a as AlertDialogContent, c as AlertDialogHeader, h as Button, i as AlertDialogCancel, j as formatRon, l as AlertDialogTitle, n as AlertDialog, o as AlertDialogDescription, r as AlertDialogAction, s as AlertDialogFooter, v as categoriesFor } from "./routes-DuHhPS9Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/manage-budgets-Vfwv2p2h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ManageBudgets({ open, onOpenChange }) {
	const categories = useLedger((s) => s.categories);
	const budgets = useLedger((s) => s.budgets);
	const addBudget = useLedger((s) => s.addBudget);
	const updateBudget = useLedger((s) => s.updateBudget);
	const deleteBudget = useLedger((s) => s.deleteBudget);
	const expenseCats = (0, import_react.useMemo)(() => categoriesFor(categories, "expense"), [categories]);
	const used = (0, import_react.useMemo)(() => new Set(budgets.map((b) => b.category)), [budgets]);
	const available = expenseCats.filter((c) => !used.has(c.id));
	const [category, setCategory] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [editValue, setEditValue] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(null);
	function resetAdd() {
		setCategory("");
		setAmount("");
	}
	function add() {
		const monthly = parseAmount(amount);
		if (!monthly) {
			toast.error("Enter an amount greater than zero.");
			return;
		}
		if (!category) {
			toast.error("Pick an expense category.");
			return;
		}
		if (!addBudget({
			category,
			monthly
		})) {
			toast.error("That category already has a budget.");
			return;
		}
		resetAdd();
		toast.success("Budget saved");
	}
	function saveEdit(id) {
		const monthly = parseAmount(editValue);
		if (!monthly) {
			setEditing(null);
			return;
		}
		if (!updateBudget(id, monthly)) {
			toast.error("Enter an amount greater than zero.");
			return;
		}
		setEditing(null);
		toast.success("Budget updated");
	}
	const pendingRow = pending ? budgets.find((b) => b.id === pending) : null;
	const pendingLabel = pendingRow && expenseCats.find((c) => c.id === pendingRow.category)?.label;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer$1, {
		open,
		onOpenChange: (next) => {
			onOpenChange(next);
			if (!next) {
				resetAdd();
				setEditing(null);
			}
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerTitle, { children: "Budgets" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerDescription, { children: "Monthly caps for expense categories, in RON. Progress is this calendar month." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-6",
			children: [
				expenseCats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Add an expense category first, then set a cap on it."
				}) : null,
				budgets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No budgets yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-1",
					children: budgets.map((row) => {
						const cat = expenseCats.find((c) => c.id === row.category);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex min-h-11 items-center gap-2 rounded-lg bg-muted px-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "size-2.5 shrink-0 rounded-full",
									style: { background: cat?.color }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 flex-1 truncate text-sm",
									children: cat?.label ?? "Uncategorized"
								}),
								editing === row.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: editValue,
									onChange: (e) => setEditValue(e.target.value),
									inputMode: "decimal",
									autoFocus: true,
									className: "h-9 min-h-9 w-28 bg-background font-mono",
									onKeyDown: (e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											saveEdit(row.id);
										}
										if (e.key === "Escape") setEditing(null);
									},
									onBlur: () => saveEdit(row.id)
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs tabular-nums text-muted-foreground",
									children: formatRon(row.monthly)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									size: "icon-sm",
									"aria-label": `Edit ${cat?.label ?? "budget"}`,
									onClick: () => {
										setEditing(row.id);
										setEditValue(String(row.monthly));
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									size: "icon-sm",
									"aria-label": `Delete ${cat?.label ?? "budget"}`,
									className: "text-subtle hover:text-expense",
									onClick: () => setPending(row.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
								})
							]
						}, row.id);
					})
				}),
				available.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-wide text-muted-foreground uppercase",
							children: "New budget"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Category" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: available.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setCategory(c.id),
								className: cn("h-9 min-h-9 rounded-full border px-3 text-xs font-medium transition-colors duration-150", category === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-transparent text-muted-foreground hover:text-foreground"),
								children: c.label
							}, c.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2 pt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: amount,
								onChange: (e) => setAmount(e.target.value),
								inputMode: "decimal",
								placeholder: "Monthly cap",
								className: "h-10 min-h-10 font-mono",
								onKeyDown: (e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										add();
									}
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								size: "sm",
								variant: "outline",
								onClick: add,
								className: "shrink-0",
								"aria-label": "Add budget",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), "Add"]
							})]
						})
					]
				}) : expenseCats.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Every expense category already has a budget."
				}) : null
			]
		})] })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open: pending !== null,
		onOpenChange: (o) => !o && setPending(null),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Remove this budget?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: pendingLabel ? `The monthly cap for ${pendingLabel} will be removed. Transactions stay.` : "This monthly cap will be removed." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
			className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			onClick: () => {
				if (pending) deleteBudget(pending);
				setPending(null);
				toast.success("Budget removed");
			},
			children: "Remove"
		})] })] })
	})] });
}
//#endregion
export { ManageBudgets };
