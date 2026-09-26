/*
 * RELIVO — Admin Dashboard (Eco-Tech Glasshouse · professional, info-dense)
 * CountUp KPIs, spotlight cards, Recharts mini-charts with entrance, system activity.
 */
import { Link } from "wouter";
import { Users, Package, Inbox, CheckCircle2, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";
import { StatusBadge } from "@/components/primitives";
import { ANALYTICS, REQUESTS } from "@/lib/mockData";
import RoleGate from "@/components/role-gating/RoleGate";

const ACTIVITY = [
  { time: "09:12", event: "Request #1 approved — Refurbished Laptops ×10 → Government School No. 47", tag: "approved" },
  { time: "08:30", event: "AI engine generated 3 new recipient recommendations", tag: "ai" },
  { time: "08:02", event: "Resource 'Stationery Bulk Lot' uploaded by City Central Library", tag: "upload" },
  { time: "Yesterday", event: "Reservation timeout released 'Office Chairs' back to Available (deadlock prevention)", tag: "timeout" },
  { time: "Yesterday", event: "Simultaneous-request synchronization: 1 request waitlisted for 'Office Chairs'", tag: "sync" },
  { time: "Aug 13", event: "Pickup scheduled for Sports Equipment Bundle ×60", tag: "pickup" },
];

export default function AdminDashboard() {
  const kpis = [
    { icon: <Users className="h-4 w-4" />, label: "Total Users", value: ANALYTICS.stats.totalUsers, tone: "text-emerald-700 bg-emerald-50" },
    { icon: <Package className="h-4 w-4" />, label: "Total Resources", value: ANALYTICS.stats.totalResources, tone: "text-sky-700 bg-sky-50" },
    { icon: <Inbox className="h-4 w-4" />, label: "Pending Requests", value: ANALYTICS.stats.pendingRequests, tone: "text-orange-700 bg-orange-50" },
    { icon: <CheckCircle2 className="h-4 w-4" />, label: "Completed Donations", value: ANALYTICS.stats.completedDonations, tone: "text-primary bg-primary/10" },
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
              <BarChart width={720} height={264} data={ANALYTICS.monthlyDonations} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
              <span className="font-display text-xl font-bold text-primary"><CountUp from={0} to={ANALYTICS.stats.utilizationRate} duration={1.2} />%</span>
            </div>
            <div className="h-56">
              <PieChart width={720} height={264}>
                  <Pie data={ANALYTICS.statusBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                    {ANALYTICS.statusBreakdown.map((s, i) => (
                      <Cell key={s.name} fill={s.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                </PieChart>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {ANALYTICS.statusBreakdown.map((s) => (
                <span key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.fill }} />{s.name}
                </span>
              ))}
            </div>
          </SpotlightCard>
        </div>

        <h2 className="mt-10 font-display text-lg font-semibold">System Activity</h2>
        <div className="mt-4 rounded-xl border border-border bg-white">
          <ul>
            {ACTIVITY.map((a, i) => (
              <li key={i} className="flex items-center gap-4 border-b border-border/60 px-5 py-3.5 last:border-0">
                <span className="w-20 shrink-0 text-xs text-muted-foreground">{a.time}</span>
                <StatusBadge status={
                  a.tag === "approved" ? "Approved" :
                  a.tag === "ai" ? "Completed" :
                  a.tag === "timeout" ? "Available" :
                  a.tag === "sync" ? "Waitlisted" : "Pickup Scheduled"
                } />
                <span className="text-sm">{a.event}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {REQUESTS.filter((r) => r.status === "Pending").slice(0, 3).map((r) => (
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
