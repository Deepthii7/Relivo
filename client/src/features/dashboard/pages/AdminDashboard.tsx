/*
 * RELIVO — Admin Dashboard (Eco-Tech Glasshouse · professional, info-dense)
 * CountUp KPIs, spotlight cards, Recharts mini-charts with entrance, system activity.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Users, Package, Inbox, CheckCircle2, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";
import { StatusBadge } from "@/components/primitives";
import { apiRequest } from "@/lib/api";
import type { ResourceRequest } from "@/lib/types";
import { LoadingState } from "@/components/primitives";
import RoleGate from "@/components/role-gating/RoleGate";

interface AnalyticsData {
  stats: { totalUsers: number; totalResources: number; pendingRequests: number; completedDonations: number; utilizationRate: number };
  monthlyDonations: { month: string; donations: number; requests: number }[];
  statusBreakdown: { name: string; value: number }[];
}

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      apiRequest<AnalyticsData>("/analytics", { signal: controller.signal }),
      apiRequest<{ requests: ResourceRequest[] }>("/requests", { signal: controller.signal }),
    ]).then(([analyticsResult, requestResult]) => {
      setAnalytics(analyticsResult);
      setRequests(requestResult.requests);
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Unable to load the system overview.");
    });
    return () => controller.abort();
  }, []);

  if (error) return <RoleGate allowedRoles={["admin"]}><DashboardLayout title="System Overview"><p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">{error}</p></DashboardLayout></RoleGate>;
  if (!analytics) return <LoadingState label="Loading system overview…" />;

  const kpis = [
    { icon: <Users className="h-4 w-4" />, label: "Total Users", value: analytics.stats.totalUsers, tone: "text-emerald-700 bg-emerald-50" },
    { icon: <Package className="h-4 w-4" />, label: "Total Resources", value: analytics.stats.totalResources, tone: "text-sky-700 bg-sky-50" },
    { icon: <Inbox className="h-4 w-4" />, label: "Pending Requests", value: analytics.stats.pendingRequests, tone: "text-orange-700 bg-orange-50" },
    { icon: <CheckCircle2 className="h-4 w-4" />, label: "Completed Donations", value: analytics.stats.completedDonations, tone: "text-primary bg-primary/10" },
  ];

  return (
    <RoleGate allowedRoles={["admin"]}>
      <DashboardLayout title="System Overview">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => (
            <SpotlightCard key={k.label} className="glass-card p-5" spotlightColor="rgba(4,108,78,0.16)">
              <span className={`inline-flex rounded-lg p-2.5 ${k.tone}`}>{k.icon}</span>
              <p className="mt-3 font-display text-2xl font-bold tabular-nums">
                <CountUp from={0} to={k.value} duration={1.2} separator="," />
              </p>
              <p className="text-sm text-muted-foreground">{k.label}</p>
            </SpotlightCard>
          ))}
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-5">
          <SpotlightCard className="glass-card p-5 xl:col-span-3" spotlightColor="rgba(4,108,78,0.08)">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display font-semibold">Donations & Requests — 6 months</h3>
              <Link href="/analytics" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Full report <ArrowRight className="h-3 w-3" /></Link>
            </div>
            <div className="h-56">
              <BarChart width={720} height={264} data={analytics.monthlyDonations} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "oklch(0.945 0.02 160 / 0.5)" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                  <Bar dataKey="donations" name="Donations" fill="oklch(0.5 0.1 163)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="requests" name="Requests" fill="oklch(0.68 0.11 160)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
            </div>
          </SpotlightCard>

          <SpotlightCard className="glass-card p-5 xl:col-span-2" spotlightColor="rgba(4,108,78,0.08)">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display font-semibold">Resource Utilization</h3>
              <span className="font-display text-xl font-bold text-primary"><CountUp from={0} to={analytics.stats.utilizationRate} duration={1.2} />%</span>
            </div>
            <div className="h-56">
              <PieChart width={720} height={264}>
                  <Pie data={analytics.statusBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                    {analytics.statusBreakdown.map((s, i) => (
                      <Cell key={s.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                </PieChart>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {analytics.statusBreakdown.map((s, index) => (
                <span key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />{s.name}
                </span>
              ))}
            </div>
          </SpotlightCard>
        </div>

        <h2 className="mt-10 font-display text-lg font-semibold">Recent Request Activity</h2>
        <div className="mt-4 rounded-xl border border-border bg-white">
          <ul>
            {requests.slice(0, 6).map((request) => (
              <li key={request.id} className="flex items-center gap-4 border-b border-border/60 px-5 py-3.5 last:border-0">
                <span className="w-28 shrink-0 text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleDateString()}</span>
                <StatusBadge status={request.status} />
                <span className="text-sm">{request.resourceTitle} ×{request.quantity} requested by {request.recipientOrg}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {requests.filter((r) => r.status === "Pending" || r.status === "Waitlisted" || r.status === "Allocated").slice(0, 3).map((r) => (
            <SpotlightCard key={r.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Priority {r.priority}</p>
                  <p className="font-display font-semibold">{r.resourceTitle} ×{r.quantity}</p>
                  <p className="text-sm text-muted-foreground">{r.recipientOrg}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            </SpotlightCard>
          ))}
        </div>
      </DashboardLayout>
    </RoleGate>
  );
}
