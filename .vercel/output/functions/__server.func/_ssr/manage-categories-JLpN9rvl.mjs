import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as DrawerHeader, n as DrawerContent, o as DrawerTitle, r as DrawerDescription, t as Drawer$1 } from "./drawer-BHmLbExC.mjs";
import { a as Trash2, f as Pencil, u as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { T as useLedger, _ as Input, b as normalizeLabel, h as Button, v as categoriesFor } from "./routes-DuHhPS9Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/manage-categories-JLpN9rvl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CategorySection({ title, type, rows, onAskDelete }) {
	const addCategory = useLedger((s) => s.addCategory);
	const updateCategory = useLedger((s) => s.updateCategory);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [editValue, setEditValue] = (0, import_react.useState)("");
	function add() {
		const cleaned = normalizeLabel(draft);
		if (!cleaned) return;
		if (!addCategory({
			label: cleaned,
			type
		})) {
			toast.error("Use a unique name.");
			return;
		}
		setDraft("");
		toast.success("Category added");
	}
	function saveEdit(id) {
		const cleaned = normalizeLabel(editValue);
		if (!cleaned) {
			setEditing(null);
			return;
		}
		if (!updateCategory(id, cleaned)) {
			toast.error("That name is already used.");
			return;
		}
		setEditing(null);
		toast.success("Category renamed");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-wide text-muted-foreground uppercase",
				children: title
			}),
			rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "None yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-1",
				children: rows.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex min-h-11 items-center gap-2 rounded-lg bg-muted px-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2.5 shrink-0 rounded-full",
							style: { background: cat.color }
						}),
						editing === cat.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: editValue,
							onChange: (e) => setEditValue(e.target.value),
							maxLength: 40,
							autoFocus: true,
							className: "h-9 min-h-9 bg-background",
							onKeyDown: (e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									saveEdit(cat.id);
								}
								if (e.key === "Escape") setEditing(null);
							},
							onBlur: () => saveEdit(cat.id)
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate text-sm",
							children: cat.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon-sm",
							"aria-label": `Rename ${cat.label}`,
							onClick: () => {
								setEditing(cat.id);
								setEditValue(cat.label);
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon-sm",
							"aria-label": `Delete ${cat.label}`,
							className: "text-expense hover:text-expense",
							onClick: () => onAskDelete(cat),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
						})
					]
				}, cat.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					placeholder: `New ${type} category`,
					maxLength: 40,
					className: "h-10 min-h-10",
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
					"aria-label": `Add ${type} category`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), "Add"]
				})]
			})
		]
	});
}
function ManageCategories({ open, onOpenChange }) {
	const categories = useLedger((s) => s.categories);
	const transactions = useLedger((s) => s.transactions);
	const budgets = useLedger((s) => s.budgets);
	const recurrences = useLedger((s) => s.recurrences);
	const deleteCategory = useLedger((s) => s.deleteCategory);
	const income = (0, import_react.useMemo)(() => categoriesFor(categories, "income"), [categories]);
	const expense = (0, import_react.useMemo)(() => categoriesFor(categories, "expense"), [categories]);
	const [pending, setPending] = (0, import_react.useState)(null);
	const used = pending ? transactions.filter((t) => t.category === pending.id).length : 0;
	const usedBills = pending ? recurrences.filter((r) => r.category === pending.id).length : 0;
	const usedBudget = pending ? budgets.some((b) => b.category === pending.id) : false;
	const deleteCopy = (() => {
		const bits = [];
		if (used > 0) bits.push(`${used} transaction${used === 1 ? "" : "s"} will stay, marked uncategorized.`);
		if (usedBills > 0) bits.push(`${usedBills} recurring bill${usedBills === 1 ? "" : "s"} using this category will be deleted.`);
		if (usedBudget) bits.push("Its monthly budget will be removed.");
		if (bits.length === 0) return "This category will be removed from this device.";
		return bits.join(" ");
	})();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer$1, {
		open,
		onOpenChange: (next) => {
			if (!next) setPending(null);
			onOpenChange(next);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerTitle, { children: "Categories" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerDescription, { children: "Add, rename, or remove income and expense categories." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pb-6",
			children: [
				pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-muted p-4",
					"data-vaul-no-drag": true,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium",
							children: [
								"Delete ",
								pending.label,
								"?"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: deleteCopy
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								className: "flex-1",
								onClick: () => setPending(null),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "destructive",
								className: "flex-1",
								onClick: () => {
									deleteCategory(pending.id);
									setPending(null);
									toast.success("Category deleted");
								},
								children: "Delete"
							})]
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategorySection, {
					title: "Income",
					type: "income",
					rows: income,
					onAskDelete: setPending
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategorySection, {
					title: "Expenses",
					type: "expense",
					rows: expense,
					onAskDelete: setPending
				})
			]
		})] })
	});
}
//#endregion
export { ManageCategories };
