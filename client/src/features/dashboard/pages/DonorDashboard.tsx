/*
 * RELIVO — Donor Dashboard (Eco-Tech Glasshouse · low/medium animation)
 * CountUp stats, SpotlightCard hover, recent donations + incoming requests tables.
 * Usability-first; no table animation.
 */
import { Link } from "wouter";
import { Upload, Package, Inbox, CheckCircle2, ArrowRight, Plus } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";
import { StatusBadge } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { DONATIONS, REQUESTS } from "@/lib/mockData";
import RoleGate from "@/components/RoleGate";

export default function DonorDashboard() {
  const { user } = useAuth();
  const myDonations = DONATIONS.filter((d) => d.donorId === user?.id);
  const myRequests = REQUESTS.filter((r) => myDonations.some((d) => d.resourceTitle === r.resourceTitle));

  const stats = [
    { icon: <Package className="h-4 w-4" />, label: "Total Donations", value: 3, suffix: "", tone: "text-emerald-700 bg-emerald-50" },
    { icon: <Upload className="h-4 w-4" />, label: "Available Resources", value: 2, suffix: "", tone: "text-sky-700 bg-sky-50" },
    { icon: <Inbox className="h-4 w-4" />, label: "Pending Requests", value: myRequests.filter((r) => r.status === "Pending").length, suffix: "", tone: "text-orange-700 bg-orange-50" },
    { icon: <CheckCircle2 className="h-4 w-4" />, label: "Completed Donations", value: 1, suffix: "", tone: "text-primary bg-primary/10" },
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
                <CountUp from={0} to={s.value} duration={1.1} />{s.suffix}
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
              {myDonations.map((d) => (
                <tr key={d.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{d.resourceTitle}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">×{d.quantity}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{d.date}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
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
                    {r.status === "Pending" && (
                      <Link href={`/request/${r.resourceId}`}>
                        <Button size="sm" variant="outline" className="rounded-lg">
                          Review <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardLayout>
    </RoleGate>
  );
}
