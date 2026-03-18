# Frontend Visual Redesign — Cyberpunk Edition

**Date:** 2026-03-19
**Status:** Approved

## Summary

Upgrade docminer's frontend from "functional with polish" to a full cyberpunk/futuristic visual experience. Covers both a new landing page with a 3D hero scene and a complete in-app aesthetic overhaul. Performance stays snappy on a 2020 laptop.

## Approach

**R3F Landing + Lightweight Canvas In-App.** The landing page gets a full Three.js/R3F 3D hero scene. The app interior uses CSS effects, HTML5 Canvas particles, and Framer Motion — no persistent WebGL context inside the app.

## Landing Page

Standalone route at `/`, no sidebar. Full marketing page.

### Hero Section

- Full-viewport R3F scene as background.
- Center piece: a floating, slowly rotating crystalline gem (ties to the logo icon) with violet neon edge glow and subtle refraction. Particles drift around it like data points being "mined."
- A scan-line beam sweeps across the gem periodically — the "extraction" metaphor in visual form.
- Title text overlaid: "docminer" in large display type with subtle text glow. Tagline below. CTA button with neon border pulse.
- On scroll, the gem scales down and fades into the next section.

### Feature Sections

- Grid background (subtle cyberpunk grid lines receding into perspective).
- 3 feature cards with CSS 3D tilt-on-hover (card rotates slightly toward cursor). Each card has an animated icon: document with scan-line, schema brackets that pulse, extraction with flowing data particles.
- Scroll-triggered stagger animations via Framer Motion.

### Footer

- Minimal. GitHub link, "Built with Docling + LLMs" badge. Grid background bleeds through.

## Design System Upgrades

Shared visual primitives used across both landing and app.

### Neon Glow System

CSS custom properties for glow intensities: `--glow-sm`, `--glow-md`, `--glow-lg`. Based on existing violet `oklch(0.55 0.25 285)`. Applied via `box-shadow` and `filter: drop-shadow`.

Active/focused elements get neon glow (inputs on focus, active nav items, primary buttons). Idle elements stay muted — "powered on vs powered off" contrast.

### Grid Background

A perspective CSS grid replacing the current `atmo-glow`. Thin lines (1px, low opacity) receding into depth using CSS `perspective`. Violet tint. Used as the base layer across all pages.

### Typography

Keep JetBrains Mono as display font. Add a monospace terminal-output style for extracted values and JSON: neon green `oklch(0.627 0.194 149.214)` on dark, like a terminal readout.

### Scan-Line Effect

Reusable CSS animation: a thin horizontal light beam sweeping top-to-bottom across a container. Used on cards during loading, extraction processing, hover effects on document thumbnails. Pure CSS (`@keyframes` + gradient mask).

### Micro-Interactions (Framer Motion)

- **Page transitions:** content fades up with blur-to-sharp (replaces current CSS `fade-up`).
- **Layout animations:** lists add/remove items with smooth `AnimatePresence` + `layout` prop.
- **Button hover:** subtle scale + glow intensify.
- **Reduced motion:** all animations respect `prefers-reduced-motion`, falling back to simple fades or instant transitions.

## App Interior — Page-by-Page

No WebGL in the app. All CSS, canvas, and Framer Motion.

### Dashboard

- Stat cards: neon border glow on hover (violet neutral, emerald success). Numbers animate up on load (count-up effect).
- Recent extractions: faint scan-line sweep on row hover. Status badges: `ring-expand` for processing, steady neon glow for completed (emerald) and failed (red).
- Background: shared perspective grid + sparse particle canvas (~20-30 slow-drifting dots).

### Documents Page

- Document rows: thumbnail with scan-line hover effect.
- Upload dropzone: dashed neon border that pulses when dragging file over.
- Upload progress: horizontal neon beam filling left-to-right, like a laser scan.

### Schemas Page

