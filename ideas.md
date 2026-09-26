# RELIVO — Design Brainstorm

## Project Context (from user handoff)
RELIVO is a full-stack college mini project (React + Vite + Tailwind + React Router + Axios + Recharts frontend) — an intelligent circular resource exchange platform connecting donors with organizations that need resources. 14 pages: Landing, About, Login, Register, Donor/Recipient/Admin dashboards, Upload Resource, Browse, Resource Details, Request Resource, AI Recommendation, Notifications, Analytics. React Bits effects provided: Aurora, BlurText, SplitText, ScrollReveal, SpotlightCard, TiltedCard, CountUp, AnimatedList, AnimatedContent, Magnet, ShinyText, GlareHover.

Design constraint from user: "premium modern sustainability-tech SaaS platform", NOT generic CRUD, NOT cyberpunk, NOT overloaded animation. Landing = most impressive; dashboards = usability-first.

## Three Stylistic Approaches

### 1. Verdant Editorial
**Intro:** Warm-paper editorial layout with deep forest greens and cream tones, inspired by premium sustainability reports and Kinfolk-style magazines. Feels human, trustworthy, mission-driven.
**Probability:** 0.07

### 2. Eco-Tech Glasshouse
**Intro:** Light, luminous SaaS aesthetic — frosted glass surfaces, soft green-gold gradients, airy whites, crisp sans typography. Communicates intelligence + freshness, like a modern climate-tech startup (Stripe/Linear energy with a green soul).
**Probability:** 0.05

### 3. Terracotta Commons
**Intro:** Earthy warmth — terracotta, sand, olive, off-white; hand-crafted "community commons" feel with organic shapes and serif display type. Feels like a modern co-op rather than a tech product.
**Probability:** 0.03

## CHOSEN: Eco-Tech Glasshouse

### Design Movement
"Climate-tech Modernism" — the current wave of premium sustainability SaaS (Allbirds, Octopus Energy, Gradient Labs): luminous light surfaces, glassy depth, generous whitespace, and restrained organic accents. Feels like a funded startup, not a college CRUD.

### Core Principles
1. **Luminous clarity** — light, airy surfaces with soft depth (glass, soft shadows, subtle gradients); never dark or muddy.
2. **Intelligence made visible** — AI features get a distinct visual signature (soft emerald glow, "AI" tags, subtle pulse) without gimmickry.
3. **Data deserves beauty** — dashboards are clean, information-dense, and use soft card depth + precise chart colors.
4. **Restraint over spectacle** — animation is fast, purposeful, entrance/hover-focused; the landing page carries the most motion, functional pages stay calm.

