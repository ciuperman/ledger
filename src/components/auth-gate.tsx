import type { ReactNode } from "react";

/** Ledger stays on this device. No account, no password. */
export function AuthGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
