/*
 * RELIVO — Marketing site header (Eco-Tech Glasshouse)
 * Glass sticky nav that gains opacity on scroll; violet brand wordmark
 * RELIVO wordmark; demo-session aware (shows user pill).
 */
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogIn, LogOut, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AIBadge } from "@/components/primitives";

const LOGO = "/manus-storage/reusenet-logo_f3c85d59.png";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/browse", label: "Browse" },
  { href: "/analytics", label: "Analytics" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-border/60 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src={LOGO} alt="RELIVO logo" className="h-9 w-9" />
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            RELIVO
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                location === l.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <span className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
                <UserCircle2 className="h-4 w-4 text-primary" />
                {user?.name}
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary capitalize">{user?.role}</span>
              </span>
              <Link href={user?.role === "admin" ? "/admin" : user?.role === "donor" ? "/donor" : "/recipient"}>
                <Button size="sm" className="rounded-lg">Dashboard</Button>
              </Link>
              <Button size="sm" variant="ghost" className="rounded-lg text-muted-foreground" onClick={logout} title="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost" className="rounded-lg text-foreground">
                  <LogIn className="mr-1.5 h-4 w-4" /> Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-lg">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-foreground transition-colors hover:bg-secondary md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="glass border-t border-border/60 md:hidden">
          <nav className="container flex flex-col gap-1 py-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  location === l.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link href={user?.role === "admin" ? "/admin" : user?.role === "donor" ? "/donor" : "/recipient"} className="rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground">
                  Go to Dashboard
                </Link>
                <button onClick={logout} className="rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground">Sign out</button>
              </>
            ) : (
              <Link href="/login" className="rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground">Login / Register</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
