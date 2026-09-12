import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as DrawerHeader, n as DrawerContent, o as DrawerTitle, r as DrawerDescription, t as Drawer$1 } from "./drawer-BHmLbExC.mjs";
import { a as Trash2, f as Pencil, u as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { S as payeesFor, T as useLedger, _ as Input, b as normalizeLabel, h as Button, v as categoriesFor } from "./routes-DuHhPS9Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/manage-payees-D31tGR1u.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PayeeSection({ title, type, category, rows, onAskDelete }) {
	const addPayee = useLedger((s) => s.addPayee);
	const renamePayee = useLedger((s) => s.renamePayee);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [editValue, setEditValue] = (0, import_react.useState)("");
	function add() {
		const cleaned = normalizeLabel(draft);
		if (!cleaned) return;
		const existing = rows.some((p) => p.name.toLowerCase() === cleaned.toLowerCase());
		if (!addPayee(cleaned, type, category)) {
			toast.error("Enter a payee name.");
			return;
		}
		setDraft("");
		toast.success(existing ? "Already in this list" : "Payee added");
	}
	function saveEdit(from) {
		const cleaned = normalizeLabel(editValue);
		if (!cleaned || cleaned === from) {
			setEditing(null);
			return;
		}
		if (!renamePayee(from, cleaned, type, category)) {
			toast.error("That payee already exists.");
			return;
		}
		setEditing(null);
		toast.success("Payee renamed");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-2",
		"data-vaul-no-drag": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-wide text-muted-foreground uppercase",
				children: title
			}),
			rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "None yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-col gap-2 rounded-xl bg-muted p-3",
					children: [editing === row.name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: editValue,
						onChange: (e) => setEditValue(e.target.value),
						maxLength: 80,
						autoFocus: true,
						className: "h-11 min-h-11 bg-background",
						onKeyDown: (e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								saveEdit(row.name);
							}
							if (e.key === "Escape") setEditing(null);
						}
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: row.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							onClick: () => {
								if (editing === row.name) {
									saveEdit(row.name);
									return;
								}
								setEditing(row.name);
								setEditValue(row.name);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {}), editing === row.name ? "Save" : "Edit"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "destructive",
							size: "sm",
							onClick: () => onAskDelete(row),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), "Delete"]
						})]
					})]
				}, `${row.type}:${row.category}:${row.name}`))
			}),
			category ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					placeholder: type === "income" ? "Employer, client…" : "Shop, landlord…",
					maxLength: 80,
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
					"aria-label": `Add ${title} payee`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), "Add"]
				})]
			}) : null
		]
	});
}
function TypeBlock({ title, type, onAskDelete }) {
	const categories = useLedger((s) => s.categories);
	const payees = useLedger((s) => s.payees);
	const cats = (0, import_react.useMemo)(() => categoriesFor(categories, type), [categories, type]);
	const loose = (0, import_react.useMemo)(() => payeesFor(payees, type).filter((p) => !p.category), [payees, type]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: title
			}),
			cats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"Add ",
					type,
					" categories first, then payees for each."
				]
			}) : cats.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayeeSection, {
				title: cat.label,
				type,
				category: cat.id,
				rows: payeesFor(payees, type, cat.id).filter((p) => p.category === cat.id),
				onAskDelete
			}, cat.id)),
			loose.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayeeSection, {
				title: "Unassigned",
				type,
				category: "",
				rows: loose,
				onAskDelete
			}) : null
		]
	});
}
function ManagePayees({ open, onOpenChange }) {
	const transactions = useLedger((s) => s.transactions);
	const deletePayee = useLedger((s) => s.deletePayee);
	const [pending, setPending] = (0, import_react.useState)(null);
	const used = pending ? transactions.filter((t) => t.type === pending.type && t.payee === pending.name && (pending.category ? t.category === pending.category : true)).length : 0;
	function confirmRemove() {
		if (!pending) return;
		deletePayee(pending.name, pending.type, pending.category);
		toast.success("Payee removed");
		setPending(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer$1, {
		open,
		onOpenChange: (next) => {
			if (!next) setPending(null);
			onOpenChange(next);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerTitle, { children: "Payees" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerDescription, { children: "Each category has its own payee list. Transport shops stay under Transport." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-5 pb-6",
			children: [
				pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-muted p-4",
					"data-vaul-no-drag": true,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium",
							children: [
								"Remove ",
								pending.name,
								"?"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: used > 0 ? `${used} existing transaction${used === 1 ? "" : "s"} keep this name. It just won’t appear in this category’s picklist.` : "This payee will be removed from this category’s picklist."
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
								onClick: confirmRemove,
								children: "Remove"
							})]
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypeBlock, {
					title: "Income",
					type: "income",
					onAskDelete: setPending
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypeBlock, {
					title: "Expenses",
					type: "expense",
					onAskDelete: setPending
				})
			]
		})] })
	});
}
//#endregion
export { ManagePayees };
