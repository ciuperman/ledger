import { useMemo, useState } from "react";
import { Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { categoriesFor, labelsEqual, payeeNames } from "@/lib/ledger/categories";
import { formatDayYear, formatRon, parseAmount } from "@/lib/ledger/format";
import { FREQ_LABELS } from "@/lib/ledger/recurrence";
import { useLedger } from "@/lib/ledger/store";
import type { Frequency, RecurringBill, TxType } from "@/lib/ledger/types";
import { FREQUENCIES } from "@/lib/ledger/types";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PayeePicker } from "./payee-picker";

type Draft = {
  type: TxType;
  amount: string;
  category: string;
  payee: string;
  note: string;
  frequency: Frequency;
  nextDate: string;
  autoPost: boolean;
};

function emptyDraft(date: string): Draft {
  return {
    type: "expense",
    amount: "",
    category: "",
    payee: "",
    note: "",
    frequency: "monthly",
    nextDate: date,
    autoPost: true,
  };
}

function fromBill(bill: RecurringBill): Draft {
  return {
    type: bill.type,
    amount: String(bill.amount),
    category: bill.category,
    payee: bill.payee,
    note: bill.note ?? "",
    frequency: bill.frequency,
    nextDate: bill.nextDate,
    autoPost: bill.autoPost,
  };
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg bg-muted px-3 text-sm"
    >
      <span>{label}</span>
      <span
        className={cn(
          "relative h-6 w-10 shrink-0 rounded-full transition-colors duration-150",
          checked ? "bg-primary" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-background transition-transform duration-150",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

export function ManageRecurring({
  open,
  onOpenChange,
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: string;
}) {
  const categories = useLedger((s) => s.categories);
  const payees = useLedger((s) => s.payees);
  const recurrences = useLedger((s) => s.recurrences);
  const addPayee = useLedger((s) => s.addPayee);
  const deletePayee = useLedger((s) => s.deletePayee);
  const addRecurrence = useLedger((s) => s.addRecurrence);
  const updateRecurrence = useLedger((s) => s.updateRecurrence);
  const deleteRecurrence = useLedger((s) => s.deleteRecurrence);
  const toggleRecurrencePaused = useLedger((s) => s.toggleRecurrencePaused);

  const [mode, setMode] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(defaultDate));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<RecurringBill | null>(null);

  const cats = useMemo(
    () => categoriesFor(categories, draft.type),
    [categories, draft.type],
  );

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

  function startEdit(bill: RecurringBill) {
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
      note: draft.note.trim() || undefined,
      frequency: draft.frequency,
      nextDate: draft.nextDate,
      autoPost: draft.autoPost,
      paused: false,
    };
    if (editingId) {
      const existing = recurrences.find((r) => r.id === editingId);
      updateRecurrence(editingId, { ...payload, paused: existing?.paused ?? false });
      toast.success("Recurring bill updated");
    } else {
      const { posted } = addRecurrence(payload);
      toast.success(
        posted.length ? `Saved and posted ${payload.payee}` : "Recurring bill saved",
      );
    }
    reset();
  }

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(next) => {
          onOpenChange(next);
          if (!next) reset();
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{mode === "form" ? (editingId ? "Edit recurring" : "New recurring") : "Recurring"}</DrawerTitle>
            <DrawerDescription>
              {mode === "form"
                ? "Repeats until you pause or delete it."
                : "Salary, rent, and other repeating rows."}
            </DrawerDescription>
          </DrawerHeader>

          {mode === "list" ? (
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-6">
              {recurrences.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing repeating yet. Add income or a bill, pick how often, and choose whether
                  Ledger posts it automatically.
                </p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {recurrences.map((bill) => (
                    <li
                      key={bill.id}
                      className="flex min-h-14 items-center gap-2 rounded-lg bg-muted px-2 py-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">
                          {bill.payee}
                          {bill.paused ? (
                            <span className="ml-2 text-xs text-subtle">Paused</span>
                          ) : null}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatDayYear(bill.nextDate)} · {FREQ_LABELS[bill.frequency]} ·{" "}
                          {bill.autoPost ? "Auto" : "Manual"}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 font-mono text-xs tabular-nums",
                          bill.type === "income" ? "text-income" : "text-foreground",
                        )}
                      >
                        {formatRon(bill.amount)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={bill.paused ? `Resume ${bill.payee}` : `Pause ${bill.payee}`}
                        onClick={() => toggleRecurrencePaused(bill.id)}
                      >
                        {bill.paused ? <Play /> : <Pause />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${bill.payee}`}
                        onClick={() => startEdit(bill)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${bill.payee}`}
                        className="text-subtle hover:text-expense"
                        onClick={() => setPending(bill)}
                      >
                        <Trash2 />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <Button type="button" variant="outline" onClick={startNew}>
                <Plus />
                Add recurring
              </Button>
            </div>
          ) : (
            <>
              <form
                className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <div className="flex rounded-xl bg-muted p-1">
                  {(["expense", "income"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          type,
                          category: categoriesFor(categories, type).some((c) => c.id === d.category)
                            ? d.category
                            : "",
                          payee: "",
                        }))
                      }
                      className={cn(
                        "h-11 min-h-11 flex-1 rounded-lg text-sm font-medium capitalize transition-colors duration-150",
                        draft.type === type
                          ? "bg-card text-foreground shadow-[var(--shadow-border)]"
                          : "text-muted-foreground",
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="rec-amount">Amount (RON)</Label>
                  <Input
                    id="rec-amount"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={draft.amount}
                    onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
                    className="font-mono tabular-nums"
                    autoComplete="off"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label>Category</Label>
                  {cats.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Add a {draft.type} category first.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {cats.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() =>
                            setDraft((d) => {
                              const names = payeeNames(payees, d.type, c.id);
                              return {
                                ...d,
                                category: c.id,
                                payee: names.some((n) => labelsEqual(n, d.payee)) ? d.payee : "",
                              };
                            })
                          }
                          className={cn(
                            "h-9 min-h-9 rounded-full border px-3 text-xs font-medium transition-colors duration-150",
                            draft.category === c.id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-transparent text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-1.5">
                  <Label>Payee</Label>
                  {draft.category ? (
                    <PayeePicker
                      payees={payeeNames(payees, draft.type, draft.category)}
                      value={draft.payee}
                      onChange={(name) => setDraft((d) => ({ ...d, payee: name }))}
                      onAdd={(name) => addPayee(name, draft.type, draft.category)}
                      onDelete={(name) => deletePayee(name, draft.type, draft.category)}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Pick a category first. Payees are per category.</p>
                  )}
                </div>

                <div className="grid gap-1.5">
                  <Label>Repeats</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {FREQUENCIES.map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, frequency: freq }))}
                        className={cn(
                          "h-9 min-h-9 rounded-full border px-3 text-xs font-medium transition-colors duration-150",
                          draft.frequency === freq
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-transparent text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {FREQ_LABELS[freq]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="rec-next">Next date</Label>
                  <Input
                    id="rec-next"
                    type="date"
                    value={draft.nextDate}
                    onChange={(e) => setDraft((d) => ({ ...d, nextDate: e.target.value }))}
                  />
                </div>

                <Toggle
                  checked={draft.autoPost}
                  onChange={(autoPost) => setDraft((d) => ({ ...d, autoPost }))}
                  label="Post automatically when due"
                />

                <div className="grid gap-1.5">
                  <Label htmlFor="rec-note">Note</Label>
                  <Input
                    id="rec-note"
                    placeholder="Optional"
                    value={draft.note}
                    onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                    maxLength={160}
                  />
                </div>

                {error ? <p className="text-sm text-expense">{error}</p> : null}
              </form>
              <DrawerFooter>
                <Button type="button" onClick={submit}>
                  {editingId ? "Save changes" : "Save recurring"}
                </Button>
                <Button type="button" variant="ghost" onClick={reset}>
                  Back
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <AlertDialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pending?.payee}?</AlertDialogTitle>
            <AlertDialogDescription>
              Future repeats stop. Transactions already posted stay in the ledger.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pending) deleteRecurrence(pending.id);
                setPending(null);
                toast.success("Recurring bill deleted");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
