/*
 * RELIVO — Notifications (Eco-Tech Glasshouse · low animation)
 * Animated list with fade/slide, read/unread distinction, type icons,
 * mark-all-read action. No excessive motion.
 */
import { useState } from "react";
import { CheckCheck, Bell, FileText, Zap, Truck, CheckCircle2, XCircle, Sparkles, Inbox } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { NOTIFICATIONS, type NotificationType } from "@/lib/mockData";
import RoleGate, { AnySession } from "@/components/RoleGate";

const TYPE_META: Record<NotificationType, { icon: React.ReactNode; tone: string; label: string }> = {
  approved: { icon: <CheckCircle2 className="h-4 w-4" />, tone: "bg-emerald-50 text-emerald-600", label: "Approved" },
  rejected: { icon: <XCircle className="h-4 w-4" />, tone: "bg-red-50 text-red-600", label: "Update" },
  reserved: { icon: <FileText className="h-4 w-4" />, tone: "bg-sky-50 text-sky-600", label: "Reserved" },
  pickup: { icon: <Truck className="h-4 w-4" />, tone: "bg-blue-50 text-blue-600", label: "Pickup" },
  completed: { icon: <CheckCircle2 className="h-4 w-4" />, tone: "bg-emerald-50 text-emerald-600", label: "Completed" },
  ai: { icon: <Sparkles className="h-4 w-4" />, tone: "bg-emerald-50 text-emerald-600", label: "AI" },
};

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState(NOTIFICATIONS);
  const unread = items.filter((n) => !n.read).length;

  const markAll = () => {
    setItems(items.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read.");
  };

  const filtered = user?.role === "admin" ? items : items.filter((n) => n.userId === user?.id);

  return (
    <RoleGate allowedRoles={["donor", "recipient", "admin"]}>
      <AnySession>
        <DashboardLayout title="Notifications">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {unread > 0 ? <strong className="text-foreground">{unread} unread</strong> : "All caught up"} — request updates, AI matches and pickup schedules land here.
            </p>
            {unread > 0 && (
              <Button size="sm" variant="outline" className="rounded-lg" onClick={markAll}>
                <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {filtered.map((n, i) => {
              const meta = TYPE_META[n.type];
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
                      <p className="mt-1.5 text-xs text-muted-foreground/70">{n.createdAt}</p>
                    </div>
                    {!n.read && (
                      <button
                        className="shrink-0 text-xs font-medium text-primary hover:underline"
                        onClick={() => setItems(items.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </SpotlightCard>
              );
            })}
          </div>

          {filtered.length === 0 && (
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