- Schema cards: miniature code preview in terminal green monospace. Brackets `{ }` glow and scale on hover.
- Schema creation form: neon focus rings on inputs. JSON preview panel has a scan-line header bar like a terminal window.

### Extract Page

The money page. Document preview left, results right.

- **Processing:** scan-line sweeps over document preview. Pulsing neon ring on status indicator. Floating particle dots drift between document and results panels — data being "mined."
- **Completion:** results panel fades in with terminal green style. Each extracted field animates in sequentially (stagger), like terminal output printing line by line.
- **Failed:** red neon pulse, glitch-shake micro-animation on error card.

### Sidebar

- Active nav item: neon left-edge accent bar (2px violet glow) replacing background-only highlight.
- Hover: faint scan-line sweep.
- Logo gem: continuous subtle pulse glow (upgrade from current 2-cycle `logo-pulse`).

## Tech Stack

### New Dependencies

| Package | Purpose | Scope |
|---------|---------|-------|
| `@react-three/fiber` | React Three.js renderer | Landing page only |
| `@react-three/drei` | R3F helpers (lights, controls, shaders) | Landing page only |
| `framer-motion` | Animation orchestration | Entire app |

Particle canvas is hand-rolled (~50 lines), no extra dependency.

### Route Structure

```
/              -> Landing page (standalone layout, no sidebar)
/app           -> Dashboard (sidebar layout)
/app/extract   -> Extract page
/app/documents -> Documents page
/app/schemas   -> Schemas page
```

Breaking change from current structure where `/` is the dashboard.

### Performance Strategy

- **Code splitting:** R3F loaded via `next/dynamic` with `ssr: false`. Only landing page visitors download Three.js.
- **Canvas efficiency:** `requestAnimationFrame` with visibility check — pauses when tab hidden or off-screen.
- **GPU-only animations:** Framer Motion uses `transform` and `opacity` only. No layout thrashing.
- **Reduced motion:** all animations fall back for `prefers-reduced-motion`.
- **Targets:** landing page <3s on 3G, app pages feel instant on 2020 laptop.

### Component Organization

```
frontend/src/
  app/
    layout.tsx              # Landing layout (no sidebar)
    page.tsx                # Landing page
    app/
      layout.tsx            # App layout (sidebar + grid bg + particles)
      page.tsx              # Dashboard
      extract/page.tsx
      documents/page.tsx
      schemas/page.tsx
  components/
    landing/                # Landing-specific
      hero-scene.tsx        # R3F canvas + gem model
      feature-cards.tsx     # 3D tilt cards
      scroll-sections.tsx   # Scroll-triggered sections
    effects/                # Shared visual effects
      particle-canvas.tsx   # Lightweight canvas particles
      scan-line.tsx         # Scan-line sweep component
      neon-border.tsx       # Neon border wrapper
      count-up.tsx          # Animated number counter
    ui/                     # Existing shadcn components
    ...                     # Existing shared components
```

## Implementation Phases

### Phase 1 — Design System Foundation

Upgrade globals.css: neon glow custom properties, perspective grid background, scan-line keyframes, terminal text styles. Update existing components (cards, buttons, inputs, nav) with new effects. Add `framer-motion`, set up page transitions.

### Phase 2 — Route Restructure

Move current app pages under `/app/*`. Create landing route at `/`. Separate layouts. No landing content yet — just the structure and routing.

### Phase 3 — App Interior Polish

Per-page treatments: dashboard count-up + neon stat cards, document scan-line hovers, schema terminal previews, extract processing animations. Particle canvas component.

### Phase 4 — Landing Page

R3F hero scene (gem + particles + scan beam). Feature sections with scroll animations and 3D tilt cards. CTA, footer. Dynamic import for code splitting.

### Phase 5 — Refinement

Performance audit (Lighthouse, bundle size). `prefers-reduced-motion` pass. Mobile responsiveness for all new effects. Polish and edge cases.
