/*
 * RELIVO — Recipient Dashboard (Eco-Tech Glasshouse · low/medium animation)
 * Animated stats, spotlight cards, AI recommendation strip that visually
 * stands out from normal resources (gradient border + AI badge).
 */
import { Link } from "wouter";
import { PackageSearch, ListChecks, Sparkles, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";
import { AIBadge, StatusBadge } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { REQUESTS, AI_RECOMMENDATIONS } from "@/lib/mockData";
import RoleGate from "@/components/RoleGate";

export default function RecipientDashboard() {
  const { user } = useAuth();
  const myRequests = REQUESTS.filter((r) => r.recipientId === user?.id);
  const pending = myRequests.filter((r) => r.status === "Pending").length;
  const approved = myRequests.filter((r) => r.status === "Approved" || r.status === "Reserved" || r.status === "Pickup Scheduled").length;
  const completed = myRequests.filter((r) => r.status === "Completed").length;
  const myRecommendations = AI_RECOMMENDATIONS.slice(0, 2);

  const stats = [
    { icon: <PackageSearch className="h-4 w-4" />, label: "Resources Available", value: 11, tone: "text-emerald-700 bg-emerald-50" },
    { icon: <Sparkles className="h-4 w-4" />, label: "AI Matches for You", value: 4, tone: "text-emerald-700 bg-emerald-50" },
    { icon: <ListChecks className="h-4 w-4" />, label: "Pending Requests", value: pending, tone: "text-orange-700 bg-orange-50" },
    { icon: <CheckCircle2 className="h-4 w-4" />, label: "Completed", value: completed, tone: "text-primary bg-primary/10" },
  ];

  return (
    <RoleGate allowedRoles={["recipient"]}>
      <DashboardLayout title={`Welcome back, ${user?.name.split(" ")[0]}`}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <SpotlightCard key={s.label} className="glass-card p-5" spotlightColor="rgba(4,108,78,0.16)">
              <span className={`inline-flex rounded-lg p-2.5 ${s.tone}`}>{s.icon}</span>
              <p className="mt-3 font-display text-2xl font-bold tabular-nums">
                <CountUp from={0} to={s.value} duration={1.1} />
              </p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </SpotlightCard>
          ))}
        </div>

        {/* AI recommendations — visually distinct */}
        <div className="mt-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold">AI Recommendations for You</h2>
            <AIBadge>Engine Active</AIBadge>
          </div>
          <Link href="/recommendations" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:translate-x-0.5 transition-transform">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {myRecommendations.map((rec) => (
            <div key={rec.id} className="relative rounded-2xl border-2 border-transparent bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 p-[2px] shadow-lg shadow-emerald-900/10">
              <div className="rounded-[14px] glass-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Match for</p>
                    <p className="font-display font-semibold">{rec.resourceTitle}</p>
                    <p className="text-sm text-muted-foreground">{rec.recipientOrg}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-3xl font-bold tabular-nums text-primary">
                      <CountUp from={0} to={rec.score} duration={1.2} />
                    </p>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">match score</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {rec.reasons.slice(0, 2).map((reason) => (
                    <span key={reason} className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800">✓ {reason}</span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{rec.distanceKm} km away</span>
                    <span>×{rec.quantityRequired} needed</span>
                    <span className="flex items-center gap-1 font-medium text-orange-700"><Zap className="h-3 w-3" />{rec.urgency}</span>
                  </div>
                  <Link href={`/request/${1}`}>
                    <Button size="sm" className="rounded-lg transition-transform active:scale-[0.97]">Request</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-10 font-display text-lg font-semibold">Your Requests</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Resource</th>
                <th className="px-5 py-3 font-medium">Qty</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {myRequests.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{r.resourceTitle}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">×{r.quantity}</td>
                  <td className="px-5 py-3.5 font-display font-semibold tabular-nums">{r.priority}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardLayout>
    </RoleGate>
  );
}