### Color Philosophy
The palette is built from nature filtered through technology. **Deep Emerald (#046C4E / oklch ~0.48 0.11 165)** is the anchor — trust, growth, sustainability. **Sage tint** and warm **cream (#FAF9F6)** keep surfaces warm and human. A **Sunrise Amber (#F5A623)** accent marks urgency/priority and AI demand levels. One cool **Slate ink** for text. (A purple re-theme was attempted then reverted per user request; the original emerald identity is restored.)

### Layout Paradigm
- Landing: asymmetric hero (left text mass, right layered visual), offset section grids, sticky glass nav that gains opacity on scroll. Avoid full-center stacks.
- Dashboards: fixed left sidebar (donor/recipient) with content grid; admin gets a denser 12-col grid. Analytics uses Recharts with entrance animation.
- Browse: masonry-flavored grid of resource cards with filter rail on desktop.
- About: alternating text/visual bands with scroll-reveal.

### Signature Elements
1. **Leaf-loop motif** — a circular arrow/leaf brand mark and recurring loop iconography referencing the circular economy.
2. **Soft spotlight cards** — SpotlightCard/GlareHover on key landing + dashboard cards; a gentle emerald radial glow.
3. **AI badge chip** — tiny gradient (emerald→amber) pill with sparkle icon marking AI-derived results on recommendation cards and dashboards.

### Interaction Philosophy
Interactions confirm rather than perform. Buttons scale 0.97 on press; cards lift 2–4px with a soft shadow on hover; the AI recommendation page uses CountUp scores and spotlight cards to feel "computed"; Magnet on landing CTAs only.

### Animation
- Landing: Aurora background (very low blend), SplitText hero headline, BlurText subtitle, ScrollReveal sections, CountUp stats, AnimatedContent for feature rows, GlareHover/SpotlightCard feature cards, Magnet CTA. Stagger 40–60ms.
- About: ScrollReveal + BlurText headings, subdued.
- Login/Register: entrance fade+rise 300ms, calm.
- Dashboards: CountUp stats, subtle card hover, no table animation.
- Browse: grid entrance stagger, tilt only if subtle.
- AI page: CountUp scores, spotlight/glow cards, animated list.
- Notifications: fade/slide, no excess.
- All under ~800ms, ease-out cubic-bezier(0.23,1,0.32,1).

### Typography System
- Display: **"Space Grotesk"** (600/700) — techy yet friendly, strong geometric character for headlines and numbers.
- Body: **"Inter" replacement → "Public Sans"** (400/500/600) for UI text — clean, government-grade legibility.
- Hierarchy: hero clamp(2.5rem,5vw,4rem) Space Grotesk 700; section h2 2rem; card titles 1.1rem 600; body 0.95rem. Numbers/stat blocks use tabular-nums.

### Brand Essence
"RELIVO — the intelligent network that gives reusable resources a second life, connecting donors with the communities that need them most." Personality: purposeful, intelligent, warm.

### Brand Voice
Confident, mission-first, human. Headlines state impact; CTAs are action-clear without hype.
- Example headline: "Every unused resource has a second life waiting."
- Example CTA: "Start giving — upload your first resource"

### Wordmark & Logo
A circular loop formed by two leaves/arrows in deep emerald with a small amber node — symbolizing the circular exchange. Wordmark "RELIVO" in Space Grotesk 700.

### Signature Brand Color
**Deep Emerald #046C4E** — unmistakably RELIVO.

## Style Decisions
- React Bits usage map (per user strategy):
  - Landing: Aurora (bg), SplitText (hero), BlurText (subtitle), ScrollReveal (sections), CountUp (stats), AnimatedContent (rows), SpotlightCard + GlareHover (feature/resource cards), Magnet (CTA), ShinyText (eyebrow)
  - About: ScrollReveal, BlurText, subtle SpotlightCard
  - Login/Register: entrance animation only, calm
  - Dashboards: CountUp, SpotlightCard hover, no table animation
  - Upload: minimal (success feedback only)
  - Browse: SpotlightCard, subtle hover, staggered entrance
  - Resource Details: subtle interactive image effect (TiltedCard only if subtle — skip tilt, use gentle scale)
  - Request: stepper with subtle transitions (AnimatedContent per step)
  - AI Recommendation: SpotlightCard, glowing border, CountUp scores, AnimatedList
  - Notifications: AnimatedList-style fade, read/unread states
  - Analytics: Recharts + CountUp, chart entrance
- Mock data layer in `client/src/lib/mockData.ts` with users, resources, requests, donations, notifications, AI recommendations, analytics series — all three roles seedable via localStorage "role" + "loggedIn" keys so dashboards can be demoed.
- Auth: client-side mock login/register (localStorage) with role selection; routes guarded by simple session context.
- **Glasshouse surfaces:** Every major card, filter bar, form, and analytics panel uses a frosted white/cream surface with green-tinted border, soft emerald glow, and restrained shadow so the interface feels luminous rather than flat white.
- **AI signature:** AI-derived or predictive content always carries the emerald→amber chip/glow language with a sparkle cue; amber is reserved primarily for AI, priority, forecast, or demand signals.
- **Imagery direction:** Product/resource imagery is warm, clean, softly lit, and sustainability-coded — no harsh dark stock photos or unrelated marketplace-style crops.
