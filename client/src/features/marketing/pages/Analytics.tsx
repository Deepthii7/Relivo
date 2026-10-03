/*
 * RELIVO — Analytics & Reports (Eco-Tech Glasshouse · medium animation)
 * Professional, data-driven: CountUp KPIs + Recharts with subtle entrance.
 */
import { useEffect, useState } from "react";
import { Package, CheckCircle2, Inbox } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";
import { LoadingState } from "@/components/primitives";
import { apiRequest } from "@/lib/api";

interface AnalyticsData {
  stats: { totalUsers: number; totalResources: number; pendingRequests: number; completedDonations: number; utilizationRate: number };
  monthlyDonations: { month: string; donations: number; requests: number }[];
  categoryDistribution: { name: string; value: number }[];
  statusBreakdown: { name: string; value: number }[];
  mostRequested: { name: string; count: number }[];
}

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<AnalyticsData>("/analytics", { signal: controller.signal })
      .then(setAnalytics)
      .catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Unable to load analytics."); });
    return () => controller.abort();
  }, []);

  if (error) return <div className="min-h-screen"><SiteHeader /><main className="container py-32 text-center"><p className="font-semibold text-destructive">Analytics could not be loaded</p><p className="mt-2 text-sm text-muted-foreground">{error}</p></main><SiteFooter /></div>;
  if (!analytics) return <LoadingState label="Loading network analytics…" />;

  const kpis = [
    { icon: <Package className="h-4 w-4" />, label: "Total Resources", value: analytics.stats.totalResources, tone: "text-emerald-700 bg-emerald-50" },
    { icon: <CheckCircle2 className="h-4 w-4" />, label: "Completed Donations", value: analytics.stats.completedDonations, tone: "text-primary bg-primary/10" },
    { icon: <Inbox className="h-4 w-4" />, label: "Pending Requests", value: analytics.stats.pendingRequests, tone: "text-orange-700 bg-orange-50" },
    { icon: <Package className="h-4 w-4" />, label: "Inventory Utilization", value: analytics.stats.utilizationRate, suffix: "%", tone: "text-emerald-700 bg-emerald-50" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="page-header">
          <div className="container py-12 pt-24 md:pt-28">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="mb-2 inline-flex items-center gap-1.5 rounded-full ai-chip px-3 py-1 text-xs font-semibold"><Package className="h-3 w-3" /> Network Intelligence</p>
                <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Analytics & Reports</h1>
                <p className="mt-2 max-w-2xl text-base text-muted-foreground">
                  The network's pulse — persisted resource circulation, current inventory utilization and request demand.
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">Live database metrics</span>
            </div>
          </div>
        </div>

        <div className="container py-10">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((k) => (
              <SpotlightCard key={k.label} className="glass-card p-5" spotlightColor="rgba(4,108,78,0.14)">
                <span className={`inline-flex rounded-lg p-2.5 ${k.tone}`}>{k.icon}</span>
                <p className="stat-num mt-3 text-3xl">
                  <CountUp from={0} to={k.value} duration={1.3} separator="," />{k.suffix}
                </p>
                <p className="text-sm text-muted-foreground">{k.label}</p>
              </SpotlightCard>
            ))}
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            <SpotlightCard className="glass-card p-6" spotlightColor="rgba(4,108,78,0.14)">
              <h3 className="mb-4 font-display font-semibold">Donations vs Requests — Monthly</h3>
              <div className="h-64">
                <BarChart width={720} height={264} data={analytics.monthlyDonations} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "oklch(0.945 0.02 160 / 0.5)" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="donations" name="Donations" fill="oklch(0.5 0.1 163)" radius={[6, 6, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="requests" name="Requests" fill="oklch(0.68 0.11 160)" radius={[6, 6, 0, 0]} maxBarSize={30} />
                  </BarChart>
              </div>
            </SpotlightCard>

            <SpotlightCard className="glass-card p-6" spotlightColor="rgba(4,108,78,0.14)">
              <h3 className="mb-4 font-display font-semibold">Resource Distribution by Category</h3>
              <div className="h-64">
                <PieChart width={720} height={264}>
                    <Pie data={analytics.categoryDistribution} dataKey="value" nameKey="name" outerRadius={95} paddingAngle={2} strokeWidth={0} label={(e: { name: string }) => e.name}>
                      {analytics.categoryDistribution.map((c, index) => (
                        <Cell key={c.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                  </PieChart>
              </div>
            </SpotlightCard>

            <SpotlightCard className="glass-card p-6" spotlightColor="rgba(4,108,78,0.14)">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display font-semibold">Resources by Current Status</h3>
              </div>
              <div className="h-64">
                <PieChart width={720} height={264}>
                  <Pie data={analytics.statusBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={92} paddingAngle={3} strokeWidth={0}>
                    {analytics.statusBreakdown.map((status, index) => <Cell key={status.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                </PieChart>
              </div>
            </SpotlightCard>

            <SpotlightCard className="glass-card p-6" spotlightColor="rgba(4,108,78,0.14)">
              <h3 className="mb-4 font-display font-semibold">Most Requested Resources</h3>
              <div className="h-64">
                <BarChart width={720} height={264} data={analytics.mostRequested} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip cursor={{ fill: "oklch(0.945 0.02 160 / 0.5)" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                    <Bar dataKey="count" name="Requests" fill="oklch(0.62 0.12 40)" radius={[0, 6, 6, 0]} maxBarSize={24} />
                  </BarChart>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
