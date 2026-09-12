import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { categoriesFor, normalizeLabel } from "@/lib/ledger/categories";
import { useLedger } from "@/lib/ledger/store";
import type { Category, TxType } from "@/lib/ledger/types";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function CategorySection({
  title,
  type,
  rows,
  onAskDelete,
}: {
  title: string;
  type: TxType;
  rows: Category[];
  onAskDelete: (cat: Category) => void;
}) {
  const addCategory = useLedger((s) => s.addCategory);
  const updateCategory = useLedger((s) => s.updateCategory);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  function add() {
    const cleaned = normalizeLabel(draft);
    if (!cleaned) return;
    const row = addCategory({ label: cleaned, type });
    if (!row) {
      toast.error("Use a unique name.");
      return;
    }
    setDraft("");
    toast.success("Category added");
  }

  function saveEdit(id: string) {
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

  return (
    <section className="flex flex-col gap-2">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">None yet.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows.map((cat) => (
            <li
              key={cat.id}
              className="flex min-h-11 items-center gap-2 rounded-lg bg-muted px-2"
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: cat.color }}
              />
              {editing === cat.id ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  maxLength={40}
                  autoFocus
                  className="h-9 min-h-9 bg-background"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveEdit(cat.id);
                    }
                    if (e.key === "Escape") setEditing(null);
                  }}
                  onBlur={() => saveEdit(cat.id)}
                />
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm">{cat.label}</span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Rename ${cat.label}`}
                onClick={() => {
                  setEditing(cat.id);
                  setEditValue(cat.label);
                }}
              >
                <Pencil />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${cat.label}`}
                className="text-expense hover:text-expense"
                onClick={() => onAskDelete(cat)}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`New ${type} category`}
          maxLength={40}
          className="h-10 min-h-10"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" size="sm" variant="outline" onClick={add} className="shrink-0" aria-label={`Add ${type} category`}>
          <Plus />
          Add
        </Button>
      </div>
    </section>
  );
}

export function ManageCategories({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const categories = useLedger((s) => s.categories);
  const transactions = useLedger((s) => s.transactions);
  const budgets = useLedger((s) => s.budgets);
  const recurrences = useLedger((s) => s.recurrences);
  const deleteCategory = useLedger((s) => s.deleteCategory);
  const income = useMemo(() => categoriesFor(categories, "income"), [categories]);
  const expense = useMemo(() => categoriesFor(categories, "expense"), [categories]);
  const [pending, setPending] = useState<Category | null>(null);
  const used = pending
    ? transactions.filter((t) => t.category === pending.id).length
    : 0;
  const usedBills = pending
    ? recurrences.filter((r) => r.category === pending.id).length
    : 0;
  const usedBudget = pending
    ? budgets.some((b) => b.category === pending.id)
    : false;

  const deleteCopy = (() => {
    const bits: string[] = [];
    if (used > 0) {
      bits.push(
        `${used} transaction${used === 1 ? "" : "s"} will stay, marked uncategorized.`,
      );
    }
    if (usedBills > 0) {
      bits.push(
        `${usedBills} recurring bill${usedBills === 1 ? "" : "s"} using this category will be deleted.`,
      );
    }
    if (usedBudget) bits.push("Its monthly budget will be removed.");
    if (bits.length === 0) return "This category will be removed from this device.";
    return bits.join(" ");
  })();

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) setPending(null);
        onOpenChange(next);
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Categories</DrawerTitle>
          <DrawerDescription>
            Add, rename, or remove income and expense categories.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pb-6">
          {pending ? (
            <div className="rounded-xl bg-muted p-4" data-vaul-no-drag>
              <p className="text-sm font-medium">Delete {pending.label}?</p>
              <p className="mt-1 text-sm text-muted-foreground">{deleteCopy}</p>
              <div className="mt-4 flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setPending(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    deleteCategory(pending.id);
                    setPending(null);
                    toast.success("Category deleted");
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : null}
          <CategorySection
            title="Income"
            type="income"
            rows={income}
            onAskDelete={setPending}
          />
          <CategorySection
            title="Expenses"
            type="expense"
            rows={expense}
            onAskDelete={setPending}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
