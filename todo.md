# RELIVO — Revert to original emerald design + fix React Bits imports

## Phase 1: Fix missing React Bits components
- [ ] Create Aurora.tsx (canvas aurora animation, used in Home.tsx hero background)
- [ ] Create AnimatedList.tsx (used in AI Recommendations)
- [ ] Create TiltedCard.tsx (implement properly if imported)
- [ ] Verify all imports in client/src against reactbits files; tsc clean

## Phase 2: Revert purple theme → original emerald
- [ ] Restore index.css tokens (emerald primary, cream background, amber accent, chart palette)
- [ ] Restore page-level color classes (violet→emerald, warm-rose→amber, footer dark section)
- [ ] Restore brand asset URLs to original emerald-themed generated images
- [ ] Restore chart fills to emerald palette
- [ ] Update ideas.md Style Decisions (restore emerald language)

## Phase 3: Verify
- [ ] tsc --noEmit clean
- [ ] Dev server clean, no "Failed to resolve import" in logs
- [ ] Screenshots: landing, about, dashboards, browse, analytics — original emerald look, animations intact
- [ ] Browser console clean (role-gated pages work with demo auth)
- [ ] Mobile 375px check

## Phase 4: Deliver
- [ ] Checkpoint + final report
