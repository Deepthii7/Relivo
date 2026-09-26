/*
 * RELIVO — Register (Eco-Tech Glasshouse · low animation)
 * Mirrors Login visual language; adds name, organization, location fields.
 */
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { UserPlus, Loader2, Sparkles } from "lucide-react";
import MarketingLayout from "@/components/layouts/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Role } from "@/lib/mockData";

const LOGO = "/manus-storage/reusenet-logo_f3c85d59.png";

export default function Register() {
  const { user, login, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [org, setOrg] = useState("");
  const [role, setRole] = useState<Role>("donor");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === "admin" ? "/admin" : user.role === "donor" ? "/donor" : "/recipient", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !org.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      login(role, name.trim());
      setBusy(false);
      toast.success(`Account created! Welcome to RELIVO, ${name.trim().split(" ")[0]}.`);
      navigate(role === "admin" ? "/admin" : role === "donor" ? "/donor" : "/recipient");
    }, 600);
  };

  return (
    <MarketingLayout>
      <section className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden pb-16 pt-24">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -left-24 bottom-1/4 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl" />
        </div>

        <div className="rise-in relative w-full max-w-md px-4">
          <div className="mb-6 flex flex-col items-center">
            <img src={LOGO} alt="RELIVO logo" className="h-12 w-12" />
            <p className="mt-3 font-display text-xl font-bold">
              RELIVO
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Join the circular resource network.</p>
          </div>

          <form onSubmit={submit} className="rounded-2xl border border-border bg-white/80 p-7 shadow-xl shadow-emerald-900/5 backdrop-blur">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg bg-white" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="org">Organization</Label>
                  <Input id="org" placeholder="Your org / school / NGO" value={org} onChange={(e) => setOrg(e.target.value)} className="rounded-lg bg-white" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@organization.org" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-lg bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label>I am a…</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger className="rounded-lg bg-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donor">Donor</SelectItem>
                    <SelectItem value="recipient">Recipient (School / NGO / Community)</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="mt-6 w-full rounded-lg transition-transform active:scale-[0.97]" disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              {busy ? "Creating account…" : "Create Account"}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already a member?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">Login</Link>
            </p>
            <p className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50/70 px-3 py-2 text-xs text-emerald-800">
              <Sparkles className="h-3.5 w-3.5" /> Demo mode: this creates a local session — explore any dashboard role.
            </p>
          </form>
        </div>
      </section>
    </MarketingLayout>
  );
}
