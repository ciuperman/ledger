import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { clearLocalCache, flushAll } from "@/lib/sync";
import { cn } from "@/lib/utils";
import type { BookId } from "@/lib/ledger/types";

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 text-primary" aria-hidden="true">
      <rect x="3" y="14" width="4" height="7" rx="1" fill="currentColor" opacity="0.55" />
      <rect x="10" y="8" width="4" height="13" rx="1" fill="currentColor" />
      <rect x="17" y="4" width="4" height="17" rx="1" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  async function onClick() {
    setBusy(true);
    try {
      const saved = await flushAll();
      if (!saved && !window.confirm("Unele modificări nu s-au salvat pe server. Ieși oricum?")) {
        setBusy(false);
        return;
      }
      if (saved) await clearLocalCache();
      await signOut("/login");
    } catch {
      setBusy(false);
      window.alert("Ieșirea a eșuat. Încearcă din nou.");
    }
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title="Ieșire"
      className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
    >
      <LogOut className="size-3.5" />
      {busy ? "…" : "Ieșire"}
    </button>
  );
}

export function AppNav({ book, persistOk }: { book: BookId; persistOk: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <LogoMark />
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5" aria-label="Pages">
            <Link
              to="/"
              className={cn(
                "inline-flex h-7 items-center rounded-md px-2 text-xs font-semibold tracking-widest uppercase transition-colors duration-150",
                book === "ledger"
                  ? "bg-card text-foreground shadow-[var(--shadow-border)]"
                  : "text-muted-foreground",
              )}
            >
              Ledger
            </Link>
            <Link
              to="/keel"
              className={cn(
                "inline-flex h-7 items-center rounded-md px-2 text-xs font-semibold tracking-widest uppercase transition-colors duration-150",
                book === "keel"
                  ? "bg-card text-foreground shadow-[var(--shadow-border)]"
                  : "text-muted-foreground",
              )}
            >
              Keel
            </Link>
          </nav>
          <LogoutButton />
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-subtle">
          {persistOk ? (
            <>
              <Check className="size-3" />
              Saved on this device
            </>
          ) : (
            "Storage blocked"
          )}
        </p>
      </div>
    </div>
  );
}
