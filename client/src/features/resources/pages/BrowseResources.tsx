/*
 * RELIVO — Browse Resources (Eco-Tech Glasshouse · medium animation)
 * Marketplace/catalog feel: search, category/condition/location filters,
 * resource grid with spotlight hover and staggered entrance. Not e-commerce.
 */
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";
import ResourceCard from "@/components/shared/ResourceCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, CONDITIONS } from "@/lib/constants";
import { apiRequest, assetUrl } from "@/lib/api";
import type { Resource } from "@/lib/types";

export default function BrowseResources() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [condition, setCondition] = useState("Any");
  const [avail, setAvail] = useState("Any");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (category !== "All") params.set("category", category);
      if (condition !== "Any") params.set("condition", condition);
      if (avail !== "Any") params.set("status", avail);
      apiRequest<{ resources: Resource[] }>(`/resources?${params}`, { signal: controller.signal })
        .then(({ resources: results }) => setResources(results.map((item) => ({ ...item, imageUrl: assetUrl(item.imageUrl) }))))
        .catch((reason: unknown) => {
          if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Unable to load resources.");
        })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, search ? 250 : 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [search, category, condition, avail, retry]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="page-header">
          <div className="container py-12 pt-24 md:pt-28">
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full ai-chip px-3 py-1 text-xs font-semibold"><span>✦</span> Live network inventory</p>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Browse Resources</h1>
            <p className="mt-2 max-w-2xl text-base text-muted-foreground">
              A network of reusable resources waiting for a second life — laptops, books, furniture, equipment and more. Find what your organization needs and request it.
            </p>
          </div>
        </div>

        <div className="container py-8">
          <div className="flex flex-col gap-3 rounded-2xl glass-panel p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search resources, categories, descriptions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl bg-white/90 pl-9 shadow-inner shadow-emerald-900/5"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl bg-white/90 [width:168px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c === "All" ? "All categories" : c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="rounded-lg bg-background [width:142px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any">Any condition</SelectItem>
                  {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={avail} onValueChange={setAvail}>
                <SelectTrigger className="rounded-lg bg-background [width:142px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any">Any status</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Allocated">Allocated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            {resources.length} resource{resources.length === 1 ? "" : "s"} match your filters
          </p>

          {loading ? (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
                  <div className="mb-3 h-36 rounded-lg bg-muted" />
                  <div className="h-4 w-3/4 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="font-medium text-destructive">Resources could not be loaded</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              <button className="mt-3 text-sm font-semibold text-primary hover:underline" onClick={() => setRetry((value) => value + 1)}>Try again</button>
            </div>
          ) : resources.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="rounded-full bg-secondary p-4 text-3xl">🔍</div>
              <h2 className="font-display text-lg font-semibold">No resources found</h2>
              <p className="max-w-sm text-sm text-muted-foreground">Try adjusting your search or filters — new resources join the network every day.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {resources.map((r, i) => (
                <div key={r.id} className="rise-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <ResourceCard resource={r} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
