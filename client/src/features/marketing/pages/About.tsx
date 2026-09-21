/*
 * ReUseNet AI — About page (Eco-Tech Glasshouse · medium animation)
 * ScrollReveal bands, BlurText headings, subtle SpotlightCards. Calmer than Home.
 */
import { Link } from "wouter";
import { ArrowRight, Target, Users, ShieldCheck, BrainCircuit, Recycle, Leaf } from "lucide-react";
import MarketingLayout from "@/components/MarketingLayout";
import ScrollReveal from "@/components/reactbits/ScrollReveal";
import BlurText from "@/components/reactbits/BlurText";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { Button } from "@/components/ui/button";

const MISSION_IMG = "/manus-storage/reusenet-about-mission_1662b3f5.png";

const PILLARS = [
  { icon: <Target className="h-5 w-5" />, title: "Minimize Waste", desc: "Every shared resource gets a longer life, helping reduce unnecessary waste and keeping useful products in circulation." },
  { icon: <Users className="h-5 w-5" />, title: "Support Communities", desc: "Connect schools, NGOs, community organizations and individuals with resources that can support their everyday needs." },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Fair & Transparent", desc: "Clear information about resources and requests helps create a trustworthy and accessible sharing network." },
  { icon: <BrainCircuit className="h-5 w-5" />, title: "Easy to Connect", desc: "Make it easier for people with useful resources to connect with communities and organizations that need them." },
];

const TECH = [
  { label: "Smart Matching", detail: "Helps connect available resources with relevant community needs." },
  { label: "Better Connections", detail: "Helps organize resources and requests so people can find relevant opportunities more easily." },
  { label: "Reliable Allocation", detail: "Helps ensure that resources are allocated fairly and consistently, even when multiple requests are made." },
  { label: "Built for Communities", detail: "Designed to support people, organizations and communities as they share resources and create meaningful connections." },
];

export default function About() {
  return (
    <MarketingLayout>
      <section className="pb-10 pt-28 md:pt-36">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div>
            <ScrollReveal>
              <p className="mb-3 inline-flex items-center gap-1.5 rounded-full ai-chip px-3 py-1 text-xs font-semibold"><span>✦</span> Mission</p>
              <BlurText
                text="We believe nothing useful should ever be thrown away while someone still needs it."
                delay={60}
                className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl"
              />
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                ReUseNet AI is a community-driven resource exchange platform that connects people, companies, colleges and institutions with schools, NGOs and community organizations that can make use of their unwanted but reusable resources.
              </p>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Beyond simply listing resources, ReUseNet AI helps make the process of finding, sharing and receiving useful items easier — helping resources reach communities where they can make the greatest difference.
              </p>
              <div className="mt-7">
                <Link href="/register">
                  <Button className="rounded-xl px-6 transition-transform active:scale-[0.97]">
                    Join the Network <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal>
            <img src={MISSION_IMG} alt="Teacher showing a donated laptop to students" className="w-full rounded-3xl shadow-2xl shadow-emerald-900/15" />
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <ScrollReveal className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">What Guides Us</p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Four pillars of a circular future</h2>
          </ScrollReveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => (
              <ScrollReveal key={p.title}>
                <SpotlightCard className="h-full glass-card p-6">
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">{p.icon}</div>
                  <h3 className="mb-2 font-display text-lg font-semibold">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                </SpotlightCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/40 py-20">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div>
            <ScrollReveal>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">The Science Behind It</p>
              <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">How ReUseNet Makes a Difference</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                ReUseNet AI uses smart matching and prioritization to connect available resources with genuine community needs, helping make the process of sharing and receiving resources more efficient.
              </p>
            </ScrollReveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {TECH.map((t) => (
                <SpotlightCard key={t.label} className="glass-card p-5">
                  <p className="font-display text-sm font-bold text-primary">{t.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.detail}</p>
                </SpotlightCard>
              ))}
            </div>
          </div>
          <ScrollReveal>
            <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-900/5">
              <h3 className="font-display text-xl font-bold">Why it matters</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                A useful item shouldn't become waste simply because its owner no longer needs it. ReUseNet AI helps keep resources moving — from people who have more than they need to communities that can put them to good use.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Reduce waste • Encourage reuse • Support communities • Improve access"].map((tag) => (
                  <span key={tag} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <Recycle className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Every donation turns the loop.</h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              Laptops to classrooms. Books to libraries. Furniture to learning centers. One platform, one shared mission — a second life for everything reusable.
            </p>
            <div className="mt-7">
              <Link href="/browse">
                <Button size="lg" className="rounded-xl px-7 transition-transform active:scale-[0.97]">
                  Explore the Network <Leaf className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </MarketingLayout>
  );
}
