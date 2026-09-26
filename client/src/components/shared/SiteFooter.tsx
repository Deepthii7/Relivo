/* RELIVO — Marketing footer (Eco-Tech Glasshouse) */
import { Link } from "wouter";
import { RotateCcw } from "lucide-react";

const LOGO = "/manus-storage/reusenet-logo_f3c85d59.png";

export default function SiteFooter() {
  return (
    <footer className="border-t border-emerald-900/40 bg-gradient-to-b from-[#0B2B1E] to-[#042215] text-white">
      <div className="container grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <img src={LOGO} alt="RELIVO logo" className="h-7 w-7 rounded-lg bg-white/90 p-0.5" />
            <span className="font-display text-lg font-bold">RELIVO</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-emerald-200/80">
            The intelligent network that gives reusable resources a second life — connecting donors with the schools, NGOs, and communities that need them most.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-primary">
            <RotateCcw className="h-4 w-4" />
            Powered by AI · DSA · Operating Systems
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Platform</h4>
          <ul className="space-y-2 text-sm text-emerald-200/80">
            <li><Link href="/browse" className="transition-colors hover:text-white">Browse Resources</Link></li>
            <li><Link href="/register" className="transition-colors hover:text-white">Donate Resources</Link></li>
            <li><Link href="/recommendations" className="transition-colors hover:text-white">AI Recommendations</Link></li>
            <li><Link href="/analytics" className="transition-colors hover:text-white">Analytics & Reports</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Company</h4>
          <ul className="space-y-2 text-sm text-emerald-200/80">
            <li><Link href="/about" className="transition-colors hover:text-white">About the Mission</Link></li>
            <li><Link href="/about" className="transition-colors hover:text-white">How It Works</Link></li>
            <li><Link href="/login" className="transition-colors hover:text-white">Login</Link></li>
            <li><Link href="/register" className="transition-colors hover:text-white">Register</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-emerald-200/70 sm:flex-row">
          <p>© 2026 RELIVO — Intelligent Circular Resource Exchange Platform</p>
          <p>Built for a circular economy · Reduce · Reuse · Recommend</p>
        </div>
      </div>
    </footer>
  );
}
