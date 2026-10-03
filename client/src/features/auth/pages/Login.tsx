/*
 * RELIVO — Login (Eco-Tech Glasshouse · low animation)
 * Clean form: email, password, role. Subtle animated bg, calm entrance.
 */
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LogIn, Loader2 } from "lucide-react";
import MarketingLayout from "@/components/layouts/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const LOGO = "/manus-storage/reusenet-logo_f3c85d59.png";

export default function Login() {
  const { user, login, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === "admin" ? "/admin" : user.role === "donor" ? "/donor" : "/recipient", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      const signedInUser = await login(email.trim(), password);
      toast.success(`Welcome back, ${signedInUser.name.split(" ")[0]}.`);
      navigate(signedInUser.role === "admin" ? "/admin" : signedInUser.role === "donor" ? "/donor" : "/recipient");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <MarketingLayout>
      <section className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden pb-16 pt-24">
        {/* subtle animated backdrop */}
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -right-24 bottom-1/4 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl" />
        </div>

        <div className="rise-in relative w-full max-w-md px-4">
          <div className="mb-6 flex flex-col items-center">
            <img src={LOGO} alt="RELIVO logo" className="h-12 w-12" />
            <p className="mt-3 font-display text-xl font-bold">
              RELIVO
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Welcome back — the loop is waiting.</p>
          </div>

          <form onSubmit={submit} className="rounded-2xl border border-border bg-white/80 p-7 shadow-xl shadow-emerald-900/5 backdrop-blur">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@organization.org" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-lg bg-white" />
              </div>
            </div>
            <Button type="submit" className="mt-6 w-full rounded-lg transition-transform active:scale-[0.97]" disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              {busy ? "Signing in…" : "Login"}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">Create an account</Link>
            </p>
          </form>
        </div>
      </section>
    </MarketingLayout>
  );
}
