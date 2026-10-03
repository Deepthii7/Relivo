/*
 * RELIVO — Donor Dashboard (Eco-Tech Glasshouse · low/medium animation)
 * CountUp stats, SpotlightCard hover, recent donations + incoming requests tables.
 * Usability-first; no table animation.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Upload, Package, Inbox, CheckCircle2, ArrowRight, Plus, Check, X } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { StatusBadge } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { Request, Resource } from "@/lib/mockData";
import { decideRequest, getRequests, getResources } from "@/lib/api";
import { toast } from "sonner";
import RoleGate from "@/components/role-gating/RoleGate";

export default function DonorDashboard() {
  const { user } = useAuth();
  const userId = user?.id;
  const [resources, setResources] = useState<Resource[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const refreshDashboard = async () => {
    if (userId === undefined) return;
    const [nextResources, nextRequests] = await Promise.all([getResources(), getRequests({ donorId: userId })]);
    setResources(nextResources);
    setRequests(nextRequests);
  };

  useEffect(() => {
    if (userId === undefined) return;
    let active = true;
    Promise.all([getResources(), getRequests({ donorId: userId })])
      .then(([nextResources, nextRequests]) => {
        if (active) {
          setResources(nextResources);
          setRequests(nextRequests);
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load dashboard data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const myDonations = resources.filter((resource) => resource.donorId === user?.id);
  const myRequests = requests.filter((request) => request.donorId === user?.id);
  const queuedRequests = myRequests.filter((request) => request.status === "Pending" || request.status === "Waitlisted");
  const availableResources = myDonations.filter((resource) => resource.status === "Available" && resource.quantity > 0);

  const decide = async (id: number, decision: "approve" | "reject") => {
    setBusyId(id);
    try {
      const updated = await decideRequest(id, decision);
      await refreshDashboard();
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

  const stats = [
    { icon: <Package className="h-4 w-4" />, label: "Total Donations", value: myDonations.length, suffix: "", tone: "text-emerald-700 bg-emerald-50" },
    { icon: <Upload className="h-4 w-4" />, label: "Available Resources", value: availableResources.length, suffix: "", tone: "text-sky-700 bg-sky-50" },
    { icon: <Inbox className="h-4 w-4" />, label: "Pending Requests", value: queuedRequests.length, suffix: "", tone: "text-orange-700 bg-orange-50" },
    { icon: <CheckCircle2 className="h-4 w-4" />, label: "Completed Donations", value: myRequests.filter((request) => request.status === "Completed").length, suffix: "", tone: "text-primary bg-primary/10" },
  ];

  return (
    <RoleGate allowedRoles={["donor"]}>
      <DashboardLayout title={`Welcome back, ${user?.name.split(" ")[0]}`}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <SpotlightCard key={s.label} className="glass-card p-5" spotlightColor="rgba(4,108,78,0.16)">
              <div className="flex items-center justify-between">
                <span className={`inline-flex rounded-lg p-2.5 ${s.tone}`}>{s.icon}</span>
              </div>
              <p className="mt-3 font-display text-2xl font-bold tabular-nums text-foreground">
                {s.value.toLocaleString("en-US")}{s.suffix}
              </p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </SpotlightCard>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Your Donations</h2>
          <Link href="/upload">
            <Button size="sm" className="rounded-lg transition-transform active:scale-[0.97]">
              <Plus className="mr-1 h-4 w-4" /> Upload Resource
            </Button>
          </Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Resource</th>
                <th className="px-5 py-3 font-medium">Quantity</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {myDonations.map((resource) => (
                <tr key={resource.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{resource.title}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">×{resource.quantity}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">—</td>
                  <td className="px-5 py-3.5"><StatusBadge status={resource.status} /></td>
                </tr>
              ))}
              {!loading && myDonations.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-muted-foreground">{error || "No resources found."}</td></tr>
              )}
              {loading && <tr><td colSpan={4} className="px-5 py-6 text-center text-muted-foreground">Loading resources…</td></tr>}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 font-display text-lg font-semibold">Incoming Requests</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Requester</th>
                <th className="px-5 py-3 font-medium">Resource</th>
                <th className="px-5 py-3 font-medium">Qty</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {myRequests.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium">{r.recipientOrg}</p>
                    <p className="text-xs text-muted-foreground">{r.recipientName}</p>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.resourceTitle}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">×{r.quantity}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-display font-semibold tabular-nums ${r.priority >= 90 ? "text-red-600" : r.priority >= 80 ? "text-orange-600" : "text-muted-foreground"}`}>{r.priority}</span>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    {r.status === "Pending" || r.status === "Waitlisted" ? (
                      <div className="flex justify-end gap-1.5">
                        <Link href="/requests">
                          <Button size="sm" variant="outline" className="rounded-lg">
                            Review <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" disabled={busyId === r.id} className="h-8 rounded-lg px-3 text-xs text-red-600 hover:bg-red-50" onClick={() => decide(r.id, "reject")}>
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                        <Button size="sm" disabled={busyId === r.id} className="h-8 rounded-lg px-3 text-xs" onClick={() => decide(r.id, "approve")}>
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
              {!loading && myRequests.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-6 text-center text-muted-foreground">{error || "No incoming requests."}</td></tr>
              )}
              {loading && <tr><td colSpan={6} className="px-5 py-6 text-center text-muted-foreground">Loading requests…</td></tr>}
            </tbody>
          </table>
        </div>
      </DashboardLayout>
    </RoleGate>
  );
}
