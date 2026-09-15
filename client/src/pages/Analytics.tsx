/*
 * RELIVO — Analytics & Reports (Eco-Tech Glasshouse · medium animation)
 * Professional, data-driven: CountUp KPIs + Recharts with subtle entrance.
 */
import { Package, CheckCircle2, Inbox, Sparkles, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, Legend,
} from "recharts";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";
import { AIBadge } from "@/components/primitives";
import { ANALYTICS } from "@/lib/mockData";

export default function Analytics() {
  const kpis = [
    { icon: <Package className="h-4 w-4" />, label: "Total Resources", value: ANALYTICS.stats.totalResources, tone: "text-emerald-700 bg-emerald-50" },
    { icon: <CheckCircle2 className="h-4 w-4" />, label: "Completed Donations", value: ANALYTICS.stats.completedDonations, tone: "text-primary bg-primary/10" },
    { icon: <Inbox className="h-4 w-4" />, label: "Pending Requests", value: ANALYTICS.stats.pendingRequests, tone: "text-orange-700 bg-orange-50" },
    { icon: <Sparkles className="h-4 w-4" />, label: "AI Matches Generated", value: ANALYTICS.stats.aiMatchesGenerated, tone: "text-emerald-700 bg-emerald-50" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="page-header">
          <div className="container py-12 pt-24 md:pt-28">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="mb-2 inline-flex items-center gap-1.5 rounded-full ai-chip px-3 py-1 text-xs font-semibold"><Sparkles className="h-3 w-3" /> Intelligence Console</p>
                <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Analytics & Reports</h1>
                <p className="mt-2 max-w-2xl text-base text-muted-foreground">
                  The network's pulse — circulation trends, category demand, utilization and AI demand forecasts.
                </p>
              </div>
              <AIBadge className="text-sm">AI demand prediction active</AIBadge>
            </div>
          </div>
        </div>

        <div className="container py-10">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((k) => (
              <SpotlightCard key={k.label} className="glass-card p-5" spotlightColor="rgba(4,108,78,0.14)">
                <span className={`inline-flex rounded-lg p-2.5 ${k.tone}`}>{k.icon}</span>
                <p className="stat-num mt-3 text-3xl">
                  <CountUp from={0} to={k.value} duration={1.3} separator="," />
                </p>
                <p className="text-sm text-muted-foreground">{k.label}</p>
              </SpotlightCard>
            ))}
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            <SpotlightCard className="glass-card p-6" spotlightColor="rgba(4,108,78,0.14)">
              <h3 className="mb-4 font-display font-semibold">Donations vs Requests — Monthly</h3>
              <div className="h-64">
                <BarChart width={720} height={264} data={ANALYTICS.monthlyDonations} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
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
                    <Pie data={ANALYTICS.categoryDistribution} dataKey="value" nameKey="name" outerRadius={95} paddingAngle={2} strokeWidth={0} label={(e: { name: string }) => e.name}>
                      {ANALYTICS.categoryDistribution.map((c) => (
                        <Cell key={c.name} fill={c.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                  </PieChart>
              </div>
            </SpotlightCard>

            <SpotlightCard className="glass-card p-6" spotlightColor="rgba(4,108,78,0.14)">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display font-semibold">AI Demand Prediction — Next 6 Months</h3>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><TrendingUp className="h-3.5 w-3.5" />Forecast</span>
              </div>
              <div className="h-64">
                <LineChart width={720} height={264} data={ANALYTICS.demandPrediction} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                    <Line type="monotone" dataKey="demand" name="Predicted demand index" stroke="oklch(0.5 0.1 163)" strokeWidth={3} dot={{ r: 4, fill: "oklch(0.5 0.1 163)" }} />
                  </LineChart>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Projected from historical donation & request patterns (regression model).</p>
            </SpotlightCard>

            <SpotlightCard className="glass-card p-6" spotlightColor="rgba(4,108,78,0.14)">
              <h3 className="mb-4 font-display font-semibold">Most Requested Resources</h3>
              <div className="h-64">
                <BarChart width={720} height={264} data={ANALYTICS.mostRequested} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
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
