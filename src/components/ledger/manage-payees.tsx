import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { categoriesFor, normalizeLabel, payeesFor } from "@/lib/ledger/categories";
import { useLedger } from "@/lib/ledger/store";
import type { CategoryId, Payee, TxType } from "@/lib/ledger/types";
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

function PayeeSection({
  title,
  type,
  category,
  rows,
  onAskDelete,
}: {
  title: string;
  type: TxType;
  category: CategoryId;
  rows: Payee[];
  onAskDelete: (payee: Payee) => void;
}) {
  const addPayee = useLedger((s) => s.addPayee);
  const renamePayee = useLedger((s) => s.renamePayee);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  function add() {
    const cleaned = normalizeLabel(draft);
    if (!cleaned) return;
    const existing = rows.some((p) => p.name.toLowerCase() === cleaned.toLowerCase());
    const added = addPayee(cleaned, type, category);
    if (!added) {
      toast.error("Enter a payee name.");
      return;
    }
    setDraft("");
    toast.success(existing ? "Already in this list" : "Payee added");
  }

  function saveEdit(from: string) {
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

  return (
    <section className="flex flex-col gap-2" data-vaul-no-drag>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">None yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li
              key={`${row.type}:${row.category}:${row.name}`}
              className="flex flex-col gap-2 rounded-xl bg-muted p-3"
            >
              {editing === row.name ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  maxLength={80}
                  autoFocus
                  className="h-11 min-h-11 bg-background"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveEdit(row.name);
                    }
                    if (e.key === "Escape") setEditing(null);
                  }}
                />
              ) : (
                <p className="text-sm font-medium">{row.name}</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (editing === row.name) {
                      saveEdit(row.name);
                      return;
                    }
                    setEditing(row.name);
                    setEditValue(row.name);
                  }}
                >
                  <Pencil />
                  {editing === row.name ? "Save" : "Edit"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onAskDelete(row)}
                >
                  <Trash2 />
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {category ? (
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={type === "income" ? "Employer, client…" : "Shop, landlord…"}
            maxLength={80}
            className="h-10 min-h-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <Button type="button" size="sm" variant="outline" onClick={add} className="shrink-0" aria-label={`Add ${title} payee`}>
            <Plus />
            Add
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function TypeBlock({
  title,
  type,
  onAskDelete,
}: {
  title: string;
  type: TxType;
  onAskDelete: (payee: Payee) => void;
}) {
  const categories = useLedger((s) => s.categories);
  const payees = useLedger((s) => s.payees);
  const cats = useMemo(() => categoriesFor(categories, type), [categories, type]);
  const loose = useMemo(
    () => payeesFor(payees, type).filter((p) => !p.category),
    [payees, type],
  );

  return (
    <section className="flex flex-col gap-4">
      <p className="text-sm font-medium">{title}</p>
      {cats.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add {type} categories first, then payees for each.</p>
      ) : (
        cats.map((cat) => (
          <PayeeSection
            key={cat.id}
            title={cat.label}
            type={type}
            category={cat.id}
            rows={payeesFor(payees, type, cat.id).filter((p) => p.category === cat.id)}
            onAskDelete={onAskDelete}
          />
        ))
      )}
      {loose.length > 0 ? (
        <PayeeSection
          title="Unassigned"
          type={type}
          category=""
          rows={loose}
          onAskDelete={onAskDelete}
        />
      ) : null}
    </section>
  );
}

export function ManagePayees({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const transactions = useLedger((s) => s.transactions);
  const deletePayee = useLedger((s) => s.deletePayee);
  const [pending, setPending] = useState<Payee | null>(null);
  const used = pending
    ? transactions.filter(
        (t) =>
          t.type === pending.type &&
          t.payee === pending.name &&
          (pending.category ? t.category === pending.category : true),
      ).length
    : 0;

  function confirmRemove() {
    if (!pending) return;
    deletePayee(pending.name, pending.type, pending.category);
    toast.success("Payee removed");
    setPending(null);
  }

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
          <DrawerTitle>Payees</DrawerTitle>
          <DrawerDescription>
            Each category has its own payee list. Transport shops stay under Transport.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-5 pb-6">
          {pending ? (
            <div className="rounded-xl bg-muted p-4" data-vaul-no-drag>
              <p className="text-sm font-medium">Remove {pending.name}?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {used > 0
                  ? `${used} existing transaction${used === 1 ? "" : "s"} keep this name. It just won’t appear in this category’s picklist.`
                  : "This payee will be removed from this category’s picklist."}
              </p>
              <div className="mt-4 flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setPending(null)}>
                  Cancel
                </Button>
                <Button type="button" variant="destructive" className="flex-1" onClick={confirmRemove}>
                  Remove
                </Button>
              </div>
            </div>
          ) : null}
          <TypeBlock title="Income" type="income" onAskDelete={setPending} />
          <TypeBlock title="Expenses" type="expense" onAskDelete={setPending} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
