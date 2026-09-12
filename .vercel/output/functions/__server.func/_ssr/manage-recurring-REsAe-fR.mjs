import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as DrawerHeader, i as DrawerFooter, n as DrawerContent, o as DrawerTitle, r as DrawerDescription, t as Drawer$1 } from "./drawer-BHmLbExC.mjs";
import { t as Label } from "./label-D9jqqRMg.mjs";
import { a as Trash2, d as Play, f as Pencil, p as Pause, u as Plus } from "../_libs/lucide-react.mjs";
import { t as PayeePicker } from "./payee-picker-KBa3BmSX.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as formatDayYear, E as FREQUENCIES, N as parseAmount, O as cn, T as useLedger, _ as Input, a as AlertDialogContent, c as AlertDialogHeader, g as FREQ_LABELS, h as Button, i as AlertDialogCancel, j as formatRon, l as AlertDialogTitle, n as AlertDialog, o as AlertDialogDescription, r as AlertDialogAction, s as AlertDialogFooter, v as categoriesFor, x as payeeNames, y as labelsEqual } from "./routes-DuHhPS9Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/manage-recurring-REsAe-fR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function emptyDraft(date) {
	return {
		type: "expense",
		amount: "",
		category: "",
		payee: "",
		note: "",
		frequency: "monthly",
		nextDate: date,
		autoPost: true
	};
}
function fromBill(bill) {
	return {
		type: bill.type,
		amount: String(bill.amount),
		category: bill.category,
		payee: bill.payee,
		note: bill.note ?? "",
		frequency: bill.frequency,
		nextDate: bill.nextDate,
		autoPost: bill.autoPost
	};
}
function Toggle({ checked, onChange, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		role: "switch",
		"aria-checked": checked,
		onClick: () => onChange(!checked),
		className: "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg bg-muted px-3 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("relative h-6 w-10 shrink-0 rounded-full transition-colors duration-150", checked ? "bg-primary" : "bg-border"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute top-0.5 size-5 rounded-full bg-background transition-transform duration-150", checked ? "translate-x-4" : "translate-x-0.5") })
		})]
	});
}
function ManageRecurring({ open, onOpenChange, defaultDate }) {
	const categories = useLedger((s) => s.categories);
	const payees = useLedger((s) => s.payees);
	const recurrences = useLedger((s) => s.recurrences);
	const addPayee = useLedger((s) => s.addPayee);
	const deletePayee = useLedger((s) => s.deletePayee);
	const addRecurrence = useLedger((s) => s.addRecurrence);
	const updateRecurrence = useLedger((s) => s.updateRecurrence);
	const deleteRecurrence = useLedger((s) => s.deleteRecurrence);
	const toggleRecurrencePaused = useLedger((s) => s.toggleRecurrencePaused);
	const [mode, setMode] = (0, import_react.useState)("list");
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [draft, setDraft] = (0, import_react.useState)(() => emptyDraft(defaultDate));
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(null);
	const cats = (0, import_react.useMemo)(() => categoriesFor(categories, draft.type), [categories, draft.type]);
	function reset() {
		setMode("list");
		setEditingId(null);
		setDraft(emptyDraft(defaultDate));
		setError(null);
	}
	function startNew() {
		setEditingId(null);
		setDraft(emptyDraft(defaultDate));
		setError(null);
		setMode("form");
	}
	function startEdit(bill) {
		setEditingId(bill.id);
		setDraft(fromBill(bill));
		setError(null);
		setMode("form");
	}
	function submit() {
		const amount = parseAmount(draft.amount);
		if (!amount) {
			setError("Enter an amount greater than zero.");
			return;
		}
		if (!draft.payee.trim()) {
			setError("Pick a payee from your list.");
			return;
		}
		if (!draft.category) {
			setError("Pick a category.");
			return;
		}
		if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.nextDate)) {
			setError("Pick a valid next date.");
			return;
		}
		const payload = {
			type: draft.type,
			amount,
			category: draft.category,
			payee: draft.payee.trim(),
			note: draft.note.trim() || void 0,
			frequency: draft.frequency,
			nextDate: draft.nextDate,
			autoPost: draft.autoPost,
			paused: false
		};
		if (editingId) {
			const existing = recurrences.find((r) => r.id === editingId);
			updateRecurrence(editingId, {
				...payload,
				paused: existing?.paused ?? false
			});
			toast.success("Recurring bill updated");
		} else {
			const { posted } = addRecurrence(payload);
			toast.success(posted.length ? `Saved and posted ${payload.payee}` : "Recurring bill saved");
		}
		reset();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer$1, {
		open,
		onOpenChange: (next) => {
			onOpenChange(next);
			if (!next) reset();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerTitle, { children: mode === "form" ? editingId ? "Edit recurring" : "New recurring" : "Recurring" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerDescription, { children: mode === "form" ? "Repeats until you pause or delete it." : "Salary, rent, and other repeating rows." })] }), mode === "list" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-6",
			children: [recurrences.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Nothing repeating yet. Add income or a bill, pick how often, and choose whether Ledger posts it automatically."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-1",
				children: recurrences.map((bill) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex min-h-14 items-center gap-2 rounded-lg bg-muted px-2 py-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
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
									FREQ_LABELS[bill.frequency],
									" ·",
									" ",
									bill.autoPost ? "Auto" : "Manual"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("shrink-0 font-mono text-xs tabular-nums", bill.type === "income" ? "text-income" : "text-foreground"),
							children: formatRon(bill.amount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon-sm",
							"aria-label": bill.paused ? `Resume ${bill.payee}` : `Pause ${bill.payee}`,
							onClick: () => toggleRecurrencePaused(bill.id),
							children: bill.paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon-sm",
							"aria-label": `Edit ${bill.payee}`,
							onClick: () => startEdit(bill),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon-sm",
							"aria-label": `Delete ${bill.payee}`,
							className: "text-subtle hover:text-expense",
							onClick: () => setPending(bill),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
						})
					]
				}, bill.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				onClick: startNew,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), "Add recurring"]
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
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
						onClick: () => setDraft((d) => ({
							...d,
							type,
							category: categoriesFor(categories, type).some((c) => c.id === d.category) ? d.category : "",
							payee: ""
						})),
						className: cn("h-11 min-h-11 flex-1 rounded-lg text-sm font-medium capitalize transition-colors duration-150", draft.type === type ? "bg-card text-foreground shadow-[var(--shadow-border)]" : "text-muted-foreground"),
						children: type
					}, type))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "rec-amount",
						children: "Amount (RON)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "rec-amount",
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Category" }), cats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Add a ",
							draft.type,
							" category first."
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: cats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setDraft((d) => {
								const names = payeeNames(payees, d.type, c.id);
								return {
									...d,
									category: c.id,
									payee: names.some((n) => labelsEqual(n, d.payee)) ? d.payee : ""
								};
							}),
							className: cn("h-9 min-h-9 rounded-full border px-3 text-xs font-medium transition-colors duration-150", draft.category === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-transparent text-muted-foreground hover:text-foreground"),
							children: c.label
						}, c.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Payee" }), draft.category ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayeePicker, {
						payees: payeeNames(payees, draft.type, draft.category),
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Repeats" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: FREQUENCIES.map((freq) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setDraft((d) => ({
								...d,
								frequency: freq
							})),
							className: cn("h-9 min-h-9 rounded-full border px-3 text-xs font-medium transition-colors duration-150", draft.frequency === freq ? "border-primary bg-primary text-primary-foreground" : "border-border bg-transparent text-muted-foreground hover:text-foreground"),
							children: FREQ_LABELS[freq]
						}, freq))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "rec-next",
						children: "Next date"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "rec-next",
						type: "date",
						value: draft.nextDate,
						onChange: (e) => setDraft((d) => ({
							...d,
							nextDate: e.target.value
						}))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					checked: draft.autoPost,
					onChange: (autoPost) => setDraft((d) => ({
						...d,
						autoPost
					})),
					label: "Post automatically when due"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "rec-note",
						children: "Note"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "rec-note",
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
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			onClick: submit,
			children: editingId ? "Save changes" : "Save recurring"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			onClick: reset,
			children: "Back"
		})] })] })] })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open: pending !== null,
		onOpenChange: (o) => !o && setPending(null),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
			"Delete ",
			pending?.payee,
			"?"
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "Future repeats stop. Transactions already posted stay in the ledger." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
			className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			onClick: () => {
				if (pending) deleteRecurrence(pending.id);
				setPending(null);
				toast.success("Recurring bill deleted");
			},
			children: "Delete"
		})] })] })
	})] });
}
//#endregion
export { ManageRecurring };
