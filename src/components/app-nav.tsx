import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
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

export function AppNav({ book, persistOk }: { book: BookId; persistOk: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <LogoMark />
      <div className="min-w-0">
        <nav className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5" aria-label="Pages">
          <Link
            to="/"
            className={cn(
              "inline-flex h-7 items-center rounded-md px-2 text-xs font-semibold tracking-widest uppercase transition-colors duration-150",
              book === "ledger" ? "bg-card text-foreground shadow-[var(--shadow-border)]" : "text-muted-foreground",
            )}
          >
            Ledger
          </Link>
          <Link
            to="/keel"
            className={cn(
              "inline-flex h-7 items-center rounded-md px-2 text-xs font-semibold tracking-widest uppercase transition-colors duration-150",
              book === "keel" ? "bg-card text-foreground shadow-[var(--shadow-border)]" : "text-muted-foreground",
            )}
          >
            Keel
          </Link>
        </nav>
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
