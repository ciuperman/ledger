import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as Trash2, b as ChevronDown, u as Plus, x as Check } from "../_libs/lucide-react.mjs";
import { O as cn, _ as Input, b as normalizeLabel, h as Button, y as labelsEqual } from "./routes-DuHhPS9Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payee-picker-KBa3BmSX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PayeePicker({ payees, value, onChange, onAdd, onDelete, noun = "payee", selectPlaceholder = "Select a payee" }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const filtered = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		if (!q) return payees;
		return payees.filter((p) => p.toLowerCase().includes(q));
	}, [payees, query]);
	const canAdd = (0, import_react.useMemo)(() => {
		const cleaned = normalizeLabel(query);
		if (!cleaned) return false;
		return !payees.some((p) => labelsEqual(p, cleaned));
	}, [payees, query]);
	function select(name) {
		onChange(name);
		setQuery("");
		setError(null);
		setOpen(false);
	}
	function add() {
		const added = onAdd(query);
		if (!added) {
			setError("Enter a name.");
			return;
		}
		select(added);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => {
					setOpen((v) => !v);
					setError(null);
				},
				className: cn("flex h-11 min-h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-left text-sm shadow-[var(--shadow-border)] outline-none transition-[box-shadow,border-color] duration-150 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40", value ? "text-foreground" : "text-subtle"),
				"aria-expanded": open,
				"aria-haspopup": "listbox",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: value || selectPlaceholder
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 shrink-0 text-subtle" })]
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-hidden rounded-xl bg-muted shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 p-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: query,
						onChange: (e) => {
							setQuery(e.target.value);
							setError(null);
						},
						placeholder: payees.length ? "Search or add" : `Type a ${noun} name`,
						autoComplete: "off",
						className: "h-10 min-h-10 bg-background",
						onKeyDown: (e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								if (filtered.length === 1 && !canAdd) select(filtered[0]);
								else if (canAdd) add();
							}
							if (e.key === "Escape") setOpen(false);
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						variant: canAdd ? "default" : "outline",
						disabled: !normalizeLabel(query),
						onClick: add,
						className: "shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), "Add"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "max-h-48 overflow-y-auto px-1 pb-2",
					role: "listbox",
					children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-3 py-3 text-sm text-muted-foreground",
						children: payees.length === 0 ? `No ${noun}s yet. Type a name and tap Add.` : canAdd ? `Add “${normalizeLabel(query)}” to your list.` : `No matching ${noun}.`
					}) : filtered.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							role: "option",
							"aria-selected": value === name,
							onClick: () => select(name),
							className: cn("flex min-h-11 min-w-0 flex-1 items-center justify-between rounded-lg px-3 text-left text-sm transition-colors duration-150 hover:bg-accent", value === name && "bg-accent"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: name
							}), value === name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 shrink-0 text-foreground" }) : null]
						}), onDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							className: "shrink-0 text-expense",
							"aria-label": `Delete ${name}`,
							onClick: (e) => {
								e.preventDefault();
								e.stopPropagation();
								onDelete(name);
								if (value === name) onChange("");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), "Delete"]
						}) : null]
					}, name))
				})]
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-expense",
				children: error
			}) : null
		]
	});
}
//#endregion
export { PayeePicker as t };
