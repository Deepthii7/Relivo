/*
 * RELIVO — Resource Matches (Eco-Tech Glasshouse)
 * Inventory matches come from the backend category/location matcher.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { BrainCircuit, ShieldCheck } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { AIBadge } from "@/components/primitives";
import { apiRequest, assetUrl } from "@/lib/api";
import type { Resource } from "@/lib/types";
import ResourceCard from "@/components/shared/ResourceCard";
import { useAuth } from "@/contexts/AuthContext";
import RoleGate, { AnySession } from "@/components/role-gating/RoleGate";

export default function Recommendations() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ location: user?.location ?? "" });
    apiRequest<{ matches: Resource[] }>(`/resources/match?${params}`, { signal: controller.signal })
      .then(({ matches: resources }) => setMatches(resources.map((resource) => ({ ...resource, imageUrl: assetUrl(resource.imageUrl) }))))
      .catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Unable to load resource matches."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [user?.location]);

  return (
    <RoleGate allowedRoles={["recipient", "admin"]}>
      <AnySession>
        <DashboardLayout title="Resource Matches">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-2xl text-sm text-muted-foreground">
              Matches are generated from current SQLite inventory using category and location similarity. Requests that cannot be allocated enter the shared priority queue.
            </p>
            <AIBadge className="text-sm">Live database matching</AIBadge>
          </div>

          {loading ? <p className="py-12 text-center text-sm text-muted-foreground">Finding matching resources…</p> : error ? (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">{error}</p>
          ) : matches.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No resources match your location yet.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {matches.map((resource) => <ResourceCard key={resource.id} resource={resource} highlight />)}
            </div>
          )}

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <SpotlightCard className="glass-card p-6" spotlightColor="rgba(4,108,78,0.1)">
              <div className="mb-3 flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold">How matching works</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The matcher compares resource category and location against the recipient profile, and only returns inventory currently stored by the backend. Search in Browse also checks resource names and descriptions.
              </p>
            </SpotlightCard>
            <SpotlightCard className="glass-card p-6" spotlightColor="rgba(4,108,78,0.1)">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold">Safe allocation</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Request creation is serialized in SQLite. Available quantities are assigned once, duplicates are rejected, and shortages are waitlisted. Queue priority increases by five points for each full day waiting, capped at 100.
              </p>
            </SpotlightCard>
          </div>
        </DashboardLayout>
      </AnySession>
    </RoleGate>
  );
}
