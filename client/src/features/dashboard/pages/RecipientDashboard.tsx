/*
 * RELIVO — Recipient Dashboard (Eco-Tech Glasshouse · low/medium animation)
 * Animated stats, spotlight cards, backend-matched resources, and live requests.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { PackageSearch, ListChecks, Sparkles, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";
import { AIBadge, StatusBadge } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, assetUrl } from "@/lib/api";
import type { Resource, ResourceRequest } from "@/lib/types";
import ResourceCard from "@/components/shared/ResourceCard";
import RoleGate from "@/components/role-gating/RoleGate";

export default function RecipientDashboard() {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState<ResourceRequest[]>([]);
  const [myRecommendations, setMyRecommendations] = useState<Resource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pending = myRequests.filter((r) => r.status === "Pending" || r.status === "Waitlisted").length;
  const completed = myRequests.filter((r) => r.status === "Completed").length;

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ location: user?.location ?? "" });
    Promise.all([
      apiRequest<{ requests: ResourceRequest[] }>("/requests", { signal: controller.signal }),
      apiRequest<{ matches: Resource[] }>(`/resources/match?${params}`, { signal: controller.signal }),
    ]).then(([requestResult, matchResult]) => {
      setMyRequests(requestResult.requests);
      setMyRecommendations(matchResult.matches.map((item) => ({ ...item, imageUrl: assetUrl(item.imageUrl) })));
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Unable to load your dashboard.");
    });
    return () => controller.abort();
  }, [user?.location]);

  const stats = [
    { icon: <PackageSearch className="h-4 w-4" />, label: "Resources Available", value: myRecommendations.length, tone: "text-emerald-700 bg-emerald-50" },
    { icon: <Sparkles className="h-4 w-4" />, label: "Resource Matches", value: myRecommendations.length, tone: "text-emerald-700 bg-emerald-50" },
    { icon: <ListChecks className="h-4 w-4" />, label: "Pending Requests", value: pending, tone: "text-orange-700 bg-orange-50" },
    { icon: <CheckCircle2 className="h-4 w-4" />, label: "Completed", value: completed, tone: "text-primary bg-primary/10" },
  ];

  return (
    <RoleGate allowedRoles={["recipient"]}>
      <DashboardLayout title={`Welcome back, ${user?.name.split(" ")[0]}`}>
        {error && <p role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
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

        {/* Matched resources */}
        <div className="mt-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold">Resource Matches for You</h2>
            <AIBadge>Live matches</AIBadge>
          </div>
          <Link href="/recommendations" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:translate-x-0.5 transition-transform">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {myRecommendations.slice(0, 2).map((resource) => <ResourceCard key={resource.id} resource={resource} highlight />)}
          {myRecommendations.length === 0 && <p className="text-sm text-muted-foreground">No matching resources are available yet.</p>}
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
