import { useMemo, useState } from "react";
import { Check, ChevronDown, Plus, Trash2 } from "lucide-react";
import { labelsEqual, normalizeLabel } from "@/lib/ledger/categories";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PayeePicker({
  payees,
  value,
  onChange,
  onAdd,
  onDelete,
  noun = "payee",
  selectPlaceholder = "Select a payee",
}: {
  payees: string[];
  value: string;
  onChange: (name: string) => void;
  onAdd: (name: string) => string | null;
  onDelete?: (name: string) => void;
  noun?: string;
  selectPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payees;
    return payees.filter((p) => p.toLowerCase().includes(q));
  }, [payees, query]);

  const canAdd = useMemo(() => {
    const cleaned = normalizeLabel(query);
    if (!cleaned) return false;
    return !payees.some((p) => labelsEqual(p, cleaned));
  }, [payees, query]);

  function select(name: string) {
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

  return (
    <div className="grid gap-1.5">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setError(null);
        }}
        className={cn(
          "flex h-11 min-h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-left text-sm shadow-[var(--shadow-border)] outline-none transition-[box-shadow,border-color] duration-150 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
          value ? "text-foreground" : "text-subtle",
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="truncate">{value || selectPlaceholder}</span>
        <ChevronDown className="size-4 shrink-0 text-subtle" />
      </button>

      {open ? (
        <div className="overflow-hidden rounded-xl bg-muted shadow-[var(--shadow-border)]">
          <div className="flex gap-2 p-2">
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setError(null);
              }}
              placeholder={payees.length ? "Search or add" : `Type a ${noun} name`}
              autoComplete="off"
              className="h-10 min-h-10 bg-background"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (filtered.length === 1 && !canAdd) select(filtered[0]!);
                  else if (canAdd) add();
                }
                if (e.key === "Escape") setOpen(false);
              }}
            />
            <Button
              type="button"
              size="sm"
              variant={canAdd ? "default" : "outline"}
              disabled={!normalizeLabel(query)}
              onClick={add}
              className="shrink-0"
            >
              <Plus />
              Add
            </Button>
          </div>
          <ul className="max-h-48 overflow-y-auto px-1 pb-2" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-muted-foreground">
                {payees.length === 0
                  ? `No ${noun}s yet. Type a name and tap Add.`
                  : canAdd
                    ? `Add “${normalizeLabel(query)}” to your list.`
                    : `No matching ${noun}.`}
              </li>
            ) : (
              filtered.map((name) => (
                <li key={name} className="flex items-center gap-1">
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === name}
                    onClick={() => select(name)}
                    className={cn(
                      "flex min-h-11 min-w-0 flex-1 items-center justify-between rounded-lg px-3 text-left text-sm transition-colors duration-150 hover:bg-accent",
                      value === name && "bg-accent",
                    )}
                  >
                    <span className="truncate">{name}</span>
                    {value === name ? <Check className="size-4 shrink-0 text-foreground" /> : null}
                  </button>
                  {onDelete ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-expense"
                      aria-label={`Delete ${name}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(name);
                        if (value === name) onChange("");
                      }}
                    >
                      <Trash2 />
                      Delete
                    </Button>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-lg border border-[#c08984] bg-[#3a2422] px-3 py-2 text-sm text-[#f6ddd9]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
