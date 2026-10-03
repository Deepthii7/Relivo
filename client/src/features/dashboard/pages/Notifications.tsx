/*
 * RELIVO — Notifications (Eco-Tech Glasshouse · low animation)
 * Animated list with fade/slide, read/unread distinction, type icons,
 * mark-all-read action. No excessive motion.
 */
import { useEffect, useState } from "react";
import { Bell, FileText, CheckCircle2, XCircle, Inbox } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { apiRequest } from "@/lib/api";
import RoleGate, { AnySession } from "@/components/role-gating/RoleGate";

interface RequestNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const TYPE_META: Record<string, { icon: React.ReactNode; tone: string; label: string }> = {
  pending: { icon: <FileText className="h-4 w-4" />, tone: "bg-orange-50 text-orange-600", label: "Queued" },
  waitlisted: { icon: <FileText className="h-4 w-4" />, tone: "bg-orange-50 text-orange-600", label: "Waitlisted" },
  allocated: { icon: <CheckCircle2 className="h-4 w-4" />, tone: "bg-emerald-50 text-emerald-600", label: "Allocated" },
  approved: { icon: <CheckCircle2 className="h-4 w-4" />, tone: "bg-emerald-50 text-emerald-600", label: "Approved" },
  rejected: { icon: <XCircle className="h-4 w-4" />, tone: "bg-red-50 text-red-600", label: "Update" },
  reserved: { icon: <FileText className="h-4 w-4" />, tone: "bg-sky-50 text-sky-600", label: "Reserved" },
  completed: { icon: <CheckCircle2 className="h-4 w-4" />, tone: "bg-emerald-50 text-emerald-600", label: "Completed" },
};

export default function Notifications() {
  const [items, setItems] = useState<RequestNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<{ notifications: RequestNotification[] }>("/notifications", { signal: controller.signal })
      .then(({ notifications }) => setItems(notifications))
      .catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Unable to load request updates."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const filtered = items;

  return (
    <RoleGate allowedRoles={["donor", "recipient", "admin"]}>
      <AnySession>
        <DashboardLayout title="Notifications">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {items.length > 0 ? <strong className="text-foreground">{items.length} request updates</strong> : "No request activity yet"} — updates reflect your current queue.
            </p>
          </div>

          {loading ? <p className="py-12 text-center text-sm text-muted-foreground">Loading request updates…</p> : error ? (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">{error}</p>
          ) : <div className="space-y-3">
            {filtered.map((n, i) => {
              const meta = TYPE_META[n.type] ?? TYPE_META.pending;
              return (
                <SpotlightCard key={n.id} className="rise-in border border-border bg-white" spotlightColor="rgba(4,108,78,0.1)">
                  <div
                    className="flex items-start gap-4 p-5 transition-opacity duration-300"
                    style={{ opacity: n.read ? 0.65 : 1 }}
                  >
                    <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.tone}`}>
                      {meta.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-sm font-semibold">{n.title}</h3>
                        <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">{meta.label}</span>
                        {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.message}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground/70">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground/50" />
              <p className="font-display text-lg font-semibold text-muted-foreground">No notifications yet</p>
              <p className="max-w-xs text-sm text-muted-foreground">When your requests are evaluated or a pickup is scheduled, it will appear here.</p>
            </div>
          )}
        </DashboardLayout>
      </AnySession>
    </RoleGate>
  );
}
