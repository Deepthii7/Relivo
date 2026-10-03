/*
 * ReUseNet AI — Landing page (Eco-Tech Glasshouse · highest animation level)
 * Effects used: Aurora (bg), SplitText (hero), BlurText (subtitle), ShinyText (eyebrow),
 * CountUp (stats), AnimatedContent (rows), SpotlightCard + GlareHover (cards), Magnet (CTA),
 * ScrollReveal (sections). Keep motion purposeful — no constant backgrounds on content.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight, BrainCircuit, ListOrdered, Network, Database, Cpu, Recycle,
  HandHeart, Building2, Leaf, TrendingUp, Truck, CheckCircle2, Layers,
} from "lucide-react";
import MarketingLayout from "@/components/layouts/MarketingLayout";
import Aurora from "@/components/reactbits/Aurora";
import SplitText from "@/components/reactbits/SplitText";
import BlurText from "@/components/reactbits/BlurText";
import ScrollReveal from "@/components/reactbits/ScrollReveal";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import GlareHover from "@/components/reactbits/GlareHover";
import CountUp from "@/components/reactbits/CountUp";
import AnimatedContent from "@/components/reactbits/AnimatedContent";
import Magnet from "@/components/reactbits/Magnet";
import ShinyText from "@/components/reactbits/ShinyText";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

const HERO_IMG = "/manus-storage/reusenet-hero_e6fe6164.png";
const AI_BRAIN_IMG = "/manus-storage/reusenet-ai-brain_1c783303.png";
const COMMUNITY_IMG = "/manus-storage/reusenet-community_fd23ed55.png";

const STATS = [
  { key: "totalResources", suffix: "", label: "Resources listed" },
  { key: "totalUsers", suffix: "", label: "Connected organizations" },
  { key: "completedDonations", suffix: "", label: "Completed requests" },
  { key: "utilizationRate", suffix: "%", label: "Inventory utilization" },
];

const FEATURES = [
  { icon: <BrainCircuit className="h-5 w-5" />, title: "Resource Matching", desc: "Category and location similarity match recipient profiles against currently available database inventory." },
  { icon: <TrendingUp className="h-5 w-5" />, title: "Live Inventory Signals", desc: "Analytics summarize actual resources, requests, categories and current inventory utilization." },
  { icon: <ListOrdered className="h-5 w-5" />, title: "Priority & Aging", desc: "Urgent requests start with higher priority, while queue age increases priority over time to prevent starvation." },
  { icon: <Cpu className="h-5 w-5" />, title: "Synchronized Allocation", desc: "Serialized SQLite transactions prevent duplicate requests and stop concurrent requests from over-allocating inventory." },
];

const STEPS = [
  { icon: <HandHeart className="h-5 w-5" />, title: "Donors upload", desc: "List unused laptops, books, furniture or materials with quantity, condition and location." },
  { icon: <Building2 className="h-5 w-5" />, title: "Recipients browse & request", desc: "Schools, NGOs and community centers search, filter and request what they need." },
  { icon: <BrainCircuit className="h-5 w-5" />, title: "Matches & queue prioritizes", desc: "Database matching surfaces relevant inventory; priority and aging order requests for allocation." },
  { icon: <CheckCircle2 className="h-5 w-5" />, title: "Approved & reserved", desc: "Synchronized allocation locks the resource — no double assignment, ever." },
  { icon: <Truck className="h-5 w-5" />, title: "Pickup & delivery", desc: "Pickup is scheduled through the queue; status updates flow to both sides." },
  { icon: <Recycle className="h-5 w-5" />, title: "Loop closes", desc: "Allocation updates persistent inventory and live analytics reflect the circulation." },
];

export default function Home() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [categories, setCategories] = useState<{ name: string; value: number }[]>([]);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<{ stats: Record<string, number>; categoryDistribution: { name: string; value: number }[] }>("/analytics", { signal: controller.signal })
      .then((result) => { setStats(result.stats); setCategories(result.categoryDistribution); })
      .catch((reason: unknown) => { if (!controller.signal.aborted) setStatsError(reason instanceof Error ? reason.message : "Network data is unavailable."); });
    return () => controller.abort();
  }, []);

  return (
    <MarketingLayout>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <Aurora colorStops={["#047857", "#10B981", "#6EE7B7"]} blend={0.4} amplitude={0.8} speed={0.4} />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-24 h-[480px] w-[480px] rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, oklch(0.5 0.1 163 / 0.2), transparent 65%)" }}
        />
        <div className="container relative z-10 grid items-center gap-10 pb-16 pt-28 md:grid-cols-2 md:gap-6 md:pb-24 md:pt-36">
          <div className="max-w-xl">
            <ShinyText
              text="♻  Circular Resource Exchange"
              speed={4}
              className="mb-5 inline-block rounded-full border border-emerald-200/60 bg-white/70 px-4 py-1.5 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur"
            />
            <SplitText
              text="Every unused resource has a second life waiting."
              className="font-display text-[clamp(2.6rem,5.5vw,4.2rem)] font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl"
              delay={55}
              duration={0.7}
              splitType="words"
              from={{ opacity: 0, y: 32 }}
              to={{ opacity: 1, y: 0 }}
            />
            <BlurText
              text="RELIVO connects people and organizations with useful resources to the schools, NGOs and communities that need them most. Give what you don't need. Find what you do."
              delay={70}
              className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
            />
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnet padding={60} magnetStrength={30}>
                <Link href="/register">
                  <Button size="lg" className="rounded-xl px-7 shadow-lg shadow-emerald-900/15 transition-transform active:scale-[0.97]">
                    Start Giving <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </Magnet>
              <Link href="/browse">
                <Button size="lg" variant="outline" className="rounded-xl border-emerald-200 bg-white/70 px-7 backdrop-blur transition-transform hover:bg-white active:scale-[0.97]">
                  Browse Resources
                </Button>
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Layers className="h-4 w-4 text-primary" />
              React · FastAPI · SQLite · SQLAlchemy · Priority Queue · Aging
            </p>
          </div>
          <AnimatedContent distance={80} duration={0.9} className="relative hidden md:block">
            <img
              src={HERO_IMG}
              alt="Reusable resources orbiting a circular loop"
              className="w-full max-w-lg rounded-3xl border border-white/60 shadow-2xl shadow-emerald-900/10"
            />
          </AnimatedContent>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="border-y border-border bg-white/70 backdrop-blur-md shadow-[0_8px_32px_-20px_oklch(0.48_0.11_165/0.35)]">
        <div className="container grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {stats ? STATS.map((s) => (
            <ScrollReveal key={s.label} className="text-center">
              <p className="stat-num text-4xl text-primary sm:text-5xl">
                <CountUp from={0} to={stats[s.key] ?? 0} duration={1.4} separator="," suffix={s.suffix} />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </ScrollReveal>
          )) : <p className="col-span-full text-center text-sm text-muted-foreground">{statsError ?? "Loading current network totals…"}</p>}
        </div>
      </section>

      {/* ===== PROBLEM ===== */}
      <section className="py-20">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <AnimatedContent distance={60} direction="horizontal" duration={0.8}>
            <img src={COMMUNITY_IMG} alt="Volunteers sorting donated resources" className="w-full rounded-3xl shadow-xl shadow-emerald-900/10" />
          </AnimatedContent>
          <div>
            <ScrollReveal>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">The Problem</p>
              <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
                Usable resources are thrown away while communities go without.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Laptops, books, furniture, projectors, sports equipment and countless other useful items often go unused when someone no longer needs them. At the same time, schools, NGOs and community organizations struggle to access the resources they need.
              </p>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                RELIVO makes it easier to move these resources where they can make a real difference — turning unused belongings into opportunities for someone else.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== INTELLIGENCE (AI/DSA/OS) ===== */}
      <section className="relative bg-gradient-to-b from-emerald-50/60 to-transparent py-20">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <ScrollReveal>
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">The Intelligence</p>
                <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
                  Making Every Resource Count
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Finding the right home for an unused resource shouldn't be difficult. RELIVO helps connect available resources with genuine community needs, making it easier for people and organizations to give, discover and share what matters.
                </p>
              </ScrollReveal>
            </div>
            <div className="lg:col-span-3">
              <img src={AI_BRAIN_IMG} alt="Resource matching network illustration" className="w-full rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/10" />
            </div>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <AnimatedContent key={f.title} delay={i * 0.08} threshold={0.15}>
                <GlareHover className="h-full bg-white">
                  <SpotlightCard className="h-full border border-emerald-100/80 p-6" spotlightColor="rgba(4,108,78,0.14)">
                    <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">{f.icon}</div>
                    <h3 className="mb-2 font-display text-lg font-semibold">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </SpotlightCard>
                </GlareHover>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20">
        <div className="container">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">How It Works</p>
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">From donation to delivery, intelligently.</h2>
          </ScrollReveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <AnimatedContent key={s.title} delay={i * 0.06}>
                <SpotlightCard className="flex h-full flex-col gap-3 glass-card p-6" spotlightColor="rgba(4,108,78,0.1)">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">{i + 1}</span>
                    <span className="text-primary">{s.icon}</span>
                  </div>
                  <h3 className="font-display text-base font-semibold">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </SpotlightCard>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="border-t border-border bg-secondary/40 py-20">
        <div className="container">
          <ScrollReveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Circulating Now</p>
              <h2 className="font-display text-3xl font-bold">What the network is reusing</h2>
            </div>
            <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-transform hover:translate-x-1">
              Browse everything <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.length === 0 ? (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">{statsError ?? "No resources are listed yet."}</p>
            ) : categories.map((c) => (
              <Link key={c.name} href="/browse">
                <SpotlightCard className="group flex flex-col items-center gap-2 glass-card p-6 text-center transition-transform duration-300 hover:-translate-y-1">
                  <p className="font-display text-2xl font-bold text-primary tabular-nums">
                    <CountUp from={0} to={c.value} duration={1.1} separator="," />
                  </p>
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{c.name}</p>
                </SpotlightCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden py-24">
        <Aurora colorStops={["#6EE7B7", "#10B981", "#047857"]} blend={0.3} amplitude={0.6} speed={0.3} />
        <div className="container relative z-10 mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <Leaf className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-5xl">
              Give unused resources a second life.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Join donors, schools, NGOs and community organizations already circulating resources through RELIVO.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Magnet padding={60} magnetStrength={30}>
                <Link href="/register">
                  <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-emerald-900/15 transition-transform active:scale-[0.97]">
                    Create a Free Account <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </Magnet>
              <Link href="/about">
                <Button size="lg" variant="outline" className="rounded-xl bg-white/70 px-8 backdrop-blur transition-transform hover:bg-white active:scale-[0.97]">
                  Learn the Mission
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </MarketingLayout>
  );
}
