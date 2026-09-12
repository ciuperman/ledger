import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as DrawerHeader, i as DrawerFooter, n as DrawerContent, o as DrawerTitle, r as DrawerDescription, t as Drawer$1 } from "./drawer-BHmLbExC.mjs";
import { t as Label } from "./label-D9jqqRMg.mjs";
import { u as Plus } from "../_libs/lucide-react.mjs";
import { t as PayeePicker } from "./payee-picker-KBa3BmSX.mjs";
import { C as productNames, M as isoDate, O as cn, T as useLedger, _ as Input, b as normalizeLabel, h as Button, v as categoriesFor, x as payeeNames, y as labelsEqual } from "./routes-DuHhPS9Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/add-transaction-BFM-yK5B.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function emptyDraft(date) {
	return {
		type: "expense",
		amount: "",
		category: "",
		date,
		payee: "",
		product: "",
		quantity: "1",
		note: ""
	};
}
function AddTransaction({ open, onOpenChange, onSubmit, defaultDate }) {
	const categories = useLedger((s) => s.categories);
	const payees = useLedger((s) => s.payees);
	const products = useLedger((s) => s.products);
	const addCategory = useLedger((s) => s.addCategory);
	const addPayee = useLedger((s) => s.addPayee);
	const deletePayee = useLedger((s) => s.deletePayee);
	const addProduct = useLedger((s) => s.addProduct);
	const deleteProduct = useLedger((s) => s.deleteProduct);
	const today = defaultDate ?? isoDate(/* @__PURE__ */ new Date());
	const [draft, setDraft] = (0, import_react.useState)(() => emptyDraft(today));
	const [error, setError] = (0, import_react.useState)(null);
	const [newCat, setNewCat] = (0, import_react.useState)("");
	const [addingCat, setAddingCat] = (0, import_react.useState)(false);
	const newCatRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!addingCat) return;
		const id = window.setTimeout(() => {
			newCatRef.current?.focus();
			newCatRef.current?.scrollIntoView({
				block: "center",
				behavior: "smooth"
			});
		}, 50);
		return () => window.clearTimeout(id);
	}, [addingCat]);
	const cats = (0, import_react.useMemo)(() => categoriesFor(categories, draft.type), [categories, draft.type]);
	const payeeList = (0, import_react.useMemo)(() => draft.category ? payeeNames(payees, draft.type, draft.category) : [], [
		payees,
		draft.type,
		draft.category
	]);
	const productList = (0, import_react.useMemo)(() => draft.category ? productNames(products, draft.category) : [], [products, draft.category]);
	function reset() {
		setDraft(emptyDraft(today));
		setError(null);
		setNewCat("");
		setAddingCat(false);
	}
	function handleType(type) {
		const nextCats = categoriesFor(categories, type);
		setDraft((d) => ({
			...d,
			type,
			category: nextCats.some((c) => c.id === d.category) ? d.category : "",
			payee: "",
			product: "",
			quantity: type === "income" ? d.quantity || "1" : "1"
		}));
		setAddingCat(nextCats.length === 0);
	}
	function pickCategory(id) {
		const names = payeeNames(payees, draft.type, id);
		const items = productNames(products, id);
		setDraft((d) => ({
			...d,
			category: id,
			payee: names.some((n) => labelsEqual(n, d.payee)) ? d.payee : "",
			product: items.some((n) => labelsEqual(n, d.product)) ? d.product : ""
		}));
	}
	function createCategory() {
		const cleaned = normalizeLabel(newCat);
		if (!cleaned) {
			setError("Name the category.");
			return;
		}
		const existing = cats.find((c) => labelsEqual(c.label, cleaned));
		if (existing) {
			setDraft((d) => ({
				...d,
				category: existing.id
			}));
			setNewCat("");
			setAddingCat(false);
			setError(null);
			return;
		}
		const row = addCategory({
			label: cleaned,
			type: draft.type
		});
		if (!row) {
			setError("Use a unique category name.");
			return;
		}
		setDraft((d) => ({
			...d,
			category: row.id,
			payee: "",
			product: ""
		}));
		setNewCat("");
		setAddingCat(false);
		setError(null);
	}
	function submit() {
		const amount = Number(draft.amount.replace(",", "."));
		if (!Number.isFinite(amount) || amount <= 0) {
			setError("Enter an amount greater than zero.");
			return;
		}
		if (!draft.payee.trim()) {
			setError("Pick a payee from your list.");
			return;
		}
		if (!draft.category) {
			setError("Pick or add a category.");
			return;
		}
		if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) {
			setError("Pick a valid date.");
			return;
		}
		let product;
		let quantity;
		if (draft.type === "income") {
			product = draft.product.trim();
			if (!product) {
				setError("Pick a product from your list.");
				return;
			}
			const qtyRaw = draft.quantity.trim() || "1";
			quantity = Number(qtyRaw.replace(",", "."));
			if (!Number.isFinite(quantity) || quantity <= 0) {
				setError("Enter a quantity greater than zero.");
				return;
			}
		}
		onSubmit({
			type: draft.type,
			amount,
			category: draft.category,
			date: draft.date,
			payee: draft.payee.trim(),
			note: draft.note.trim() || void 0,
			product,
			quantity
		});
		reset();
		onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer$1, {
		open,
		onOpenChange: (next) => {
			onOpenChange(next);
			if (!next) reset();
			if (next) {
				const nextCats = categoriesFor(categories, draft.type);
				setAddingCat(nextCats.length === 0);
			}
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerTitle, { children: "Add transaction" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerDescription, { children: "Saved on this device only." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5",
				onSubmit: (e) => {
					e.preventDefault();
					submit();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex rounded-xl bg-muted p-1",
						children: ["expense", "income"].map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => handleType(type),
							className: cn("h-11 min-h-11 flex-1 rounded-lg text-sm font-medium capitalize transition-colors duration-150", draft.type === type ? "bg-card text-foreground shadow-[var(--shadow-border)]" : "text-muted-foreground"),
							children: type
						}, type))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "amount",
							children: "Amount (RON)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "amount",
							inputMode: "decimal",
							placeholder: "0.00",
							value: draft.amount,
							onChange: (e) => setDraft((d) => ({
								...d,
								amount: e.target.value
							})),
							className: "font-mono tabular-nums",
							autoComplete: "off"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Category" }),
							cats.length === 0 && !addingCat ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted-foreground",
								children: [
									"No ",
									draft.type,
									" categories yet."
								]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-1.5",
								children: [cats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => pickCategory(c.id),
									className: cn("h-9 min-h-9 rounded-full border px-3 text-xs font-medium transition-colors duration-150", draft.category === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-transparent text-muted-foreground hover:text-foreground"),
									children: c.label
								}, c.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setAddingCat(true),
									className: "inline-flex h-9 min-h-9 items-center gap-1 rounded-full border border-dashed border-border px-3 text-xs font-medium text-muted-foreground hover:text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "New"]
								})]
							}),
							addingCat ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2 pt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									ref: newCatRef,
									value: newCat,
									onChange: (e) => setNewCat(e.target.value),
									placeholder: `${draft.type === "income" ? "Salary, freelance…" : "Rent, groceries…"}`,
									maxLength: 40,
									className: "h-12 min-h-12",
									enterKeyHint: "done",
									autoComplete: "off",
									onKeyDown: (e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											createCategory();
										}
										if (e.key === "Escape") setAddingCat(false);
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "sm",
									variant: "outline",
									onClick: createCategory,
									children: "Add"
								})]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Payee" }), draft.category ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayeePicker, {
							payees: payeeList,
							value: draft.payee,
							onChange: (name) => setDraft((d) => ({
								...d,
								payee: name
							})),
							onAdd: (name) => addPayee(name, draft.type, draft.category),
							onDelete: (name) => deletePayee(name, draft.type, draft.category)
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Pick a category first. Payees are per category."
						})]
					}),
					draft.type === "income" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Product" }), draft.category ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayeePicker, {
							payees: productList,
							value: draft.product,
							onChange: (name) => setDraft((d) => ({
								...d,
								product: name
							})),
							onAdd: (name) => addProduct(name, draft.category),
							onDelete: (name) => deleteProduct(name, draft.category),
							noun: "product",
							selectPlaceholder: "Select a product"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Pick a category first. Products are per income category."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "quantity",
							children: "Quantity"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "quantity",
							inputMode: "decimal",
							placeholder: "1",
							value: draft.quantity,
							onChange: (e) => setDraft((d) => ({
								...d,
								quantity: e.target.value
							})),
							className: "font-mono tabular-nums",
							autoComplete: "off"
						})]
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "date",
							children: "Date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "date",
							type: "date",
							value: draft.date,
							onChange: (e) => setDraft((d) => ({
								...d,
								date: e.target.value
							}))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "note",
							children: "Note"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "note",
							placeholder: "Optional",
							value: draft.note,
							onChange: (e) => setDraft((d) => ({
								...d,
								note: e.target.value
							})),
							maxLength: 160
						})]
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-expense",
						children: error
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				onClick: submit,
				children: "Save transaction"
			}) })
		] })
	});
}
//#endregion
export { AddTransaction };
