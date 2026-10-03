/* RELIVO — Role gate: redirects unauthenticated users to /login,
 * and mismatched roles to their correct dashboard.
 * Redirects run in a mount effect (not in the render path) so they never
 * race with the auth-context hydration that can briefly report "logged out". */
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/lib/types";
import { LoadingState } from "@/components/primitives";

export default function RoleGate({ allowedRoles, children }: { allowedRoles: Role[]; children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    if (!user || !allowedRoles.includes(user.role)) {
      const target = user?.role === "admin" ? "/admin" : user?.role === "donor" ? "/donor" : "/recipient";
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, loading, allowedRoles, navigate]);

  // While the effect runs (or the session isn't right for this page), show a
  // loading veil instead of rendering a redirect component in the render path.
  if (loading || !isAuthenticated) return <LoadingState label="Checking your session…" />;
  if (!user || !allowedRoles.includes(user.role)) {
    return <LoadingState label="Redirecting to your dashboard…" />;
  }
  return <>{children}</>;
}

export function AnySession({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading || !isAuthenticated) return <LoadingState label="Preparing your session…" />;
  return <>{children}</>;
}
