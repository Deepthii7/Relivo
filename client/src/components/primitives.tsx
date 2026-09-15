/*
 * RELIVO — Shared primitives (Eco-Tech Glasshouse)
 * AIBadge: signature emerald→amber gradient chip marking AI-derived results
 * StatusBadge: consistent status pills across dashboards & browse
 * ResourceImage: uniform image treatment for resource cards
 */
import { Sparkles, Loader2 } from "lucide-react";
import type { ResourceStatus, RequestStatus } from "@/lib/mockData";

export function AIBadge({ children = "AI Match", className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <span className={`ai-badge inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white shadow-sm ${className}`}>
      <Sparkles className="h-3 w-3" strokeWidth={2.5} />
      {children}
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  Available: "bg-teal-50 text-teal-700 border-teal-200",
  Pending: "bg-orange-50 text-orange-700 border-orange-200",
  Approved: "bg-teal-50 text-teal-700 border-teal-200",
  Reserved: "bg-sky-50 text-sky-700 border-sky-200",
  "Pickup Scheduled": "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-teal-50 text-teal-700 border-teal-200",
  Allocated: "bg-slate-100 text-slate-600 border-slate-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  Waitlisted: "bg-orange-50 text-orange-700 border-orange-200",
  "Needs Repair": "bg-orange-50 text-orange-700 border-orange-200",
  "Picked Up": "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-teal-50 text-teal-700 border-teal-200",
  "Like New": "bg-teal-50 text-teal-700 border-teal-200",
  Good: "bg-sky-50 text-sky-700 border-sky-200",
  Fair: "bg-orange-50 text-orange-700 border-orange-200",
};

export function StatusBadge({ status, className = "" }: { status: ResourceStatus | RequestStatus | string; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600 border-slate-200"} ${className}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
        status === "Available" || status === "Completed" || status === "Approved" || status === "Delivered" ? "bg-teal-500" :
        status === "Pending" || status === "Fair" || status === "Needs Repair" ? "bg-orange-500" :
        status === "Rejected" || status === "Waitlisted" ? "bg-red-500" : "bg-sky-500"
      }`} />
      {status}
    </span>
  );
}

const CATEGORY_ICONS: Record<string, string> = {
  Electronics: "💻", Books: "📚", Furniture: "🪑", Educational: "🎓", Sports: "⚽", Materials: "🧵", Stationery: "✏️",
};

export function CategoryIcon({ category }: { category: string }) {
  return <span className="text-lg leading-none">{CATEGORY_ICONS[category] ?? "📦"}</span>;
}

export function ResourceImage({ src, alt, className = "", fallbackTone = "bg-gradient-to-br from-emerald-100 to-emerald-50" }: { src?: string; alt: string; className?: string; fallbackTone?: string }) {
  if (!src) {
    return <div className={`flex items-center justify-center text-4xl ${fallbackTone} ${className}`} aria-label={alt}>📦</div>;
  }
  return (
    <div className={`relative overflow-hidden ${fallbackTone} ${className}`}>
      <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-card p-5">
      <div className="mb-3 h-36 rounded-lg bg-muted" />
      <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
      <div className="h-3 w-1/2 rounded bg-muted" />
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
