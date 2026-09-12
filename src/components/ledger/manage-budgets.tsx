import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { categoriesFor } from "@/lib/ledger/categories";
import { formatRon, parseAmount } from "@/lib/ledger/format";
import { useLedger } from "@/lib/ledger/store";
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
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ManageBudgets({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const categories = useLedger((s) => s.categories);
  const budgets = useLedger((s) => s.budgets);
  const addBudget = useLedger((s) => s.addBudget);
  const updateBudget = useLedger((s) => s.updateBudget);
  const deleteBudget = useLedger((s) => s.deleteBudget);
  const expenseCats = useMemo(() => categoriesFor(categories, "expense"), [categories]);
  const used = useMemo(() => new Set(budgets.map((b) => b.category)), [budgets]);
  const available = expenseCats.filter((c) => !used.has(c.id));

  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [pending, setPending] = useState<string | null>(null);

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
    const row = addBudget({ category, monthly });
    if (!row) {
      toast.error("That category already has a budget.");
      return;
    }
    resetAdd();
    toast.success("Budget saved");
  }

  function saveEdit(id: string) {
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
  const pendingLabel =
    pendingRow && expenseCats.find((c) => c.id === pendingRow.category)?.label;

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(next) => {
          onOpenChange(next);
          if (!next) {
            resetAdd();
            setEditing(null);
          }
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Budgets</DrawerTitle>
            <DrawerDescription>
              Monthly caps for expense categories, in RON. Progress is this calendar month.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-6">
            {expenseCats.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add an expense category first, then set a cap on it.
              </p>
            ) : null}

            {budgets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No budgets yet.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {budgets.map((row) => {
                  const cat = expenseCats.find((c) => c.id === row.category);
                  return (
                    <li
                      key={row.id}
                      className="flex min-h-11 items-center gap-2 rounded-lg bg-muted px-2"
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: cat?.color }}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {cat?.label ?? "Uncategorized"}
                      </span>
                      {editing === row.id ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          inputMode="decimal"
                          autoFocus
                          className="h-9 min-h-9 w-28 bg-background font-mono"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveEdit(row.id);
                            }
                            if (e.key === "Escape") setEditing(null);
                          }}
                          onBlur={() => saveEdit(row.id)}
                        />
                      ) : (
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {formatRon(row.monthly)}
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${cat?.label ?? "budget"}`}
                        onClick={() => {
                          setEditing(row.id);
                          setEditValue(String(row.monthly));
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${cat?.label ?? "budget"}`}
                        className="text-subtle hover:text-expense"
                        onClick={() => setPending(row.id)}
                      >
                        <Trash2 />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}

            {available.length > 0 ? (
              <section className="flex flex-col gap-2">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  New budget
                </p>
                <Label>Category</Label>
                <div className="flex flex-wrap gap-1.5">
                  {available.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={cn(
                        "h-9 min-h-9 rounded-full border px-3 text-xs font-medium transition-colors duration-150",
                        category === c.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-transparent text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputMode="decimal"
                    placeholder="Monthly cap"
                    className="h-10 min-h-10 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        add();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={add}
                    className="shrink-0"
                    aria-label="Add budget"
                  >
                    <Plus />
                    Add
                  </Button>
                </div>
              </section>
            ) : expenseCats.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                Every expense category already has a budget.
              </p>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this budget?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingLabel
                ? `The monthly cap for ${pendingLabel} will be removed. Transactions stay.`
                : "This monthly cap will be removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pending) deleteBudget(pending);
                setPending(null);
                toast.success("Budget removed");
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
