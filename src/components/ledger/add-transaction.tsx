import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, ClipboardPaste, ImageUp, Plus } from "lucide-react";
import { isoDate } from "@/lib/ledger/format";
import { categoriesFor, labelsEqual, normalizeLabel, payeeNames, productNames } from "@/lib/ledger/categories";
import { useLedger } from "@/lib/ledger/store";
import type { CategoryId, ReceiptItem, TxType } from "@/lib/ledger/types";
import { withPreviewPrefix } from "@/lib/preview-path-prefix";
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
import { toast } from "sonner";

type Draft = {
  type: TxType;
  amount: string;
  category: CategoryId;
  date: string;
  payee: string;
  product: string;
  quantity: string;
  note: string;
  items: ReceiptItem[];
};

function keepThisYear(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  const year = Number(match[1]);
  const current = new Date().getFullYear();
  if (year !== current - 1) return iso;
  const shifted = `${current}-${match[2]}-${match[3]}`;
  const time = new Date(`${shifted}T12:00:00`).getTime();
  const endToday = new Date();
  endToday.setHours(23, 59, 59, 999);
  return time <= endToday.getTime() ? shifted : iso;
}

async function photoDataUrl(file: File): Promise<string> {
  const bitmap = await loadBitmap(file);
  try {
    let width = Math.min(bitmap.width, 900);
    let url = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      const scale = width / bitmap.width;
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(8, Math.round(bitmap.width * scale));
      canvas.height = Math.max(8, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not read photo");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      url = canvas.toDataURL("image/jpeg", 0.62);
      if (url.length <= 420_000) return url;
      width = Math.round(width * 0.75);
    }
    if (url.length > 480_000) throw new Error("Photo is too large. Keep the product lines in the crop.");
    return url;
  } finally {
    bitmap.close();
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("Could not read photo"));
        el.src = url;
      });
      return await createImageBitmap(image);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

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
    items: [],
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
    items?: ReceiptItem[];
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
  const [scanning, setScanning] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderText, setOrderText] = useState("");
  const [scanned, setScanned] = useState<string | null>(null);
  const newCatRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

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
    setScanning(false);
    setOrderOpen(false);
    setOrderText("");
    setScanned(null);
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
    const listedPayees = payeeNames(payees, draft.type, draft.category);
    const listedProducts = productNames(products, draft.category);
    setDraft((d) => ({
      ...d,
      category: id,
      payee:
        !d.payee || !listedPayees.some((n) => labelsEqual(n, d.payee)) || names.some((n) => labelsEqual(n, d.payee))
          ? d.payee
          : "",
      product:
        !d.product ||
        !listedProducts.some((n) => labelsEqual(n, d.product)) ||
        items.some((n) => labelsEqual(n, d.product))
          ? d.product
          : "",
    }));
  }

  function createCategory() {
    const cleaned = normalizeLabel(newCat);
    if (!cleaned) {
      fail("Name the category.");
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
      fail("Use a unique category name.");
      return;
    }
    if (draft.payee.trim()) ensurePayee(draft.payee, draft.type, row.id);
    setDraft((d) => ({ ...d, category: row.id }));
    setNewCat("");
    setAddingCat(false);
    setError(null);
  }

  function ensureCategory(label: string, type: TxType): string {
    const cleaned = normalizeLabel(label).slice(0, 40);
    if (!cleaned) return "";
    const existing = categoriesFor(useLedger.getState().categories, type).find((c) =>
      labelsEqual(c.label, cleaned),
    );
    if (existing) return existing.id;
    return addCategory({ label: cleaned, type })?.id ?? "";
  }

  function ensurePayee(name: string, type: TxType, category: string) {
    const cleaned = normalizeLabel(name).slice(0, 80);
    if (!cleaned || !category) return "";
    return addPayee(cleaned, type, category) ?? cleaned;
  }

  function applyExtracted(data: {
    amount?: number;
    date?: string;
    payee?: string;
    category?: string;
    note?: string;
    items?: ReceiptItem[];
  }) {
    const type = draft.type;
    const categoryId =
      (typeof data.category === "string" && ensureCategory(data.category, type)) ||
      draft.category ||
      (typeof data.payee === "string" || data.amount != null ? ensureCategory("Other", type) : "");
    const payee =
      (typeof data.payee === "string" && ensurePayee(data.payee, type, categoryId)) || draft.payee;
    const date = keepThisYear(
      typeof data.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.date) ? data.date : draft.date,
    );
    const amount = typeof data.amount === "number" && data.amount > 0 ? String(data.amount) : "";
    const items = Array.isArray(data.items) ? data.items.filter((item) => item.name).slice(0, 30) : [];
    setDraft((d) => ({
      ...d,
      type,
      category: categoryId || d.category,
      amount: amount || d.amount,
      date,
      payee: payee || d.payee,
      note: data.note ?? d.note,
      items,
    }));
    setAddingCat(false);
    setOrderOpen(false);
    setOrderText("");
    const summary = [
      amount ? `${amount} RON` : "no total",
      payee || "no shop",
      items.length ? `${items.length} products` : "no product lines",
    ]
      .filter(Boolean)
      .join(" · ");
    setScanned(summary);
    if (!amount) {
      fail("Couldn't read the total. The other fields are filled in.");
      return;
    }
    setError(null);
  }

  async function readOrder(body: { image?: string; text?: string }) {
    const res = await fetch(withPreviewPrefix("/api/scan-receipt"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        categories: categoriesFor(useLedger.getState().categories, draft.type).map((c) => c.label),
      }),
    });
    if (!res.ok) {
      const raw = await res.text();
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        throw new Error("Server is busy. Try again in a minute.");
      }
      const flat = raw.replace(/\s+/g, " ").trim();
      throw new Error(
        !flat || flat.length > 180 || /<\/?[a-z!]/i.test(flat) ? "Could not read that." : flat,
      );
    }
    applyExtracted(await res.json());
  }

  async function onScan(file: File) {
    const image =
      file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|heic|heif)$/i.test(file.name);
    if (!image) {
      fail("Upload a screenshot image.");
      return;
    }
    setScanning(true);
    setError(null);
    try {
      await readOrder({ image: await photoDataUrl(file) });
    } catch (err) {
      fail(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  async function onPasteOrder(raw?: string) {
    const text = (raw ?? orderText).trim();
    if (text.length < 8) {
      fail("Paste the order confirmation.");
      setOrderOpen(true);
      return;
    }
    setScanning(true);
    setError(null);
    try {
      await readOrder({ text: text.slice(0, 12_000) });
    } catch (err) {
      fail(err instanceof Error ? err.message : "Could not read that order");
    } finally {
      setScanning(false);
    }
  }

  async function onOrderButton() {
    if (orderOpen && orderText.trim().length >= 8) {
      await onPasteOrder();
      return;
    }
    setOrderOpen(true);
    try {
      const pasted = await navigator.clipboard.readText();
      if (pasted.trim().length >= 8) {
        setOrderText(pasted.trim().slice(0, 12_000));
        await onPasteOrder(pasted);
      }
    } catch {
      setError(null);
    }
  }

  function fail(message: string) {
    setError(message);
    toast.error(message);
  }

  function submit() {
    const amount = Number(draft.amount.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) {
      fail("Enter an amount greater than zero.");
      return;
    }
    if (!draft.payee.trim()) {
      fail("Add a payee.");
      return;
    }
    let category = draft.category;
    if (!category && newCat.trim()) category = ensureCategory(newCat, draft.type);
    if (!category) category = ensureCategory("Other", draft.type);
    if (!category) {
      fail("Add a category.");
      return;
    }
    const payee = ensurePayee(draft.payee, draft.type, category);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) {
      fail("Pick a valid date.");
      return;
    }
    let product: string | undefined;
    let quantity: number | undefined;
    if (draft.type === "income") {
      product = draft.product.trim();
      if (!product) {
        fail("Pick a product from your list.");
        return;
      }
      const qtyRaw = draft.quantity.trim() || "1";
      quantity = Number(qtyRaw.replace(",", "."));
      if (!Number.isFinite(quantity) || quantity <= 0) {
        fail("Enter a quantity greater than zero.");
        return;
      }
    }
    onSubmit({
      type: draft.type,
      amount,
      category,
      date: draft.date,
      payee,
      note: draft.note.trim() || undefined,
      product,
      quantity,
      items: draft.items.length > 0 ? draft.items : undefined,
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
          <DrawerDescription>Check the scan, then save. Nothing is stored until you do.</DrawerDescription>
        </DrawerHeader>
        <form
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {scanned ? (
            <p
              role="status"
              className="rounded-lg border border-[#8fa89a] bg-[#1c2822] px-3 py-2 text-sm text-[#e7f2ea]"
            >
              Scanned: {scanned}
            </p>
          ) : null}
          {draft.items.length > 0 ? (
            <ul className="divide-y divide-border rounded-lg border border-border px-3">
              {draft.items.map((item, index) => (
                <li key={`${item.name}-${index}`} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0">
                    {item.quantity != null ? `${item.quantity} × ` : ""}
                    {item.name}
                  </span>
                  <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                    {item.price != null ? item.price.toFixed(2) : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex items-center justify-between">
            <div className="flex rounded-xl bg-muted p-1 flex-1">
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
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              className="px-2"
              disabled={scanning}
              onClick={() => cameraRef.current?.click()}
            >
              <Camera />
              Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              className="px-2"
              disabled={scanning}
              onClick={() => fileRef.current?.click()}
            >
              <ImageUp />
              Screenshot
            </Button>
            <Button
              type="button"
              variant="outline"
              className="px-2"
              disabled={scanning}
              onClick={() => void onOrderButton()}
            >
              <ClipboardPaste />
              Paste
            </Button>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void onScan(file);
              }}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.png,.jpg,.jpeg,.webp,.heic,.heif"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void onScan(file);
              }}
            />
          </div>

          {orderOpen ? (
            <div className="grid gap-1.5">
              <Label htmlFor="order-text">Online order</Label>
              <textarea
                id="order-text"
                value={orderText}
                onChange={(e) => setOrderText(e.target.value.slice(0, 12_000))}
                placeholder="Paste the confirmation email or order page"
                rows={4}
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              <Button type="button" size="sm" disabled={scanning} onClick={() => void onPasteOrder()}>
                {scanning ? "Reading…" : "Read order"}
              </Button>
            </div>
          ) : null}

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
        </form>
        <DrawerFooter>
          {error ? (
            <p role="alert" className="rounded-lg border border-[#c08984] bg-[#3a2422] px-3 py-2 text-sm text-[#f6ddd9]">
              {error}
            </p>
          ) : null}
          <Button type="button" onClick={submit} disabled={scanning}>
            {scanning ? "Scanning…" : "Save transaction"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
