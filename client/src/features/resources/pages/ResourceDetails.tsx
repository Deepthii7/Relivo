/*
 * RELIVO — Resource Details (Eco-Tech Glasshouse · medium animation)
 * Image with subtle hover lift, full resource metadata, donor card, clear CTA.
 */
import { Link, useParams } from "wouter";
import { ArrowLeft, MapPin, Package, Tag, User, Clock, TrendingUp, Zap } from "lucide-react";
import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";
import { Button } from "@/components/ui/button";
import { StatusBadge, CategoryIcon, ResourceImage } from "@/components/primitives";
import { RESOURCES } from "@/lib/mockData";
import NotFound from "@/features/dashboard/pages/NotFound";

export default function ResourceDetails() {
  const params = useParams<{ id: string }>();
  const resource = RESOURCES.find((r) => String(r.id) === params.id);

  if (!resource) return <NotFound />;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8 pt-24">
          <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Browse
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="group overflow-hidden rounded-3xl border border-border bg-white shadow-lg shadow-emerald-900/5">
                <ResourceImage src={resource.imageUrl} alt={resource.title} className="h-[380px] w-full transition-transform duration-500 group-hover:scale-[1.02]" />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: <Package className="h-4 w-4" />, label: "Quantity", value: `×${resource.quantity}` },
                  { icon: <Tag className="h-4 w-4" />, label: "Category", value: resource.category },
                  { icon: <MapPin className="h-4 w-4" />, label: "Location", value: `${resource.distanceKm} km` },
                  { icon: <Clock className="h-4 w-4" />, label: "Uploaded", value: `${resource.uploadedDaysAgo}d ago` },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-border bg-white p-4">
                    <span className="text-primary">{m.icon}</span>
                    <p className="mt-2 text-xs text-muted-foreground">{m.label}</p>
                    <p className="font-display text-sm font-semibold">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-border bg-white p-7 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="font-display text-2xl font-bold leading-tight">{resource.title}</h1>
                  <CategoryIcon category={resource.category} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={resource.status} />
                  <StatusBadge status={resource.condition} />
                </div>
                <p className="mt-4 leading-relaxed text-muted-foreground">{resource.description}</p>

                <div className="mt-6 rounded-xl bg-secondary/50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <User className="h-4 w-4 text-primary" /> Donated by
                  </p>
                  <p className="mt-1 font-medium">{resource.donorName}</p>
                  <p className="text-sm text-muted-foreground">{resource.donorOrg}</p>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50/70 p-4 text-sm text-emerald-800">
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  <span><strong>{resource.requestedCount}</strong> organizations have already requested this resource</span>
                </div>

                <div className="mt-6 space-y-3">
                  {resource.status === "Available" ? (
                    <Link href={`/request/${resource.id}`}>
                      <Button size="lg" className="w-full rounded-xl text-base transition-transform active:scale-[0.97]">
                        <Zap className="mr-1.5 h-4 w-4" /> Request This Resource
                      </Button>
                    </Link>
                  ) : (
                    <Button size="lg" disabled className="w-full rounded-xl text-base">
                      Currently {resource.status}
                    </Button>
                  )}
                  <p className="text-center text-xs text-muted-foreground">
                    Requests are evaluated by the AI engine and ordered by the priority queue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
