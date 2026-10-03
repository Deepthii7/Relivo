/*
 * RELIVO — AI Recommendations (Eco-Tech Glasshouse · medium/high animation)
 * Feels intelligent, not gimmicky: spotlight cards, gradient "computed" borders,
 * CountUp scores, reason chips, demand/urgency/distance metadata.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Sparkles, Zap, MapPin, Package, History, ArrowRight, BrainCircuit, ShieldCheck } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";
import { AIBadge } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { getRecommendations, type Recommendation } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import RoleGate, { AnySession } from "@/components/role-gating/RoleGate";
import { LoadingState } from "@/components/primitives";

const DRAIN = { High: "text-emerald-700 bg-emerald-50", Medium: "text-orange-700 bg-orange-50", Low: "text-slate-600 bg-slate-100" };
const URGENCY = { low: "text-sky-700 bg-sky-50", normal: "text-orange-700 bg-orange-50", high: "text-red-700 bg-red-50" };

export default function Recommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || (user.role !== "recipient" && user.role !== "admin")) return;
    let active = true;
    setLoading(true);
    getRecommendations(user.role === "recipient" ? user.id : undefined)
      .then((items) => {
        if (active) setRecommendations(items);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load recommendations.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <RoleGate allowedRoles={["recipient", "admin"]}>
      <AnySession>
        <DashboardLayout title="AI Recommendations">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-2xl text-sm text-muted-foreground">
              Recommendations use your persisted request categories, quantities and urgency. Distance and donation history are shown only when verified backend data is available.
            </p>
            <AIBadge className="text-sm">Explainable recommendation scoring</AIBadge>
          </div>

          <div className="space-y-5">
            {loading ? (
              <LoadingState label="Loading recommendations…" />
            ) : error ? (
              <div className="py-12 text-center text-sm text-destructive">{error}</div>
            ) : recommendations.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">No recommendations are available yet.</div>
            ) : recommendations.map((rec) => (
              <SpotlightCard key={rec.id} className="border border-emerald-200/60 bg-white" spotlightColor="rgba(4,108,78,0.16)">
                <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center">
                  <div className="flex items-center gap-5 lg:w-44 lg:shrink-0">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-emerald-100 bg-gradient-to-br from-emerald-50 to-amber-50">
                      <p className="font-display text-2xl font-bold text-primary tabular-nums">
                        <CountUp from={0} to={rec.score} duration={1.4} />
                      </p>
                      <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-orange-500" />
                    </div>
                    <div className="lg:hidden">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Match score</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg font-bold">{rec.recipientOrg}</h2>
                      <AIBadge>Recommended</AIBadge>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${URGENCY[rec.urgency]}`}>
                        <Zap className="mr-1 inline h-3 w-3" />{rec.urgency[0].toUpperCase() + rec.urgency.slice(1)} urgency
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Matched for: <strong className="text-foreground">{rec.resourceTitle} (×{rec.availableQuantity})</strong> · {rec.recipientName}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {rec.reasons.map((r) => (
                        <span key={r} className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">✓ {r}</span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 lg:w-72 lg:shrink-0">
                    <div className="rounded-xl bg-secondary/50 p-3">
                      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground"><MapPin className="h-3 w-3" />Distance</p>
                      <p className="font-display text-sm font-bold">{rec.distanceKm === null ? "Unavailable" : `${rec.distanceKm} km`}</p>
                    </div>
                    <div className="rounded-xl bg-secondary/50 p-3">
                      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground"><Package className="h-3 w-3" />Needed</p>
                      <p className="font-display text-sm font-bold">×{rec.quantityRequired}</p>
                    </div>
                    <div className="rounded-xl bg-secondary/50 p-3">
                      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">Demand</p>
                      <p className={`font-display text-sm font-bold ${DRAIN[rec.demandLevel].split(" ")[0]}`}>{rec.demandLevel}</p>
                    </div>
                    <div className="rounded-xl bg-secondary/50 p-3">
                      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground"><History className="h-3 w-3" />Past donations</p>
                      <p className="font-display text-sm font-bold">{rec.previousDonations === null ? "Unavailable" : rec.previousDonations}</p>
                    </div>
                  </div>

                  <Link href={`/request/${rec.resourceId}`} className="lg:shrink-0">
                    <Button className="rounded-lg transition-transform active:scale-[0.97]">
                      Request <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </SpotlightCard>
            ))}
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <SpotlightCard className="glass-card p-6" spotlightColor="rgba(4,108,78,0.1)">
              <div className="mb-3 flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold">How the score is computed</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The 0–100 recommendation score weights category fit (40%), quantity coverage (40%) and urgency (20%). It is separate from the request queue priority, which continues to use backend urgency and waiting-time aging.
              </p>
            </SpotlightCard>
            <SpotlightCard className="glass-card p-6" spotlightColor="rgba(4,108,78,0.1)">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold">Safe allocation</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Donor approvals use the existing backend decision workflow, which conditionally decrements inventory to prevent concurrent approvals from over-allocating resources.
              </p>
            </SpotlightCard>
          </div>
        </DashboardLayout>
      </AnySession>
    </RoleGate>
  );
}
