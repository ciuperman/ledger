import type { ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { RedirectToSignIn, SIGN_IN_PATH } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

/** Everything except /login requires a signed-in user. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user, isPending } = useCurrentUserState();
  if (pathname === SIGN_IN_PATH) return <>{children}</>;
  if (isPending) return null;
  if (!user) return <RedirectToSignIn />;
  return <>{children}</>;
}
