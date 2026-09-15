/*
 * RELIVO — Dashboard layout (Eco-Tech Glasshouse)
 * Fixed left sidebar (role-aware) with glass treatment, content area on the right.
 * Usability-first: clean spacing, soft shadows, precise typography.
 */
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Upload, PackageSearch, ListChecks, Bell, BarChart3,
  Sparkles, Home, LogOut, UserCircle2, ShieldCheck, HandHeart, Building2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AIBadge } from "@/components/primitives";

const LOGO = "/manus-storage/reusenet-logo_f3c85d59.png";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const DONOR_NAV: NavItem[] = [
  { href: "/donor", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/upload", label: "Upload Resource", icon: <Upload className="h-4 w-4" /> },
  { href: "/browse", label: "Browse Resources", icon: <PackageSearch className="h-4 w-4" /> },
  { href: "/requests", label: "Incoming Requests", icon: <ListChecks className="h-4 w-4" /> },
  { href: "/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
];

const RECIPIENT_NAV: NavItem[] = [
  { href: "/recipient", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/browse", label: "Browse Resources", icon: <PackageSearch className="h-4 w-4" /> },
  { href: "/requests", label: "My Requests", icon: <ListChecks className="h-4 w-4" /> },
  { href: "/recommendations", label: "AI Recommendations", icon: <Sparkles className="h-4 w-4" /> },
  { href: "/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/browse", label: "All Resources", icon: <PackageSearch className="h-4 w-4" /> },
  { href: "/requests", label: "All Requests", icon: <ListChecks className="h-4 w-4" /> },
  { href: "/recommendations", label: "AI Engine", icon: <Sparkles className="h-4 w-4" /> },
  { href: "/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
  { href: "/analytics", label: "Analytics & Reports", icon: <BarChart3 className="h-4 w-4" /> },
];

const ROLE_META = {
  donor: { label: "Donor Portal", color: "text-primary", Icon: HandHeart },
  recipient: { label: "Recipient Portal", color: "text-sky-700", Icon: Building2 },
  admin: { label: "Admin Console", color: "text-slate-700", Icon: ShieldCheck },
};

export default function DashboardLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const nav = user?.role === "admin" ? ADMIN_NAV : user?.role === "donor" ? DONOR_NAV : RECIPIENT_NAV;
  const meta = ROLE_META[user?.role ?? "recipient"];
  const Icon = meta.Icon;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <img src={LOGO} alt="RELIVO logo" className="h-7 w-7 rounded-lg bg-white/90 p-0.5" />
          <div className="leading-tight">
            <p className="font-display text-base font-bold">RELIVO</p>
            <p className={`text-[11px] font-medium ${meta.color}`}>{meta.label}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                location === item.href
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : item.href === "/recommendations"
                    ? "text-muted-foreground hover:bg-secondary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              {item.href === "/recommendations" ? (
                <span className="relative">
                  {item.icon}
                  <span className="absolute -right-1 -top-1.5 scale-75"><AIBadge className="px-1 py-px text-[8px]">AI</AIBadge></span>
                </span>
              ) : (
                item.icon
              )}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2">
            <UserCircle2 className="h-7 w-7 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-sidebar-foreground">{user?.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Link href="/" className="flex-1 rounded-md border border-border px-2 py-1.5 text-center text-xs text-muted-foreground transition-colors hover:bg-secondary">
              <Home className="mr-1 inline h-3 w-3" />Home
            </Link>
            <button onClick={logout} className="flex-1 rounded-md border border-border px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="mr-1 inline h-3 w-3" />Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 lg:pl-60">
        <div className="px-4 pb-10 pt-20 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
            <div className="flex items-center gap-2.5">
              <img src={LOGO} alt="RELIVO logo" className="h-7 w-7 rounded-lg bg-white/90 p-0.5" />
              <p className="font-display font-bold">RELIVO</p>
            </div>
            <nav className="flex flex-wrap gap-1">
              {nav.slice(0, 4).map((item) => (
                <Link key={item.href} href={item.href} className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${location === item.href ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
