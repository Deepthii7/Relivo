/*
 * RELIVO — Resource card (Eco-Tech Glasshouse)
 * Marketplace-style card: image, category, quantity, condition, distance,
 * status badge + CTA. Used by Browse, dashboards, and details-related flows.
 */
import { Link } from "wouter";
import { MapPin, Package, ArrowRight, Zap } from "lucide-react";
import type { Resource } from "@/lib/mockData";
import { CategoryIcon, ResourceImage, StatusBadge } from "@/components/primitives";
import SpotlightCard from "@/components/reactbits/SpotlightCard";

export default function ResourceCard({ resource, index = 0, highlight = false }: { resource: Resource; index?: number; highlight?: boolean }) {
  return (
    <SpotlightCard
      className="group flex flex-col bg-white transition-transform duration-300 hover:-translate-y-1"
      spotlightColor={highlight ? "rgba(4,108,78,0.22)" : "rgba(4,108,78,0.12)"}
    >
      <div className="flex flex-col">
        <Link href={`/resource/${resource.id}`} className="block">
          <ResourceImage src={resource.imageUrl} alt={resource.title} className="h-40 w-full" />
        </Link>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/resource/${resource.id}`} className="group/title">
              <h3 className="font-display text-base font-semibold leading-snug text-foreground group-hover/title:text-primary transition-colors">
                {resource.title}
              </h3>
            </Link>
            <CategoryIcon category={resource.category} />
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{resource.description}</p>
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" />×{resource.quantity}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{resource.distanceKm} km</span>
            <StatusBadge status={resource.condition} />
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <StatusBadge status={resource.status} />
            <Link
              href={`/request/${resource.id}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-transform duration-200 group-hover:translate-x-0.5"
            >
              {highlight ? <Zap className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
              Request
            </Link>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
