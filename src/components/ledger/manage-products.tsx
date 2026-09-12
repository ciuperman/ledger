import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { categoriesFor, normalizeLabel, productsFor } from "@/lib/ledger/categories";
import { useLedger } from "@/lib/ledger/store";
import type { CategoryId, Product } from "@/lib/ledger/types";
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

function ProductSection({
  title,
  category,
  rows,
  onAskDelete,
}: {
  title: string;
  category: CategoryId;
  rows: Product[];
  onAskDelete: (product: Product) => void;
}) {
  const addProduct = useLedger((s) => s.addProduct);
  const renameProduct = useLedger((s) => s.renameProduct);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  function add() {
    const cleaned = normalizeLabel(draft);
    if (!cleaned) return;
    const existing = rows.some((p) => p.name.toLowerCase() === cleaned.toLowerCase());
    const added = addProduct(cleaned, category);
    if (!added) {
      toast.error("Enter a product name.");
      return;
    }
    setDraft("");
    toast.success(existing ? "Already in this list" : "Product added");
  }

  function saveEdit(from: string) {
    const cleaned = normalizeLabel(editValue);
    if (!cleaned || cleaned === from) {
      setEditing(null);
      return;
    }
    if (!renameProduct(from, cleaned, category)) {
      toast.error("That product already exists.");
      return;
    }
    setEditing(null);
    toast.success("Product renamed");
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
              key={`${row.category}:${row.name}`}
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
            placeholder="Eggs, honey, firewood…"
            maxLength={80}
            className="h-10 min-h-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <Button type="button" size="sm" variant="outline" onClick={add} className="shrink-0" aria-label={`Add ${title} product`}>
            <Plus />
            Add
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export function ManageProducts({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const categories = useLedger((s) => s.categories);
  const products = useLedger((s) => s.products);
  const transactions = useLedger((s) => s.transactions);
  const deleteProduct = useLedger((s) => s.deleteProduct);
  const cats = useMemo(() => categoriesFor(categories, "income"), [categories]);
  const loose = useMemo(
    () => productsFor(products).filter((p) => !p.category),
    [products],
  );
  const [pending, setPending] = useState<Product | null>(null);
  const used = pending
    ? transactions.filter(
        (t) =>
          t.type === "income" &&
          t.product === pending.name &&
          (pending.category ? t.category === pending.category : true),
      ).length
    : 0;

  function confirmRemove() {
    if (!pending) return;
    deleteProduct(pending.name, pending.category);
    toast.success("Product removed");
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
          <DrawerTitle>Products</DrawerTitle>
          <DrawerDescription>
            Income only. Each income category has its own product list.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pb-6">
          {pending ? (
            <div className="rounded-xl bg-muted p-4" data-vaul-no-drag>
              <p className="text-sm font-medium">Remove {pending.name}?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {used > 0
                  ? `${used} existing transaction${used === 1 ? "" : "s"} keep this name. It just won’t appear in the picklist.`
                  : "This product will be removed from this category’s picklist."}
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
          {cats.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add income categories first, then products for each.</p>
          ) : (
            cats.map((cat) => (
              <ProductSection
                key={cat.id}
                title={cat.label}
                category={cat.id}
                rows={productsFor(products, cat.id).filter((p) => p.category === cat.id)}
                onAskDelete={setPending}
              />
            ))
          )}
          {loose.length > 0 ? (
            <ProductSection
              title="Unassigned"
              category=""
              rows={loose}
              onAskDelete={setPending}
            />
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
