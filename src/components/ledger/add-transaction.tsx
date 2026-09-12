import { useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { isoDate } from "@/lib/ledger/format";
import { categoriesFor, labelsEqual, normalizeLabel, payeeNames, productNames } from "@/lib/ledger/categories";
import { useLedger } from "@/lib/ledger/store";
import type { CategoryId, TxType } from "@/lib/ledger/types";
import { Button } from "@/components/ui/button";
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
import { PayeePicker } from "./payee-picker";

type Draft = {
  type: TxType;
  amount: string;
  category: CategoryId;
  date: string;
  payee: string;
  product: string;
  quantity: string;
  note: string;
};

function emptyDraft(date: string): Draft {
  return {
    type: "expense",
    amount: "",
    category: "",
    date,
    payee: "",
    product: "",
    quantity: "1",
    note: "",
  };
}

export function AddTransaction({
  open,
  onOpenChange,
  onSubmit,
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: {
    type: TxType;
    amount: number;
    category: CategoryId;
    date: string;
    payee: string;
    note?: string;
    product?: string;
    quantity?: number;
  }) => void;
  defaultDate?: string;
}) {
  const categories = useLedger((s) => s.categories);
  const payees = useLedger((s) => s.payees);
  const products = useLedger((s) => s.products);
  const addCategory = useLedger((s) => s.addCategory);
  const addPayee = useLedger((s) => s.addPayee);
  const deletePayee = useLedger((s) => s.deletePayee);
  const addProduct = useLedger((s) => s.addProduct);
  const deleteProduct = useLedger((s) => s.deleteProduct);
  const today = defaultDate ?? isoDate(new Date());
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(today));
  const [error, setError] = useState<string | null>(null);
  const [newCat, setNewCat] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const newCatRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!addingCat) return;
    const id = window.setTimeout(() => {
      newCatRef.current?.focus();
      newCatRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 50);
    return () => window.clearTimeout(id);
  }, [addingCat]);

  const cats = useMemo(
    () => categoriesFor(categories, draft.type),
    [categories, draft.type],
  );
  const payeeList = useMemo(
    () => (draft.category ? payeeNames(payees, draft.type, draft.category) : []),
    [payees, draft.type, draft.category],
  );
  const productList = useMemo(
    () => (draft.category ? productNames(products, draft.category) : []),
    [products, draft.category],
  );

  function reset() {
    setDraft(emptyDraft(today));
    setError(null);
    setNewCat("");
    setAddingCat(false);
  }

  function handleType(type: TxType) {
    const nextCats = categoriesFor(categories, type);
    setDraft((d) => ({
      ...d,
      type,
      category: nextCats.some((c) => c.id === d.category) ? d.category : "",
      payee: "",
      product: "",
      quantity: type === "income" ? d.quantity || "1" : "1",
    }));
    setAddingCat(nextCats.length === 0);
  }

  function pickCategory(id: CategoryId) {
    const names = payeeNames(payees, draft.type, id);
    const items = productNames(products, id);
    setDraft((d) => ({
      ...d,
      category: id,
      payee: names.some((n) => labelsEqual(n, d.payee)) ? d.payee : "",
      product: items.some((n) => labelsEqual(n, d.product)) ? d.product : "",
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
      setDraft((d) => ({ ...d, category: existing.id }));
      setNewCat("");
      setAddingCat(false);
      setError(null);
      return;
    }
    const row = addCategory({ label: cleaned, type: draft.type });
    if (!row) {
      setError("Use a unique category name.");
      return;
    }
    setDraft((d) => ({ ...d, category: row.id, payee: "", product: "" }));
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
    let product: string | undefined;
    let quantity: number | undefined;
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
      note: draft.note.trim() || undefined,
      product,
      quantity,
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
        if (next) {
          const nextCats = categoriesFor(categories, draft.type);
          setAddingCat(nextCats.length === 0);
        }
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add transaction</DrawerTitle>
          <DrawerDescription>Saved on this device only.</DrawerDescription>
        </DrawerHeader>
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
                onClick={() => handleType(type)}
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
            <Label htmlFor="amount">Amount (RON)</Label>
            <Input
              id="amount"
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
            {cats.length === 0 && !addingCat ? (
              <p className="text-sm text-muted-foreground">
                No {draft.type} categories yet.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-1.5">
              {cats.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickCategory(c.id)}
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
              <button
                type="button"
                onClick={() => setAddingCat(true)}
                className="inline-flex h-9 min-h-9 items-center gap-1 rounded-full border border-dashed border-border px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Plus className="size-3.5" />
                New
              </button>
            </div>
            {addingCat ? (
              <div className="flex gap-2 pt-1">
                <Input
                  ref={newCatRef}
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  placeholder={`${draft.type === "income" ? "Salary, freelance…" : "Rent, groceries…"}`}
                  maxLength={40}
                  className="h-12 min-h-12"
                  enterKeyHint="done"
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      createCategory();
                    }
                    if (e.key === "Escape") setAddingCat(false);
                  }}
                />
                <Button type="button" size="sm" variant="outline" onClick={createCategory}>
                  Add
                </Button>
              </div>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label>Payee</Label>
            {draft.category ? (
              <PayeePicker
                payees={payeeList}
                value={draft.payee}
                onChange={(name) => setDraft((d) => ({ ...d, payee: name }))}
                onAdd={(name) => addPayee(name, draft.type, draft.category)}
                onDelete={(name) => deletePayee(name, draft.type, draft.category)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Pick a category first. Payees are per category.</p>
            )}
          </div>

          {draft.type === "income" ? (
            <>
              <div className="grid gap-1.5">
                <Label>Product</Label>
                {draft.category ? (
                  <PayeePicker
                    payees={productList}
                    value={draft.product}
                    onChange={(name) => setDraft((d) => ({ ...d, product: name }))}
                    onAdd={(name) => addProduct(name, draft.category)}
                    onDelete={(name) => deleteProduct(name, draft.category)}
                    noun="product"
                    selectPlaceholder="Select a product"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">Pick a category first. Products are per income category.</p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  inputMode="decimal"
                  placeholder="1"
                  value={draft.quantity}
                  onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))}
                  className="font-mono tabular-nums"
                  autoComplete="off"
                />
              </div>
            </>
          ) : null}

          <div className="grid gap-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={draft.date}
              onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
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
            Save transaction
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
