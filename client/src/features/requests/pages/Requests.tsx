/*
 * RELIVO — Requests page (Eco-Tech Glasshouse · low animation)
 * Donors see incoming requests on their resources; recipients see their own requests.
 * Admin sees all. Includes approve/reject actions for donors.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Check, X, ArrowRight } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/primitives";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { Request } from "@/lib/mockData";
import { decideRequest, getRequests } from "@/lib/api";
import RoleGate, { AnySession } from "@/components/role-gating/RoleGate";

export default function Requests() {
  const { user } = useAuth();
  const userId = user?.id;
  const userRole = user?.role;
  const [items, setItems] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (userId === undefined || userRole === undefined) return;
    let active = true;
    const filters = userRole === "donor" ? { donorId: userId } : userRole === "recipient" ? { recipientId: userId } : {};
    getRequests(filters)
      .then((requests) => {
        if (active) setItems(requests);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load requests.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId, userRole]);

  const isDonor = user?.role === "donor";
  const isAdmin = user?.role === "admin";
  const visible = items.filter((r) =>
    isAdmin ? true : isDonor ? r.donorId === user?.id : r.recipientId === user?.id
  );

  const decide = async (id: number, decision: "approve" | "reject") => {
    setBusyId(id);
    try {
      const updated = await decideRequest(id, decision);
      setItems((current) => current.map((request) => request.id === id ? updated : request));
      if (updated.status === "Waitlisted") {
        toast.error("Not enough inventory for this request; it remains waitlisted.");
      } else {
        toast.success(decision === "approve" ? "Request approved and inventory allocated." : "Request rejected.");
      }
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not update request.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <RoleGate allowedRoles={["donor", "recipient", "admin"]}>
      <AnySession>
        <DashboardLayout title={isAdmin ? "All Requests" : isDonor ? "Incoming Requests" : "My Requests"}>
          {loading ? (
            <div className="py-20 text-center text-sm text-muted-foreground">Loading requests…</div>
          ) : error ? (
            <div className="py-20 text-center text-sm text-destructive">{error}</div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
              <div className="rounded-full bg-secondary p-4 text-3xl">📋</div>
              <p className="font-display text-lg font-semibold text-muted-foreground">Nothing here yet</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                {isDonor ? "When recipients request your resources, they'll appear here." : "Browse the network and request a resource to start."}
              </p>
              <Link href={isDonor ? "/upload" : "/browse"}>
                <Button size="sm" className="mt-2 rounded-lg">{isDonor ? "Upload a Resource" : "Browse Resources"}</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Resource</th>
                    {!isDonor && <th className="px-5 py-3 font-medium">Organization</th>}
                    <th className="px-5 py-3 font-medium">Qty</th>
                    <th className="px-5 py-3 font-medium">Priority</th>
                    <th className="px-5 py-3 font-medium">Reason</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium">{r.resourceTitle}</td>
                      {!isDonor && (
                        <td className="px-5 py-3.5">
                          <p className="text-muted-foreground">{r.recipientOrg}</p>
                          <p className="text-xs text-muted-foreground/70">{r.recipientName}</p>
                        </td>
                      )}
                      <td className="px-5 py-3.5 text-muted-foreground">×{r.quantity}</td>
                      <td className="px-5 py-3.5">
                        <span className={`font-display font-bold tabular-nums ${r.priority >= 90 ? "text-red-600" : r.priority >= 80 ? "text-orange-600" : "text-muted-foreground"}`}>{r.priority}</span>
                      </td>
                      <td className="max-w-[220px] px-5 py-3.5 text-muted-foreground">
                        <p className="line-clamp-2 text-xs">{r.reason}</p>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                      <td className="px-5 py-3.5 text-right">
                        {isDonor && (r.status === "Pending" || r.status === "Waitlisted") ? (
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" variant="outline" disabled={busyId === r.id} className="h-8 rounded-lg px-3 text-xs text-red-600 hover:bg-red-50" onClick={() => decide(r.id, "reject")}>
                              <X className="h-3.5 w-3.5" /> Reject
                            </Button>
                            <Button size="sm" disabled={busyId === r.id} className="h-8 rounded-lg px-3 text-xs" onClick={() => decide(r.id, "approve")}>
                              <Check className="h-3.5 w-3.5" /> Approve
                            </Button>
                          </div>
                        ) : !isDonor && (r.status === "Pending" || r.status === "Waitlisted") ? (
                          <Link href={`/request/${r.resourceId}`}>
                            <Button size="sm" variant="outline" className="h-8 rounded-lg px-3 text-xs">
                              View <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardLayout>
      </AnySession>
    </RoleGate>
  );
}
