# PRD-004: UI/UX and Branding Overhaul — harihoudini.dev

**Status:** Approved
**Author:** Hari Houdini
**Created:** 2026-04-03
**Last Updated:** 2026-04-03
**Version:** 1.0.0
**Linked Issue:** TBD
**Linked PRD:** [PRD-003 — Blog and Typed Environment](./PRD-003-blog-varlock.md)
**Linked Spec:** [REWRITE-001 — Implementation Guide](./REWRITE-001-architecture-rewrite.md)

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution](#2-solution)
3. [User Stories](#3-user-stories)
   - 3.1 [Visitor — Visual Experience](#31-visitor--visual-experience)
   - 3.2 [Visitor — Accessibility and Performance](#32-visitor--accessibility-and-performance)
   - 3.3 [Portfolio Owner — CMS Control](#33-portfolio-owner--cms-control)
   - 3.4 [Developer — Component System](#34-developer--component-system)
4. [Implementation Decisions](#4-implementation-decisions)
   - 4.1 [Modules](#41-modules)
   - 4.2 [Design System](#42-design-system)
   - 4.3 [Canvas Strategy](#43-canvas-strategy)
   - 4.4 [Component Inventory](#44-component-inventory)
   - 4.5 [CMS Schema Changes](#45-cms-schema-changes)
   - 4.6 [Technical Clarifications](#46-technical-clarifications)
   - 4.7 [Architectural Decisions](#47-architectural-decisions)
5. [Testing Decisions](#5-testing-decisions)
6. [Out of Scope](#6-out-of-scope)
7. [Further Notes](#7-further-notes)

---

## 1. Problem Statement

### Background

Phase 3 (PRD-002) and Phase 4 (PRD-003) deliver a complete portfolio with a blog, typed
environment, CMS pipeline, and accessible HTML shell. The site is functionally complete. However,
its visual presentation is a developer-default skeleton: system fonts, a single gold accent on a
dark background, no interactive elements, no immersive backgrounds, and no coherent brand
identity. The portfolio is not yet demonstrating creative and visual capability at the level the
work demands.

### The Problem

**From the portfolio owner's perspective:**

The site communicates competence through its architecture but not through its appearance. A
potential client or employer who visits sees clean code output — not a memorable visual experience.
The original PRD-001 promised an immersive, cinematic portfolio. The current shell delivers a
functional skeleton. There is a gap between the stated vision and what is live.

**From the visitor's perspective:**

The site is dark, monochromatic, and static. Nothing responds to cursor movement. Section
backgrounds are flat. Typography is system-default. There is no visual hierarchy that guides the
eye. The blog is readable but austere. The portfolio content is present but not showcased.

### Core Problem Statement

> A portfolio for a creative technologist must itself be a creative and visual artifact. The
> current site does not demonstrate the visual craft, interaction design, or typographic sensibility
> that defines the brand. This PRD closes that gap with a full design system overhaul and a
> comprehensive set of UI components.

---

## 2. Solution

### Vision

A cohesive, branded portfolio experience with:
- A self-hosted Inter + Lora font system for typographic personality
- A dark/light theme toggle with 5 neon accent colors mapped to semantic roles
- Per-section Inspira UI-inspired backgrounds (10 variants) rendered in Three.js/GLSL
- 30+ interactive UI components — backgrounds, title effects, buttons, cards, cursor, search, tooltip, carousels, progress bar, decorative borders, and more
- CMS-driven background and style selection at the section level
- WCAG AAA contrast standards maintained across all modes

### What Changes vs Phase 3/4

| Area | Before | After |
|---|---|---|
| Fonts | System fonts | Inter (headings) + Lora (body), self-hosted via `next/font/local` |
| Color | Single gold accent on `#0a0a0a` | Dark/light toggle; 5 neon accents with role-based mapping |
| Backgrounds | Flat `--color-bg` | 10 Three.js/GLSL per-section variants, CMS-selectable |
| Three.js canvas | Galaxy/warp scene (single global canvas) | Removed; replaced by per-section background canvases |
| Navigation | None | Sticky section nav with Liquid Glass effect + Lamp Effect links |
| Cursor | Default browser cursor | Fluid cursor with neon physics trails |
| Blog search | Plain `<input type="search">` | Halo Search with animated ring on focus |
| Project cards | Plain `<article>` | 6 card style variants (glow, spotlight, tilt, flip, glassmorphism, border-beam), CMS-selected |
| Blog post | Flat prose | Tracing Beam left-edge indicator + Reading Progress top bar |
| Contact | Email + social links | Adds World Map (dotted-map, CMS lat/lng dots) |
| Headings | Plain `<h2>` | 4 title effect variants (typewriter, glitch, gradient, shimmer), CMS-selected |

---

## 3. User Stories

### 3.1 Visitor — Visual Experience

- As a **visitor arriving on the home page**, I want to see an immersive animated background in each section so that the site feels alive and unique rather than a standard dark-mode website.
- As a **visitor**, I want the cursor to leave fluid neon trails as I move it so that even passive navigation feels interactive and crafted.
- As a **visitor in dark mode** (default), I want to see a dark `#121212` background with neon accent highlights so that the site has a cohesive identity.
- As a **visitor who prefers light mode**, I want a toggle that switches to a `#F7F7F7` background with appropriate contrast, so that the site is comfortable in any lighting condition.
- As a **visitor**, I want the section headings to have a distinctive text animation effect (typewriter, glitch, gradient shimmer, or plain) so that the heading style reinforces the section's personality.
- As a **visitor scrolling through the site**, I want a sticky navigation bar with anchor links to each section so that I can jump directly to any part of the page.
- As a **visitor hovering a nav link**, I want to see a warm lamp-cone light emanate beneath the link so that hover states feel tangible and designed.
- As a **visitor looking at the work section**, I want project cards to have interactive hover effects (glow, spotlight, tilt, flip, glass, or animated border) so that browsing projects feels engaging.
- As a **visitor reading a blog post**, I want a reading progress bar at the top of the page so that I can see how far through the article I am.
- As a **visitor reading a long blog post**, I want a tracing beam on the left edge of the content so that my scroll position is visually anchored.
- As a **visitor on the contact page**, I want to see a dotted world map with highlighted locations so that I have a visual sense of where the portfolio owner works and collaborates.
- As a **visitor using the blog search**, I want the search input to have a glowing halo ring on focus so that it feels intentional and interactive.
- As a **visitor hovering a technology tag or date**, I want a tooltip to appear with additional context so that subtle UI elements surface information on demand.

### 3.2 Visitor — Accessibility and Performance

- As a **visitor with `prefers-reduced-motion: reduce`**, I want all animations and Three.js canvases to be disabled so that the site does not trigger vestibular discomfort.
- As a **visitor without WebGL2 support**, I want the site to automatically fall back to a flat background (matching the current mode's base color) so that nothing is broken or blank.
- As a **visitor using a keyboard**, I want all interactive components (nav, toggle, cards, buttons, carousel controls) to be fully operable via keyboard so that the site remains accessible without a mouse.
- As a **visitor using a screen reader**, I want all decorative animations to have `aria-hidden="true"` so that they do not pollute the accessibility tree.
- As a **visitor on a mobile device**, I want the fluid cursor disabled and all touch interactions to work naturally so that the mobile experience is not degraded by a desktop-first cursor.
- As a **visitor on any device**, I want fonts to be preloaded with no layout shift so that text is styled from the first paint.

### 3.3 Portfolio Owner — CMS Control

- As the **portfolio owner**, I want to select a background style for each section (hero, about, work, contact) from the CMS admin panel so that I can change the visual feel of any section without a code deployment.
- As the **portfolio owner**, I want to select a title effect (typewriter, glitch, gradient, shimmer, or plain) for each section heading from the CMS so that heading animations match the content mood.
- As the **portfolio owner**, I want to select a project card style from the CMS so that I can change how the work section cards look without touching code.
- As the **portfolio owner**, I want to add or remove world map location dots from the CMS by entering a label, latitude, and longitude so that the contact section reflects my actual client/collaboration geography.
- As the **portfolio owner**, I want to enable or disable the tracing beam on individual blog posts from the CMS so that long-form posts get the reading aid while short ones do not.

### 3.4 Developer — Component System

- As the **developer**, I want all UI components in a single `features/ui/` pod with a barrel export so that importing from outside the pod never touches internals.
- As the **developer**, I want every Three.js background component to dispose all geometry, materials, and textures in `useEffect` cleanup so that there are no WebGL memory leaks.
- As the **developer**, I want all "client" components to be lazy-loaded with `React.lazy` + `<Suspense>` at their usage sites so that server rendering is never blocked by browser-only code.
- As the **developer**, I want CSS Modules with design tokens from `globals.css` so that all visual values are single-sourced and easy to audit.
- As the **developer**, I want lint and tests to pass at every commit so that the quality gate is never regressed.

---

## 4. Implementation Decisions

### 4.1 Modules

#### New: `features/ui/` pod

A single pod owns all shared UI components. Internal structure:

```
features/ui/
├── mod.ts                                     Public barrel
├── theme-toggle.client.component.tsx
├── fluid-cursor.client.component.tsx
├── section-nav.client.component.tsx
├── lamp-effect.client.component.tsx
├── halo-search.client.component.tsx
├── animated-tooltip.client.component.tsx
├── liquid-glass.client.component.tsx
├── world-map.component.tsx                    Async RSC (dotted-map, no browser API)
├── tracing-beam.client.component.tsx
├── reading-progress.client.component.tsx
├── title-effects/
│   ├── typewriter-text.client.component.tsx
│   ├── glitch-text.client.component.tsx
│   ├── gradient-text.component.tsx            Pure CSS — RSC-safe
│   ├── shimmer-text.client.component.tsx
│   └── section-heading.component.tsx          Dispatcher RSC
├── buttons/
│   ├── glow-button.client.component.tsx
│   ├── border-beam-button.client.component.tsx
│   └── magnetic-button.client.component.tsx
├── cards/
│   ├── glow-card.client.component.tsx
│   ├── spotlight-card.client.component.tsx
│   ├── tilt-card.client.component.tsx
│   ├── flip-card.component.tsx                CSS-only — RSC-safe
│   ├── glassmorphism-card.component.tsx       CSS-only — RSC-safe
│   └── border-beam-card.client.component.tsx
├── borders/
│   ├── glow-border.component.tsx              CSS only — RSC-safe
│   ├── border-beam.client.component.tsx
│   └── moving-border.client.component.tsx
├── carousels/
│   ├── card-stack.client.component.tsx
│   ├── infinite-scroll-list.client.component.tsx
│   └── parallax-scroll.client.component.tsx
└── backgrounds/
    ├── section-background.client.component.tsx   Dispatcher + IntersectionObserver
    ├── aurora-background.client.component.tsx
    ├── particles-background.client.component.tsx
    ├── waves-background.client.component.tsx
    ├── meteors-background.client.component.tsx
    ├── grid-background.component.tsx             CSS-only — RSC-safe
    ├── noise-background.client.component.tsx
    ├── beams-background.client.component.tsx
    ├── vortex-background.client.component.tsx
    ├── orbs-background.client.component.tsx
    ├── ripple-background.client.component.tsx
    └── shaders/
        ├── aurora.frag.glsl
        ├── waves.vert.glsl
        ├── noise.frag.glsl
        ├── beams.frag.glsl
        ├── vortex.frag.glsl
        └── ripple.frag.glsl
```

#### Remove: `features/canvas/` pod

The existing global Three.js canvas (`canvas-placeholder.iso.component.tsx`,
`three-canvas.client.component.tsx`, `mod.ts`) is deleted. Per-section backgrounds replace it.

#### Modified pods

| Pod | Change |
|---|---|
| `features/hero/` | Add `id="hero"`; accept `heroStyle` prop; add `<SectionBackground>` and `<SectionHeading>` |
| `features/about/` | Add `id="about"`; same style prop pattern |
| `features/work/` | Add `id="work"`; accept `workConfig`; wire `cardStyle` into `<ProjectCard>` |
| `features/contact/` | Add `id="contact"`; same style prop pattern; add `<WorldMap>` |
| `features/blog/` | Blog filters: replace `<input>` with `<HaloSearch>`; blog post: add `<LampEffect>` to prev/next |

#### New Payload globals

| Global | Slug | Purpose |
|---|---|---|
| `WorkConfig` | `work-config` | Work section background, title effect, and project card style |
| `UIConfig` | `ui-config` | World map locations (array of label + lat/lng) |

---

### 4.2 Design System

#### Typography

| Role | Font | Format | Variable |
|---|---|---|---|
| Headings, UI labels, nav, buttons | Inter (variable) | woff2 | `--font-heading` |
| Body text, blog prose | Lora (variable) | woff2 | `--font-body` |
| Code blocks | Existing `--font-mono` stack | — | `--font-mono` |

Delivery: `next/font/local` with `preload: true`, `display: 'swap'`, `weight: '100 900'` for both
variable fonts. Font files stored in `public/fonts/inter/` and `public/fonts/lora/`. CSS variables
auto-generated by Next.js (`--font-inter`, `--font-lora`). Mapped to semantic roles in `globals.css`:
```css
--font-heading: var(--font-inter), system-ui, sans-serif;
--font-body:    var(--font-lora), Georgia, serif;
```

#### Colour Palette

**Dark mode** (default — `html[data-theme="dark"]`):
```css
--color-bg:             #121212;
--color-surface:        #1a1a1a;
--color-surface-raised: #252525;
--color-text:           #F7F7F7;
--color-text-muted:     #a0a0a0;  /* 7.2:1 on #121212 — WCAG AAA */
--color-border:         #2a2a2a;
```

**Light mode** (`html[data-theme="light"]`):
```css
--color-bg:             #F7F7F7;
--color-surface:        #EEEEEE;
--color-surface-raised: #E5E5E5;
--color-text:           #121212;
--color-text-muted:     #555555;  /* 7.3:1 on #F7F7F7 — WCAG AAA */
--color-border:         #DDDDDD;
```

**5 Neon Accents** (same values in both modes — used as decorative/interactive highlights):
```css
--color-cta:           #00F7FF;  /* Electric Cyan   — CTAs, primary buttons */
--color-icon:          #00FF85;  /* Hyper Green     — icons, success states */
--color-border-accent: #FF0099;  /* Vivid Magenta   — decorative borders, glow */
--color-hover:         #FF8F00;  /* Safety Orange   — hover states */
--color-special:       #7C00FE;  /* Ultraviolet     — badges, special highlights */
```

All neon accents are decorative/interactive only — they are never used as body text color (insufficient
contrast in light mode). Interactive text always uses `--color-text` or `--color-text-muted`.

Remove: `--color-accent: #c9a84c` and `--color-accent-dim`. All existing references to
`--color-accent` must be migrated to the appropriate neon token.

#### Dark/Light Theme Toggle

- Default: dark (`data-theme="dark"` on `<html>` element)
- Persistence: `localStorage` key `"theme"`
- FOUC prevention: inline synchronous `<script>` in `<head>` (before first paint) reads localStorage
  and applies `data-theme`. Script uses `dangerouslySetInnerHTML` with a Biome suppress comment.
- `<html suppressHydrationWarning>` and `<body suppressHydrationWarning>` to prevent React mismatch warnings
- Toggle component: `features/ui/theme-toggle.client.component.tsx` — always present in `layout.tsx`,
  not CMS-controlled. Accessible `<button>` with `aria-pressed` and `aria-label`.

---

### 4.3 Canvas Strategy

#### Removal of Global Canvas

The existing `features/canvas/` pod is deleted. `<CanvasPlaceholder>` is removed from
`app/(portfolio)/page.tsx`. The global R3F canvas, galaxy particle system, and warp tunnel are
all removed.

#### Per-Section Background Architecture

Each section gets its own background, mounted inside the section element:

```tsx
<section id="hero" className={styles.section}>
  {/* section: position: relative in CSS */}
  <Suspense fallback={null}>
    <SectionBackground variant={heroStyle.background} />
  </Suspense>
  {/* content: z-index: 1, position: relative */}
  ...
</section>
```

`SectionBackground` (`features/ui/backgrounds/section-background.client.component.tsx`):
- `"use client"`, lazy-loaded at all usage sites
- `IntersectionObserver` gates WebGL init: canvas element is created only when the section enters
  the viewport (root margin: `200px`)
- Auto-falls back to rendering `null` (showing flat `--color-bg`) when:
  - WebGL2 is unavailable (`canvas.getContext('webgl2')` returns null)
  - `prefers-reduced-motion: reduce` is active (checked via `window.matchMedia`)
  - `variant` is `"none"`
- All Three.js backgrounds: `position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0`
- Section content positioned at `z-index: 1; position: relative`

#### 10 Background Variants

| Variant | Name | Tech | Key detail |
|---|---|---|---|
| `aurora` | Aurora | Three.js + GLSL frag | Flowing northern lights; neon palette colors |
| `particles` | Starfield | Three.js `Points` | Dense slow-drifting stars |
| `waves` | Waves | Three.js `PlaneGeometry` + GLSL vert | Sine/cosine displacement |
| `meteors` | Meteor Shower | Three.js `Line` segments | Streaking top-right to bottom-left |
| `grid` | Grid | CSS-only | `background-image` grid; RSC-safe, no WebGL needed |
| `noise` | Noise/Grain | Three.js fullscreen quad + GLSL frag | Simplex noise |
| `beams` | Light Beams | Three.js `ConeGeometry` + GLSL | Radiating from top center |
| `vortex` | Vortex | Three.js + GLSL frag | Spinning spiral/conic |
| `orbs` | Floating Orbs | Three.js `SphereGeometry` × 5–7 + bloom | One per neon accent color |
| `ripple` | Ripple | Three.js plane + GLSL frag | Water ripple displacement |

`none` is also a valid variant (transparent, shows flat `--color-bg`).

Multiple neon accents are used wherever possible: e.g., orbs background uses all 5 simultaneously;
glow border, aurora, and vortex use 2+ colors in their shaders/styles.

---

### 4.4 Component Inventory

#### Section Nav

`features/ui/section-nav.client.component.tsx`
- Fixed position, high `z-index`
- `<nav aria-label="Page sections">` with anchor links: `#hero`, `#about`, `#work`, `#contact`
- `<LiquidGlass>` background wrapper
- Each link wrapped in `<LampEffect>`
- `id` attributes added to all 4 section components (`hero-section`, `about-section`, `work-section`, `contact-section`)

#### Fluid Cursor

`features/ui/fluid-cursor.client.component.tsx`
- Canvas-based cursor with fluid physics (springs, lag) + neon color trails cycling through all 5 accents
- `"use client"`, lazy-loaded in `layout.tsx`
- Disabled entirely when `prefers-reduced-motion: reduce` (reactive `matchMedia` listener — not one-shot on mount)
- Renders nothing on touch/pointer: coarse devices (`window.matchMedia('(pointer: coarse)')`)

#### Lamp Effect

`features/ui/lamp-effect.client.component.tsx`
- Radial gradient cone of light beneath the hovered element
- Uses GSAP `gsap.to()` on an absolutely-positioned `<div>` — opacity/scale on hover, reset on leave
- Props: `children: ReactNode`, `color?: string` (default: `var(--color-cta)`)
- Applied to: SectionNav anchor links + blog `<BlogPost>` prev/next nav buttons

#### Halo Search

`features/ui/halo-search.client.component.tsx`
- Replaces `<input type="search">` in `blog-filters.client.component.tsx`
- Glowing ring animated on focus via CSS transition + GSAP (if needed): `box-shadow: 0 0 0 3px var(--color-cta), 0 0 20px var(--color-cta)`
- Props interface matches HTML `<input>` (forwarded ref, `onChange`, `value`, `placeholder`, `aria-label`, `id`)
- Accessible: keyboard navigable, correct ARIA, no additional wrapper roles

#### Liquid Glass

`features/ui/liquid-glass.client.component.tsx`
- Implementation order:
  1. Pure CSS: `backdrop-filter: blur(20px) saturate(180%)`, `background: rgba(255,255,255,0.05)`, `border: 1px solid rgba(255,255,255,0.1)`, `-webkit-backdrop-filter` prefix
  2. If CSS alone is insufficient for the Liquid Glass distortion effect: add SVG `<feTurbulence>` + `<feDisplacementMap>` filter for Chromium (detected via `CSS.supports('backdrop-filter', 'blur(1px)')`); plain `background: var(--color-surface)` for unsupported browsers
- Used for: SectionNav background

#### Animated Tooltip

`features/ui/animated-tooltip.client.component.tsx`
- `<span>` wrapper that shows a floating tooltip on hover
- Positioned with CSS absolute/fixed, avoids viewport clipping
- Props: `children`, `content: string`
- Applied to: technology tags on ProjectCard, date fields

#### Title Effects

| Component | Technique |
|---|---|
| `typewriter-text` | GSAP `stagger` character reveal with cursor blink |
| `glitch-text` | CSS `@keyframes` glitch via `::before`/`::after` with clip-path offsets |
| `gradient-text` | Pure CSS `linear-gradient` background-clip text (RSC-safe, no JS) |
| `shimmer-text` | CSS `@keyframes` animating `background-position` on a gradient-clip |
| `section-heading` | Dispatcher RSC: receives `variant` and `children`, renders correct effect |

`section-heading.component.tsx` is the sole public API — section components use only this.

#### Buttons

| Component | Effect |
|---|---|
| `glow-button` | `box-shadow` glow pulse on hover; uses 2+ neon colors |
| `border-beam-button` | `@property --angle` CSS conic-gradient animated border |
| `magnetic-button` | `mousemove` translates element ±20px toward cursor |

#### Cards

All 6 are selectable via `workConfig.projectCardStyle`. `<ProjectCard>` receives the selection and
renders the appropriate wrapper. Cards use multiple neon accent colors in rotation (by index mod 5).

| Component | Effect |
|---|---|
| `glow-card` | `box-shadow` glow on hover; 2+ neon colors by card index |
| `spotlight-card` | Radial gradient follows cursor via `mousemove` → CSS `--x, --y` properties |
| `tilt-card` | CSS `perspective` + `rotateX/Y` from `mousemove`; resets on `mouseleave` |
| `flip-card` | CSS `transform-style: preserve-3d`; `rotateY(180deg)` on hover; front: thumbnail + title; back: description + links |
| `glassmorphism-card` | `backdrop-filter: blur(12px)`; `border: 1px solid var(--color-border-accent)` |
| `border-beam-card` | Conic-gradient animated border; same technique as `border-beam-button` |

#### Decorative Borders

| Component | Technique |
|---|---|
| `glow-border` | `box-shadow: 0 0 8px VAR1, 0 0 20px VAR2`; uses 2+ neon colors; wraps children |
| `border-beam` | `@property --angle` conic-gradient animated border |
| `moving-border` | CSS animation cycles border color through all 5 neon accents |

#### World Map

`features/ui/world-map.component.tsx` — async RSC
- `dotted-map` npm package generates an SVG world map (no canvas/browser API; safe in RSC)
- Receives `locations: Array<{ label: string; lat: number; lng: number }>` from CMS `UIConfig`
- Location dots rendered as glowing `<circle>` elements with `fill: var(--color-cta)` and a
  `filter: drop-shadow(0 0 6px var(--color-cta))`
- Placed in `contact-section.component.tsx` below the social links

#### Blog Enhancements

**Reading Progress** (`reading-progress.client.component.tsx`)
- Fixed `top: 0; left: 0; height: 4px; background: var(--color-cta)` bar
- `scroll` event listener updates `width` as a percentage of document scrolled
- Added to `app/(portfolio)/blog/[slug]/page.tsx` layout

**Tracing Beam** (`tracing-beam.client.component.tsx`)
- Vertical line on left edge of blog post content that fills as user scrolls
- `scaleY` transform driven by `scroll` or `IntersectionObserver`
- Wraps `<BlogPost>` in blog post page
- Can be disabled per-post via `post.tracingBeam` CMS field (default: `true`)

#### Supplementary Carousels

| Component | Technique |
|---|---|
| `card-stack` | Stacked cards with `z-index` + `scale` offset; click cycles to next |
| `infinite-scroll-list` | CSS `animation: scroll linear infinite` on a duplicated list; no JS |
| `parallax-scroll` | `useScroll`-linked `translateY` on staggered layers |

---

### 4.5 CMS Schema Changes

#### Additions to Existing Globals

**`site-config` global** — add `heroStyle` group:
```ts
{
  name: "heroStyle", type: "group", label: "Hero Style",
  fields: [
    { name: "background", type: "select", options: BACKGROUND_OPTIONS, defaultValue: "none" },
    { name: "titleEffect", type: "select", options: TITLE_EFFECT_OPTIONS, defaultValue: "none" },
  ]
}
```

**`about` global** — add `aboutStyle` group (same shape as `heroStyle`)

**`contact` global** — add `contactStyle` group (same shape)

**`posts` collection** — add field:
```ts
{ name: "tracingBeam", type: "checkbox", defaultValue: true,
  admin: { description: "Show tracing beam on this post's page." } }
```

#### New Globals

**`work-config` global** (`collections/work-config.global.ts`):
```
slug: "work-config"
fields:
  - workStyle: group
    - background: select (BACKGROUND_OPTIONS, default: "none")
    - titleEffect: select (TITLE_EFFECT_OPTIONS, default: "none")
    - projectCardStyle: select (glow|spotlight|tilt|flip|glassmorphism|border-beam, default: "glow")
```

**`ui-config` global** (`collections/ui-config.global.ts`):
```
slug: "ui-config"
fields:
  - worldMapLocations: array
    - label: text (required)
    - lat: number (required)
    - lng: number (required)
```

#### CMS Service Layer Updates

- `features/cms/cms.schema.ts` — add `UIConfigSchema`, `WorkConfigSchema`; extend `SiteConfigSchema` (heroStyle), `AboutSchema` (aboutStyle), `ContactSchema` (contactStyle), `PostSchema` (tracingBeam)
- `features/cms/cms.repository.ts` — add `fetchUIConfig()`, `fetchWorkConfig()`
- `features/cms/cms.service.ts` — include both in `getAllPageData` via `Effect.all`; `PageData` extends with `uiConfig: UIConfigData`, `workConfig: WorkConfigData`
- `features/cms/mod.ts` — export `UIConfigData`, `WorkConfigData`, `UIConfigSchema`, `WorkConfigSchema`
- `payload.config.ts` — register `WorkConfig` and `UIConfig` in globals array

---

### 4.6 Technical Clarifications

**Three.js memory management**
Every background component that creates geometry, materials, or textures must dispose them in
`useEffect` cleanup. The `<canvas>` element's WebGL context must be lost intentionally via
`renderer.dispose()` and `gl.getExtension('WEBGL_lose_context')?.loseContext()` in cleanup.

**GSAP scope**
GSAP is already installed (`^3.14.2`). Import only `gsap` core (not ScrollTrigger) in UI
components that do not need scroll integration. Avoid bloating components with unused GSAP plugins.

**`prefers-reduced-motion` reactivity**
All motion gates must use a reactive `matchMedia` listener — not a one-shot check on mount. This
matches the existing `feedback_effect_ts.md` memory requirement.

**`dotted-map` RSC safety**
The `dotted-map` package performs all computation in pure JavaScript (no canvas, no browser APIs).
Safe to import in an async RSC. Verify by checking the package source has no `window` or
`document` references.

**Font `weight` range for variable fonts**
`next/font/local` requires `weight: '100 900'` (string range) to register the full axis of a
variable font in the generated `@font-face`. Omitting this restricts the font to a single weight.

**`@property --angle` for conic-gradient borders**
CSS `@property` lets the browser animate custom properties. The animated border trick registers
`--angle` as `<angle>` type and animates it from `0deg` to `360deg`. Fallback for unsupported
browsers: static border with `var(--color-border-accent)`.

**Liquid Glass on Safari**
`backdrop-filter` requires `-webkit-backdrop-filter` prefix. SVG displacement map approach works
only in Chromium. For Safari and Firefox: plain `background: var(--color-surface)` is the fallback
(no distortion, just glass transparency). This is the accepted trade-off.

**Neon accents in light mode**
Neon colors at full saturation fail WCAG AA on `#F7F7F7` as text. They are decorative-only in
light mode (borders, glows, shadows, backgrounds). Interactive and body text always uses
`--color-text` or `--color-text-muted`.

---

### 4.7 Architectural Decisions

**Pod isolation preserved**
All 30+ new components live in `features/ui/` with a single `mod.ts` barrel. Section pods
(`features/hero/`, `features/about/`, etc.) import from `@ui/mod` — never from internal paths.
Three.js background pods import GLSL files from `features/ui/backgrounds/shaders/` internally.

**CSS Modules throughout**
All styles are CSS Modules with design tokens from `globals.css`. No inline styles, no Tailwind,
no styled-components. Design token changes propagate automatically.

**Implementation phases maintain a green CI gate**
Phase A (CMS schema + canvas removal) must pass `pnpm typecheck && pnpm ci:check && pnpm test --run`
before Phase B begins. Each phase is independently committable.

**Section IDs for deep-linking and nav**
Adding `id="hero"` etc. to section elements enables anchor navigation from `<SectionNav>` without
JavaScript. Anchors use `href="#hero"` and CSS `scroll-behavior: smooth` (already set in `globals.css`).

---

## 5. Testing Decisions

### New Tests Required

| File | Verified |
|---|---|
| `features/ui/__tests__/theme-toggle.component.test.tsx` | Sets `data-theme`; persists to localStorage; reads initial state from localStorage |
| `features/ui/__tests__/section-heading.component.test.tsx` | Renders correct heading element for each variant; plain heading as fallback |
| `features/ui/__tests__/world-map.component.test.tsx` | SVG element rendered; location circle per CMS entry |
| `features/ui/__tests__/halo-search.component.test.tsx` | Renders `<input>`; correct `aria-label`; `onChange` fires |
| `features/ui/__tests__/reading-progress.component.test.tsx` | Progress element present in DOM |
| `features/cms/__tests__/cms.repository.unit.test.ts` | `fetchUIConfig` and `fetchWorkConfig` suites |
| `features/cms/__tests__/cms.service.unit.test.ts` | New method stubs in mock layers; `uiConfig` + `workConfig` in `getAllPageData` |

### Untestable in jsdom

Three.js backgrounds require WebGL — no GPU in the test environment. Test the **fallback path only**:
when `WebGLRenderingContext` is unavailable, `<SectionBackground>` renders `null`. Three.js canvas
rendering is verified manually in the browser.

### Existing Tests to Update

- `features/work/__tests__/project-card.component.test.tsx` — add required `cardStyle="glow"` prop
- `features/cms/__tests__/cms.service.unit.test.ts` — add `uiConfig`/`workConfig` stubs and assertions

### Coverage Thresholds

No change — maintain: lines ≥ 60%, functions ≥ 60%, branches ≥ 55%.

---

## 6. Out of Scope

- **Testimonials section** — not included in this PRD. May be added in a future PRD.
- **Shader Toy component** — not included. Deferred to a future phase.
- **A11y audit beyond WCAG AAA contrast** — manual axe/WAVE audit is recommended post-implementation but not part of this PRD's deliverables.
- **Storybook or component playground** — components are not built with Storybook in this phase.
- **Animation timelines and brand motion guide** — GSAP timings are hardcoded per component. A shared motion token system is not in scope.
- **Dark/light mode for Payload admin** — Payload admin retains its own dark/light system independent of the portfolio.
- **Blog listing page backgrounds** — `/blog` and `/blog/tag/[slug]` pages do not get section backgrounds in this PRD; plain `--color-bg` remains.

---

## 7. Further Notes

### Implementation Order

The implementation is divided into 8 sequential phases, each independently committable:

| Phase | Focus | CI gate |
|---|---|---|
| A | CMS schema changes + canvas pod removal | ✓ |
| B | Design system: fonts, colors, globals.css, token migration | ✓ |
| C | Section Nav + Theme Toggle + Liquid Glass | ✓ |
| D | Background system: all 10 variants + IntersectionObserver dispatcher | ✓ |
| E | Title effects + Lamp Effect + section integration | ✓ |
| F | Interactive components: Fluid Cursor, Halo Search, Tooltip, Buttons, Cards, Borders | ✓ |
| G | Blog + Contact enhancements: Progress Bar, Tracing Beam, World Map | ✓ |
| H | Supplementary carousels: Card Stack, Infinite Scroll, Parallax | ✓ |

### Dependencies to Add

```bash
pnpm add dotted-map
```

All other dependencies are already installed: `three`, `@react-three/fiber`, `@react-three/drei`,
`@react-three/postprocessing`, `gsap`, `@gsap/react`, `react-aria-components`.

### Verification (post-implementation)

```bash
# Type safety
pnpm typecheck

# Lint and format
pnpm ci:check

# Tests + coverage
pnpm test --run
pnpm test:coverage

# Production build
pnpm build

# Dev server visual checks
pnpm dev
# → Dark mode loads with no FOUC
# → Toggle to light mode → #F7F7F7 bg, persists on reload
# → Inter headings, Lora prose body
# → Section nav fixed, Lamp Effect on hover, glass background
# → Each section shows CMS-selected background
# → Fluid cursor trails on mouse move
# → Blog search halo ring on focus
# → Blog post: progress bar + tracing beam
# → Contact: World Map SVG with location dots
# → Project cards render chosen card style
# → prefers-reduced-motion → no Three.js canvases, no cursor trails
# → WebGL2 disabled in DevTools → flat --color-bg fallback everywhere
```

---

*End of PRD-004*
