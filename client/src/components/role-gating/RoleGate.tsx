/* RELIVO — Role gate: redirects unauthenticated users to /login,
 * and mismatched roles to their correct dashboard.
 * Redirects run in a mount effect (not in the render path) so they never
 * race with the auth-context hydration that can briefly report "logged out". */
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/lib/mockData";
import { LoadingState } from "@/components/primitives";

// Dev-mode shortcut: set VITE_DEV_AUTOLOGIN=<role> (donor|recipient|admin) in .env to
// render protected pages without going through the mock login form. Only active in dev.
const DEV_AUTOLOGIN_ROLE =
  import.meta.env.DEV && import.meta.env.VITE_DEV_AUTOLOGIN
    ? (import.meta.env.VITE_DEV_AUTOLOGIN as Role)
    : null;

export default function RoleGate({ allowedRoles, children }: { allowedRoles: Role[]; children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      if (DEV_AUTOLOGIN_ROLE && (window as unknown as Record<string, unknown>).__devAutoLogin) {
        ((window as unknown as Record<string, (r: Role) => void>).__devAutoLogin)(DEV_AUTOLOGIN_ROLE);
        return;
      }
      navigate("/login", { replace: true });
      return;
    }
    if (!user || !allowedRoles.includes(user.role)) {
      const target = user?.role === "admin" ? "/admin" : user?.role === "donor" ? "/donor" : "/recipient";
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, allowedRoles, navigate]);

  // While the effect runs (or the session isn't right for this page), show a
  // loading veil instead of rendering a redirect component in the render path.
  if (!isAuthenticated) return <LoadingState label="Checking your session…" />;
  if (!user || !allowedRoles.includes(user.role)) {
    return <LoadingState label="Redirecting to your dashboard…" />;
  }
  return <>{children}</>;
}

export function AnySession({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LoadingState label="Preparing your session…" />;
  return <>{children}</>;
}
