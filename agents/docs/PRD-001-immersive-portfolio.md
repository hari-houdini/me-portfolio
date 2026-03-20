# PRD-001: Immersive 3D Portfolio — harihoudini.dev

**Status:** Approved  
**Author:** Hari Houdini  
**Created:** 2026-03-20  
**Last Updated:** 2026-03-20  
**Version:** 1.0.0

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution](#2-solution)
3. [User Stories](#3-user-stories)
4. [Implementation Decisions](#4-implementation-decisions)
   - 4.1 [Modules](#41-modules)
   - 4.2 [Interface of Modules](#42-interface-of-modules)
   - 4.3 [Technical Clarifications](#43-technical-clarifications)
   - 4.4 [Architectural Decisions](#44-architectural-decisions)
   - 4.5 [Schema Changes](#45-schema-changes)
   - 4.6 [API Contracts](#46-api-contracts)
   - 4.7 [Specific Interactions](#47-specific-interactions)
5. [Testing Decisions](#5-testing-decisions)
6. [Out of Scope](#6-out-of-scope)
7. [Further Notes](#7-further-notes)

---

## 1. Problem Statement

### Background

As a creative technologist and full-stack developer, I need a personal portfolio that genuinely reflects the depth, creativity, and technical excellence of my work. The existing landscape of developer portfolios is overwhelmingly homogeneous: static grids of project cards, plain hero sections with a headshot, and generic "About Me" copy. These portfolios are forgettable precisely because they are interchangeable.

### The Problem

**From my perspective as the portfolio owner:**

I have no credible, living proof-of-work that demonstrates what I am actually capable of building. When a potential client, collaborator, or employer visits a link I share, they see a standard, low-effort presentation — which directly contradicts the quality of the actual work I produce. This creates a trust deficit before any conversation begins. My portfolio is supposed to be my best first impression, but currently it is indistinguishable from thousands of template-based sites.

I also have no mechanism to update my portfolio without touching code. Every new project, every updated bio, every changed tagline requires a code change, a build, and a redeploy. This friction means my portfolio quickly becomes stale and I stop maintaining it.

**From my perspective as a visitor (potential client, employer, or collaborator):**

When I visit a developer's portfolio, I am immediately aware of how generic it feels. Within seconds I form a judgment about whether this person is exceptional or ordinary. A wall of text and a grid of screenshot thumbnails does not communicate mastery — it communicates "I followed a tutorial." I want to feel something when I visit a portfolio. I want the experience of the site itself to be evidence of the person's abilities. If the portfolio does not show me what they are capable of, why would I trust them with a real project?

### Core Problem Statement

> A portfolio that cannot demonstrate the creator's capabilities through its own existence is not a portfolio — it is a résumé in disguise. A creative technologist's portfolio must itself be a creative and technical artifact.

---

## 2. Solution

### Vision

Build an immersive, single-page 3D portfolio experience hosted at harihoudini.dev that serves as an undeniable proof-of-work. The experience should be cinematic, performant, and memorable — built entirely with WebGL, custom GLSL shaders, and procedural generation. Every pixel of the experience is authored code, not purchased assets.

### Solution from the Portfolio Owner's Perspective

I will have a living portfolio that:

- **Proves capability on arrival.** The moment a visitor lands on the page, they are inside a three-dimensional galaxy rendered in real-time in their browser tab. No screenshot could capture this. No template could produce it.
- **Sells itself without a pitch.** The technical difficulty of what they are experiencing IS the pitch. A visitor who is impressed by the site is already convinced of the technical ability.
- **Is fully content-managed.** Every title, tagline, project entry, bio, and contact detail is editable through a headless CMS admin panel. I can update my portfolio from anywhere in the world without touching code.
- **Scales with my career.** New pages, new sections, new projects — all addable through the CMS. The architecture is designed to grow without requiring architectural changes.

### Solution from the Visitor's Perspective

As a visitor, I will:

- **Be drawn into the experience immediately.** On page load, a cinematic animation reveals a galaxy seen from an angle, with my name rendered as glowing three-dimensional text floating in space.
- **Navigate through the experience naturally.** Scrolling feels physical and intentional. The camera moves through space with gravity and inertia, locking smoothly onto each section.
- **Travel through three distinct worlds:**
  1. A bright, gold-hued spiral galaxy seen at an angle — the introduction and identity
  2. A top-down view of the same galaxy — context and about me
  3. A dive into the galactic core, emerging into a rain-soaked Blade Runner cyberpunk city at night — projects and work
- **Find all the information I need**, presented clearly and elegantly, without the experience ever feeling like a gimmick that gets in the way of content.
- **Have an equally valid experience on any modern browser**, including a graceful, non-broken fallback on mobile devices.

---

## 3. User Stories

### 3.1 Visitor — First Impression

- As a **first-time visitor**, I want to see a visually stunning 3D environment on page load, so that I immediately understand this portfolio is unlike anything I have seen before.
- As a **first-time visitor**, I want to see the portfolio owner's name rendered as three-dimensional text in space, so that I immediately know whose work I am looking at.
- As a **first-time visitor**, I want the initial cinematic animation to play automatically and complete within a few seconds, so that I am oriented without having to do anything.
- As a **first-time visitor**, I want to see a subtle scroll prompt after the intro animation, so that I know how to continue navigating the experience.
- As a **first-time visitor**, I want the page to load quickly with a perceived progress indicator, so that I am not staring at a blank screen wondering if the page is broken.
- As a **first-time visitor**, I want the portfolio to work on a standard laptop without a dedicated GPU, so that I can have the full experience on typical hardware.
- As a **first-time visitor on a low-end device or mobile**, I want to see a graceful, non-broken fallback experience, so that the site does not show me a black screen or an error.

### 3.2 Visitor — Galaxy Section (Section 1)

- As a **visitor in Section 1**, I want to see a bright, gold-hued spiral galaxy rendered with hundreds of thousands of particles, so that the sense of cosmic scale is awe-inspiring.
- As a **visitor in Section 1**, I want to see the galaxy from an angled perspective (not top-down), so that the three-dimensionality and depth of the particle system is fully visible.
- As a **visitor in Section 1**, I want to read the portfolio owner's name and title as three-dimensional text that appears to exist within the galaxy scene, so that the introduction feels part of the world rather than overlaid on top of it.
- As a **visitor in Section 1**, I want the galaxy to have subtle animation (slow rotation, twinkling particles), so that the scene feels alive and not frozen.
- As a **visitor in Section 1**, I want the title and tagline text to be readable and clearly typeset, so that I can absorb the key identity information without squinting.

### 3.3 Visitor — Section Transition (Section 1 → Section 2)

- As a **visitor scrolling from Section 1**, I want the camera to smoothly pan and orbit from the angled galaxy view to a top-down view, so that the transition feels like a deliberate journey through space rather than a cut.
- As a **visitor scrolling from Section 1**, I want the scroll to feel physically weighted, with inertia and ease-in/ease-out curves, so that the camera movement feels natural and cinematic.
- As a **visitor who has scrolled past the midpoint between sections**, I want the camera to automatically snap/lock to Section 2, so that I am never stranded between two sections.
- As a **visitor using a trackpad**, I want smooth momentum-based scrolling to work as expected, so that the experience does not feel janky on Mac devices.

### 3.4 Visitor — Top-Down Galaxy Section (Section 2)

- As a **visitor in Section 2**, I want to see the galaxy from directly above, so that the full spiral arm structure is revealed and the visual composition changes dramatically from Section 1.
- As a **visitor in Section 2**, I want to see an HTML content overlay with contextual information about the portfolio owner, so that I can read about them while still being inside the immersive 3D environment.
- As a **visitor in Section 2**, I want the HTML overlay to appear smoothly as the camera locks into the top-down position, so that the content reveal feels part of the same cinematic experience.
- As a **visitor in Section 2**, I want to read an "About" section with rich text content, so that I learn who this person is, what they do, and what makes them distinctive.
- As a **visitor in Section 2**, I want any section title (e.g. "About") to be rendered as three-dimensional text inside the Three.js scene, so that the visual language of 3D titles is consistent across all sections.

### 3.5 Visitor — Section Transition (Section 2 → Section 3)

- As a **visitor scrolling from Section 2**, I want the camera to dive into the centre of the galaxy, so that I experience the sensation of travelling through space at high speed.
- As a **visitor experiencing the dive**, I want the galaxy particles to stretch and blur as the camera accelerates inward, so that the sensation of speed is visceral.
- As a **visitor completing the dive**, I want the scene to seamlessly transition into a rain-soaked cyberpunk mega-city viewed from above, so that the narrative shift from space to earth feels intentional and dramatic.

### 3.6 Visitor — Cyberpunk City Section (Section 3)

- As a **visitor in Section 3**, I want to see a procedurally generated Blade Runner-style mega-city from an aerial perspective, so that the tonal and visual shift from the galaxy is striking and deliberate.
- As a **visitor in Section 3**, I want to see falling rain rendered as animated particles, so that the city feels alive and immersive.
- As a **visitor in Section 3**, I want to see car light trails (red tail lights, white headlights) moving along procedural city routes, so that the city has movement and depth.
- As a **visitor in Section 3**, I want to see neon signs glowing on tall buildings, so that the Blade Runner aesthetic is fully realised.
- As a **visitor in Section 3**, I want a post-processing visual stack (bloom, depth-of-field, chromatic aberration, film grain, vignette) applied to the scene, so that the city looks cinematic and photorealistic in tone.
- As a **visitor in Section 3**, I want to see the work/projects content overlaid on the city scene, so that the portfolio content appears within the immersive context.
- As a **visitor in Section 3**, I want to be able to browse project cards floating within or above the city scene, so that I can explore the portfolio owner's work without leaving the experience.
- As a **visitor viewing a project card**, I want to see the project title, description, technology tags, year, and links to the live URL and GitHub, so that I have all the information I need to evaluate the work.

### 3.7 Visitor — Audio

- As a **visitor who wants a more immersive experience**, I want to opt into ambient audio for the city section, so that the rain, city hum, and subtle atmosphere add another sensory dimension.
- As a **visitor who does not want audio**, I want audio to be off by default, so that I am never surprised by unexpected sound.
- As a **visitor with audio enabled**, I want a clearly visible, accessible toggle to turn it off at any time, so that I am always in control.
- As a **visitor on a browser that blocks autoplay**, I want the site to gracefully handle the blocked autoplay, so that the site does not throw errors or show broken UI.

### 3.8 Visitor — Accessibility

- As a **visitor using a keyboard**, I want to navigate between sections using arrow keys or keyboard shortcuts, so that I can experience the portfolio without a mouse.
- As a **visitor using a screen reader**, I want the canvas to have an ARIA label and descriptive text, so that the content is not completely inaccessible to assistive technology.
- As a **visitor using a screen reader**, I want all portfolio content (name, bio, projects, contact) to have visually-hidden but machine-readable equivalents, so that a screen reader can surface all meaningful information.
- As a **visitor with `prefers-reduced-motion` enabled**, I want to see a simplified, non-motion-intensive version of the site, so that I am not triggered by heavy animation.
- As a **visitor on a mobile device**, I want a fully readable, styled fallback that surfaces all the same content as the 3D version, so that I do not miss any portfolio information.
- As a **visitor with colour blindness**, I want colour not to be the only differentiator for any piece of content, so that the site is usable regardless of colour vision.

### 3.9 Visitor — Contact

- As a **visitor who wants to get in touch**, I want to find contact information (email, social links) easily, so that I can initiate a conversation without having to hunt for it.
- As a **visitor viewing the contact section**, I want to see a clear call-to-action with the portfolio owner's preferred contact method, so that reaching out feels frictionless.
- As a **visitor who copies the email address**, I want it to be rendered as accessible, selectable text rather than an obfuscated image, so that I can copy it naturally.

### 3.10 Visitor — Performance

- As a **visitor on a fast connection**, I want the initial page to load in under 2.5 seconds (LCP target), so that I am not waiting long before the experience begins.
- As a **visitor on a slow connection**, I want the core HTML content to load and be readable before the Three.js bundle is fully parsed, so that the page is not blank while JavaScript loads.
- As a **visitor on any device**, I want the site to maintain a stable layout with no content shifts (CLS target: 0), so that nothing jumps around as assets load.
- As a **visitor in any country**, I want the site to be served from a CDN edge location close to me, so that latency does not degrade the experience.

### 3.11 Portfolio Owner — Content Management

- As the **portfolio owner**, I want to update my name, tagline, and section titles through a web-based admin panel, so that I never need to touch code for copy changes.
- As the **portfolio owner**, I want to add new projects through the admin panel with a title, description, thumbnail image, tags, year, and links, so that keeping my work section current takes minutes, not hours.
- As the **portfolio owner**, I want to edit my bio using a rich text editor, so that I can apply formatting (bold, italics, lists) without knowing HTML.
- As the **portfolio owner**, I want to update my contact information (email, social handles) through the admin panel, so that my contact details are always accurate.
- As the **portfolio owner**, I want to mark projects as "featured" so that the most important work is prominently displayed.
- As the **portfolio owner**, I want to reorder projects in the admin panel, so that I have full control over the sequence in which they are shown.
- As the **portfolio owner**, I want to publish or unpublish individual projects, so that draft work is never shown publicly.
- As the **portfolio owner**, I want image uploads handled by the CMS with automatic resizing, so that I do not need to prepare multiple image sizes manually.
- As the **portfolio owner**, I want to log in to the CMS admin panel from any device with internet access, so that I can update content while travelling.
- As the **portfolio owner**, I want the CMS admin panel to be password-protected, so that no one else can modify my content.
- As the **portfolio owner**, I want changes I make in the CMS to be reflected on the live portfolio after a cache revalidation, so that updates feel immediate.
- As the **portfolio owner**, I want the ability to add entirely new pages or sections later, so that the portfolio architecture can accommodate future growth without a rebuild.

### 3.12 Portfolio Owner — SEO and Discoverability

- As the **portfolio owner**, I want the portfolio to have correct meta tags (title, description, OG image, Twitter card), so that links shared on social media display rich previews.
- As the **portfolio owner**, I want the meta title and meta description to be editable through the CMS, so that I can optimise them without a code change.
- As the **portfolio owner**, I want the page to be indexed correctly by search engines, so that my name and professional identity are discoverable.
- As the **portfolio owner**, I want server-side rendered HTML so that search engine crawlers can index the content, so that the portfolio ranks for my name.

### 3.13 Developer — Code Quality and Architecture

- As the **developer**, I want all business logic in the service layer to be written using functional, typed effects (Effect-ts), so that error handling is explicit and exhaustive at every call site.
- As the **developer**, I want all features to be colocated in self-contained pods, so that adding, removing, or refactoring any feature does not require changes across unrelated parts of the codebase.
- As the **developer**, I want every public module interface to be expressed through a typed barrel file, so that internal implementation details are never accidentally depended on externally.
- As the **developer**, I want all new code to pass linting and formatting checks automatically, so that the codebase style is always consistent.
- As the **developer**, I want the test suite to run in under 30 seconds, so that the feedback loop for making changes is fast.
- As the **developer**, I want integration tests to verify that route loaders return the correct shape of data, so that I catch regressions without running the browser.
- As the **developer**, I want the deployment of the portfolio and the CMS to be independent, so that I can update content without redeploying the frontend and vice versa.

---

## 4. Implementation Decisions

### 4.1 Modules

The following modules (feature pods and shared services) will be built or significantly modified. Each module is a self-contained unit with a single public interface exported from its barrel file.

#### New Modules — Portfolio Application

| Module | Responsibility |
|---|---|
| **experience** | Owns the root Three.js canvas, the camera rig, post-processing chain, and scene lifecycle. The single entry point for all 3D rendering. |
| **galaxy** | Owns the particle system for Sections 1 and 2. Procedurally generates the spiral arm geometry, custom GLSL shaders, and Three.js title text for section headings. |
| **city** | Owns all Section 3 3D content: procedural buildings, rain particle system, car light trails, neon sign meshes, and their associated shaders. |
| **hero** | Owns the HTML overlay content for Section 1: the name, tagline, and scroll prompt displayed over the galaxy scene. |
| **about** | Owns the HTML overlay content for Section 2: the bio, skills, and section title. |
| **work** | Owns the HTML overlay content for Section 3: the project grid, individual project cards, and featured project highlighting. |
| **contact** | Owns the HTML overlay content for the contact section: email, social links, and the call-to-action. |
| **audio** | Owns the Web Audio API integration: ambient sound loading, playback, volume control, and the accessible audio toggle component. |
| **cms** (service) | Owns all communication with the Payload CMS REST API. Expresses every operation as an Effect-ts effect. Contains the repository (raw HTTP), the service (composed operations), and the tagged error types. |
| **runtime** (service) | Owns the Effect-ts managed runtime, the application layer composition, and the program entry point used by route loaders. |

#### Modified Modules — Existing Code

| Module | Change |
|---|---|
| **app root** | Updated to load the correct fonts (Outfit, Space Grotesk, Inter fallback), configure global CSS variables for the cyberpunk colour palette, and set up the canvas placeholder for LCP performance. |
| **home route** | Extended with a server-side loader that fetches all page data from the CMS service layer using the Effect-ts runtime. |
| **vite config** | Extended with the GLSL import plugin so that vertex and fragment shader files can be imported as typed strings. |

#### New Modules — CMS Application

| Module | Responsibility |
|---|---|
| **Projects collection** | Defines the schema for portfolio project entries including all fields, validation rules, and access control. |
| **Media collection** | Configures Payload's built-in media upload handling with image size variants for thumbnails and OG images. |
| **SiteConfig global** | Defines the singleton document that holds the portfolio owner's name, tagline, section titles, and SEO metadata. |
| **About global** | Defines the singleton document for the About section bio (rich text) and skills list. |
| **Contact global** | Defines the singleton document for the contact email, social links array, and CTA text. |
| **Access control** | Defines the `isAdmin` access function that gates all write operations to authenticated admin users only. |

---

### 4.2 Interface of Modules

Each module exposes its public interface exclusively through its barrel file. The following describes what each module's public API consists of.

#### `experience` module public interface
- A single React client component that accepts the current scroll section as a prop and renders the full Three.js canvas including the camera rig and post-processing.
- A TypeScript type representing the scroll section enumeration (GALAXY_ANGLED, GALAXY_TOP, CITY).

#### `galaxy` module public interface
- A React client component for the particle system that accepts particle count and a colour configuration as props.
- A React client component for the 3D section title text that accepts a string and a world-space position as props.
- A TypeScript type for the galaxy configuration shape.

#### `city` module public interface
- A React client component that orchestrates the full city scene including buildings, rain, car lights, and neon signs.
- A TypeScript type for the city configuration shape.

#### `hero`, `about`, `work`, `contact` modules — public interface (each)
- A single React client component for the HTML overlay, accepting a typed data object sourced from the CMS loader as its primary prop.
- A TypeScript type matching the CMS data shape for that section.

#### `audio` module public interface
- A React client component for the accessible audio toggle button.
- An Effect-ts service tag for the audio service (used internally; exposed for testing).

#### `cms` service module public interface
- An Effect-ts `Context.Tag` for the CMS service.
- The live Layer implementation of the service.
- TypeScript types for each CMS resource (SiteConfig, About, Project, Contact).
- Tagged error classes for network errors and parse errors.

#### `runtime` service module public interface
- The Effect-ts `ManagedRuntime` instance used by all route loaders.
- The composed application `Layer`.

---

### 4.3 Technical Clarifications

**Three.js and Server-Side Rendering**
Three.js and WebGL have no existence on the server. The Three.js canvas component must be lazy-loaded with React's lazy and Suspense so that it only instantiates in the browser. The server renders an HTML placeholder (sized to match the canvas) to prevent layout shift. Route loaders on the server side never import any Three.js module.

**Effect-ts Scope**
Effect-ts is applied exclusively to the data and service layer — specifically the CMS repository and service. React components, Three.js scene logic, scroll orchestration, and shader code do not use Effect-ts. The boundary is: once data has been resolved and passed as props to a component, Effect-ts has completed its work.

**Scroll Architecture Boundary**
Two scroll libraries are used for distinct purposes. `@react-three/drei`'s `ScrollControls` owns the scroll-to-3D-animation relationship inside the React Three Fiber canvas. GSAP ScrollTrigger owns the magnetic section snap behaviour at the page level. These two systems communicate via a shared scroll progress value. They do not overlap in responsibility.

**Font Files for 3D Text**
The `@react-three/drei` `<Text>` component uses the `troika-three-text` library internally. This library can load TTF and OTF font files directly. The Outfit TTF files served by Google Fonts are fully compatible. No font conversion step is required.

**Cloudflare Workers and Node.js APIs**
Cloudflare Workers use the V8 JavaScript engine, not Node.js. APIs such as `fs`, `path`, and `Buffer` are not available by default. All server-side code (route loaders) must use only Web Standard APIs (fetch, URL, Response, Headers) or the Cloudflare Workers Node.js compatibility layer (enabled in wrangler.toml). Effect-ts is compatible with this environment as it uses no Node.js-specific APIs.

**Payload CMS v3 Admin Panel**
Payload v3 ships its admin panel as a Next.js 15 App Router application. The CMS is therefore a standalone Next.js project that runs independently of the portfolio. The portfolio's `/admin` route in the route manifest is a redirect to the externally-hosted CMS admin URL. There is no route conflict — the two applications are served from different domains.

**Effect-ts Runtime Lifecycle**
The Effect-ts `ManagedRuntime` is initialised once at module load time in the portfolio server entry. The same runtime instance is reused across all incoming requests. This avoids re-initialising the layer composition on every request, which would incur unnecessary overhead.

**GLSL Shader Imports**
Custom vertex and fragment shaders for the galaxy particle system and the city rain/neon shaders are authored as separate GLSL files. The Vite GLSL plugin transforms these files into typed string constants at build time. This enables shader code to be syntax-highlighted, linted independently, and tree-shaken correctly without any manual string concatenation.

**Mobile Fallback Mechanism**
The decision of whether to render the Three.js canvas is made at the React hydration boundary. The canvas is replaced with a CSS gradient background on screens narrower than 1024px or when `prefers-reduced-motion` is set to `reduce`. All portfolio content is still visible in the fallback via standard HTML and CSS.

---

### 4.4 Architectural Decisions

#### Pod (Feature-Grouped) Module Structure
All code is organised into self-contained feature pods. A pod contains everything a feature needs: React components, TypeScript types, GLSL shaders, utility functions, and tests. No file belonging to a pod imports directly from inside another pod's internals — only from the target pod's barrel file. This enforces clear module boundaries and makes features independently moveable.

**Barrel file discipline:** A pod's barrel file (`mod.ts`) only exports the minimum public surface area. It never re-exports internal utilities, internal sub-components, or implementation details. Consumers of a pod depend only on the barrel. This allows internal refactoring without any external impact.

#### Server-Side Rendering with Cloudflare Workers via Hono
The portfolio is a server-side rendered React Router v7 application. Server rendering provides fully-formed HTML for fast First Contentful Paint and correct SEO indexing. The server entry point uses Hono as a thin middleware layer around React Router's request handler. Hono is responsible for setting security headers, CORS configuration, and any future middleware needs. React Router's `createRequestHandler` handles all routing, data loading, and HTML rendering. This runs on Cloudflare Workers for globally-distributed edge rendering at zero cost.

#### Headless CMS with REST API Consumption
Payload CMS operates as a completely separate application (separate process, separate domain, separate deployment). The portfolio fetches CMS data exclusively via Payload's auto-generated REST API in server-side route loaders. No direct database connection or server-to-server SDK is used from the portfolio server. This decouples the two applications entirely — either can be redeployed, scaled, or replaced without affecting the other.

#### Effect-ts for Typed, Composable Data Operations
All CMS data fetching is expressed as `Effect.Effect` computations with explicit error types. This means:
- Every possible failure mode (network error, parse error, timeout) is represented in the return type — there are no hidden exceptions.
- Operations are composed using `Effect.all` for concurrent fetching, keeping route loaders fast.
- The service is injected via `Effect.Layer` and `Context.Tag`, meaning the implementation can be swapped for a test double without changing consumer code.
- Error handling at the loader boundary converts Effect failures into typed HTTP responses using pattern matching on the error discriminant.

#### SOLID Principles Applied to Service Layer
- **Single Responsibility:** Each service class owns exactly one domain of behaviour (CMS data, audio, etc.).
- **Open/Closed:** New CMS resources are added by extending the service interface and adding a new method, not by modifying existing methods.
- **Liskov Substitution:** The live CMS service and any test mock implement the same interface and are interchangeable at the call site.
- **Interface Segregation:** Components and loaders only depend on the specific CMS service methods they use, not the full service interface.
- **Dependency Inversion:** Route loaders depend on the abstract `CmsService` tag, not on the live implementation. The live implementation is provided at runtime via the Effect layer.

#### Purely Procedural 3D Assets
All 3D visual content — the galaxy particle system, the spiral arm geometry, the city buildings, rain, car lights, and neon signs — is generated procedurally in TypeScript and GLSL at runtime. No external 3D model files, textures, HDR maps, or audio files are bundled into the application. This eliminates large asset loading times, removes licence concerns, makes the visuals fully customisable via parameters, and is itself a demonstration of technical capability.

#### Scroll-Driven Camera with Magnetic Section Snap
The camera animation is driven entirely by the user's scroll position. `@react-three/drei`'s `ScrollControls` normalises the scroll offset to a 0→1 range and makes it available to React Three Fiber components via the `useScroll()` hook. The camera's position and orientation are interpolated along a predefined bezier path using this normalised offset. GSAP ScrollTrigger is applied to the outer page scroll container to implement the magnetic snap: once scroll reaches a configurable threshold near a section boundary, the scroll position is animated automatically to the next section anchor.

#### Desktop-First with Graceful Mobile Degradation
The full Three.js experience targets desktop browsers (≥1024px viewport, hardware with WebGL 2 support). On mobile or with `prefers-reduced-motion`, the canvas is not rendered. Instead, the mobile visitor sees a CSS-animated gradient background paired with fully accessible HTML content that mirrors all the portfolio information. No content is gated behind the 3D experience.

---

### 4.5 Schema Changes

#### New: `projects` Collection (Payload CMS)

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | text | yes | Project display name |
| `description` | textarea | yes | Short description (used in card) |
| `longDescription` | richText | no | Full project detail |
| `thumbnail` | upload (Media) | no | Card thumbnail image |
| `tags` | array of text | no | Technology tags e.g. "React", "Three.js" |
| `url` | text | no | Live project URL |
| `github` | text | no | GitHub repository URL |
| `featured` | checkbox | no | Pinned to top of work section |
| `year` | number | no | Year of completion |
| `status` | select (draft, published) | yes | Controls public visibility |
| `order` | number | no | Manual display order |

#### New: `media` Collection (Payload CMS)

Standard Payload media collection with the following image size variants:

| Size Name | Width | Use |
|---|---|---|
| `thumbnail` | 400px | Project card |
| `og` | 1200px | Open Graph / social sharing |

#### New: `site-config` Global (Payload CMS)

| Field | Type | Notes |
|---|---|---|
| `name` | text | Portfolio owner full name (default: "Hari Houdini") |
| `tagline` | text | Role/subtitle (default: "Creative Technologist") |
| `subtitle` | text | Secondary line of hero text |
| `sectionTitles.hero` | text | Section 1 title |
| `sectionTitles.about` | text | Section 2 title |
| `sectionTitles.work` | text | Section 3 title |
| `sectionTitles.contact` | text | Contact section title |
| `seo.metaTitle` | text | HTML `<title>` tag value |
| `seo.metaDescription` | textarea | Meta description |
| `seo.ogImage` | upload (Media) | Open Graph preview image |

#### New: `about` Global (Payload CMS)

| Field | Type | Notes |
|---|---|---|
| `bio` | richText | Main biography — supports bold, italic, links, lists |
| `skills` | array of text | Technology/skill tags |
| `photo` | upload (Media) | Optional portrait |

#### New: `contact` Global (Payload CMS)

| Field | Type | Notes |
|---|---|---|
| `email` | email | Primary contact email |
| `ctaText` | text | Call-to-action label (e.g. "Let's work together") |
| `socials` | array | Each entry: `platform` (select), `url` (text), `label` (text) |

---

### 4.6 API Contracts

The portfolio server communicates with the Payload CMS exclusively via its auto-generated REST API. All requests are made server-to-server from Cloudflare Workers to the Railway-hosted CMS.

#### Base URL
`PAYLOAD_API_URL` environment variable. Example: `https://cms.harihoudini.dev`

#### Authentication
All read endpoints are public (no authentication required). Write endpoints require Bearer token authentication. The portfolio server only performs reads.

#### Endpoints Used by the Portfolio

| Operation | Method | Path | Response Shape |
|---|---|---|---|
| Get site config | GET | `/api/globals/site-config` | `SiteConfig` object |
| Get about | GET | `/api/globals/about` | `About` object |
| Get contact | GET | `/api/globals/contact` | `Contact` object |
| Get published projects | GET | `/api/projects?where[status][equals]=published&sort=order&limit=100` | `{ docs: Project[], totalDocs: number }` |
| Get featured projects | GET | `/api/projects?where[featured][equals]=true&where[status][equals]=published&sort=order` | `{ docs: Project[], totalDocs: number }` |

#### Expected Response Types

**SiteConfig**
```
{
  name: string
  tagline: string
  subtitle: string | null
  sectionTitles: {
    hero: string
    about: string
    work: string
    contact: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    ogImage: MediaObject | null
  }
}
```

**Project**
```
{
  id: string
  title: string
  description: string
  longDescription: RichTextDocument | null
  thumbnail: MediaObject | null
  tags: string[]
  url: string | null
  github: string | null
  featured: boolean
  year: number | null
  status: "draft" | "published"
  order: number | null
}
```

**MediaObject**
```
{
  url: string
  width: number
  height: number
  alt: string | null
  sizes: {
    thumbnail: { url: string; width: number; height: number } | null
    og: { url: string; width: number; height: number } | null
  }
}
```

#### Error Handling Contract
The CMS service layer maps all API responses to typed Effect results:
- HTTP 4xx responses → `CmsNotFoundError` or `CmsAccessError`
- HTTP 5xx responses → `CmsNetworkError`
- Network failures (timeout, DNS) → `CmsNetworkError`
- Invalid response shape → `CmsParseError`

Route loaders handle each error variant with explicit pattern matching, returning appropriate HTTP status codes and fallback data where applicable.

---

### 4.7 Specific Interactions

#### Page Load Flow
1. Visitor navigates to `harihoudini.dev`
2. Cloudflare Workers Hono server receives the request
3. React Router's `createRequestHandler` invokes the home route loader
4. The loader runs an Effect-ts program that concurrently fetches all four globals and the projects collection from the Payload REST API
5. Resolved data is passed to the route component as loader data
6. React Router renders the full HTML shell server-side, including all text content and meta tags
7. The HTML response is streamed to the browser
8. The browser displays the server-rendered HTML (fast First Contentful Paint)
9. React hydrates the page
10. The lazy-loaded Three.js canvas initialises (off the critical path)
11. The cinematic intro animation plays automatically

#### Scroll Section Transition Flow
1. User begins scrolling
2. GSAP ScrollTrigger observes scroll position against section boundary thresholds
3. When scroll passes a magnetic snap threshold, ScrollTrigger animates scroll position to the next section anchor
4. `@react-three/drei` `ScrollControls` normalises the scroll offset to a 0–1 range and provides it to the canvas via `useScroll()`
5. The `CameraRig` component reads the current scroll offset on every animation frame
6. GSAP `gsap.to()` interpolates the camera's position and quaternion along the predefined bezier path
7. Three.js renders the updated camera position at 60fps

#### CMS Content Update Flow
1. Portfolio owner logs into `cms.harihoudini.dev/admin`
2. Owner edits a project or global in the Payload admin panel
3. Owner clicks Publish/Save
4. Payload writes the change to the PostgreSQL database on Supabase
5. On the next page request to the portfolio, the route loader fetches fresh data from the Payload REST API
6. The updated content is reflected in the server-rendered response

#### Audio Toggle Interaction Flow
1. Ambient audio is initialised but suspended by default (Web Audio API `AudioContext` in `suspended` state)
2. The audio toggle button is visible in the UI with an accessible label indicating the current state
3. User clicks the toggle
4. The Web Audio API `AudioContext` resumes (satisfying the browser autoplay policy — user gesture required)
5. Ambient audio begins playing at a low volume with a fade-in
6. The toggle button label updates to reflect the "on" state
7. User may click again to toggle off; audio fades out and `AudioContext` is suspended again

#### Three.js Canvas Load and Fallback Flow
1. React Router renders the home page server-side; the canvas position renders a styled placeholder div with dimensions matching the viewport
2. On the client, React hydrates and evaluates the lazy canvas component
3. If the device viewport is ≥1024px and WebGL2 is supported: the Three.js canvas mounts and begins initialising
4. If the device viewport is <1024px or WebGL is not supported: the canvas is not mounted; the CSS gradient fallback remains in place; all HTML content overlays are displayed in a standard document flow layout
5. If `prefers-reduced-motion` is set: the canvas mounts but the cinematic intro is skipped and all scroll-driven animations are reduced to simple opacity fades

---

## 5. Testing Decisions

### 5.1 What Makes a Good Test

A good test verifies the **observable, external behaviour** of a module, not its internal implementation. The following principles define the testing standards for this project:

**Test what, not how.** Tests should describe what a module does from the outside — what it returns given certain inputs, what HTTP requests it makes, what it renders given certain props. Tests should never assert on private methods, internal variable names, or implementation patterns (e.g. which React hook is called, whether a particular class is instantiated).

**Tests are coupled to contracts, not code.** If internal code changes but observable behaviour stays the same, no test should break. If a test breaks purely because of a refactor that preserves behaviour, the test is testing the wrong thing.

**Arrange–Act–Assert.** Every test should have a clear, linear structure: set up the preconditions, perform the operation, assert on the result.

**One behavioural assertion per test.** Each test case covers one specific observable outcome. Multiple assertions in one test are acceptable only if they are all asserting on the same single behaviour from different angles.

**Tests are deterministic.** Tests never rely on timing, global state, or network access. All HTTP calls are intercepted by MSW. All time-dependent code uses fake timers or injected clock dependencies.

**Meaningful test names.** Test descriptions follow the pattern: `"[module name]: [given condition], [expected behaviour]"`. Names should be readable as sentences explaining the product requirement being verified.

**Test doubles (mocks) are isolated.** Mock implementations of the CMS service use the same TypeScript interface as the live implementation. Mocks are not knowledge of internal structure — they are alternative implementations of the public contract.

---

### 5.2 Which Modules Will Be Tested

| Module | Test Types | What Is Verified |
|---|---|---|
| `cms` service | Unit, Integration | Effect computations return correct data on success; return correct tagged error types on network failure, parse failure, and 4xx/5xx HTTP responses; concurrent fetching with `Effect.all` resolves all operations |
| `cms` repository | Unit (with MSW) | HTTP requests are made to the correct Payload endpoints with correct query parameters; response bodies are parsed to the expected type; HTTP error codes produce the correct CmsError variants |
| Galaxy generator utility | Unit | Generated particle positions match the expected count; positions fall within the expected spatial bounds; colour values are within the valid range; the algorithm is deterministic given the same seed |
| City generator utility | Unit | Generated building count matches the grid size; building heights fall within the expected min/max bounds; car route coordinates form valid paths on the city grid |
| `hero`, `about`, `work`, `contact` overlay components | Component | Correct content renders given typed CMS data props; empty/null optional fields render graceful fallbacks rather than broken UI; ARIA roles and labels are present |
| `audio` module | Unit | Audio context state transitions (suspended → running → suspended) are correct; the toggle component reflects the correct accessible label for each state; autoplay policy refusal is handled without throwing |
| Home route loader | Integration | Loader returns all four data shapes on success; loader returns a typed fallback when the CMS is unreachable; loader sets correct HTTP response headers |
| `ProjectCard` component | Component | All provided project fields are rendered; missing optional fields (thumbnail, url, github) do not render broken elements; featured badge is rendered only when `featured` is true |

**Not tested:**
- Three.js/WebGL rendering internals (impractical in a jsdom environment; WebGL is not available in Node.js)
- GLSL shader correctness (requires a GPU and a WebGL context; verified manually in the browser)
- Scroll camera animation curves (driven by GSAP; tested manually and via browser visual inspection)
- CMS admin panel behaviour (Payload's own test suite covers this)

---

### 5.3 Prior Art for Tests

At the time of this PRD, the codebase is a freshly scaffolded React Router v7 project with no existing tests. There is no prior art to reference.

The following test patterns serve as the established conventions for this project going forward:

- **Effect-ts service tests** follow the pattern: construct the live layer, run the effect program against an MSW-intercepted HTTP server, assert on the resolved value or error discriminant.
- **React component tests** use `@testing-library/react` with `render`, `screen`, and `userEvent`. They query by accessible role and label, never by CSS class or internal component name.
- **Route loader integration tests** use React Router's `createStaticHandler` and `createStaticRouter` utilities to invoke the loader in an environment that closely matches the actual server execution.

---

## 6. Out of Scope

The following items are explicitly **not** in scope for this PRD. They may be addressed in future PRDs.

- **Blog or articles section.** A blog with individual article pages is not included. Content is limited to the four CMS globals and the Projects collection.
- **Dark/light mode toggle.** The portfolio has a single visual theme (cyberpunk dark). A user-controllable theme toggle is not planned.
- **Internationalisation (i18n).** The portfolio is English-only.
- **Analytics or telemetry.** No client-side tracking, event analytics, or performance monitoring is included in this phase.
- **Contact form submission.** The contact section displays contact information. A form that sends email is not included.
- **CMS user management with roles.** The CMS will have a single admin user. Multi-user CMS access with role-based permissions is not in scope.
- **A/B testing.** No experimentation or feature-flag infrastructure is included.
- **Offline support / Progressive Web App (PWA).** Service worker caching and offline fallback are not included.
- **Continuous deployment pipeline (CI/CD).** Automated deployment workflows (GitHub Actions, etc.) are not configured as part of this PRD.
- **Performance monitoring (RUM).** Real User Monitoring or Core Web Vitals dashboards are not set up.
- **Three.js scene editor or parameterisation UI.** Visual parameters (particle count, camera paths, colour palettes) are code-level constants. There is no in-browser UI for adjusting them.
- **WebXR / VR support.** The Three.js canvas does not target VR headset rendering.
- **Social proof / testimonials section.** Testimonials are not included in the initial CMS schema.

---

## 7. Further Notes

### On Performance and Core Web Vitals

Achieving strong Core Web Vitals while loading a 150,000-particle Three.js scene requires deliberate engineering choices. The key decisions that protect LCP and CLS:

- The server always renders the HTML content (name, tagline, bio, project titles). Text is visible immediately without JavaScript.
- Three.js is loaded via a lazy import, entirely off the critical rendering path. The canvas is treated as a progressive enhancement.
- The canvas container is given explicit dimensions in CSS before Three.js mounts, preventing layout shift.
- GPU particle instancing means the galaxy scene is a single draw call, keeping render time low even at high particle counts.
- Fonts are preloaded via `<link rel="preload">` in the HTML head.

### On the Cyberpunk City and Procedural Generation

The Blade Runner / Ghost in the Shell aesthetic of Section 3 is entirely synthesised in code. The city is generated from a deterministic pseudorandom function seeded with a constant, meaning the layout is always the same across page loads. The rain, car lights, and neon animations loop on independent timers to avoid any visible repeat pattern within a normal viewing session.

The depth-of-field post-processing effect in Section 3 uses a bokeh blur focused at street level. As the camera descends during the Section 2 → Section 3 transition, the focal plane shifts progressively from far-distance (galaxy) to near-distance (city street), reinforcing the sense of arrival.

### On the Effect-ts Service Layer

Effect-ts v3 introduces significant changes from earlier versions. The primary pattern used throughout this project is `Effect.gen` (generator-based effect composition) rather than pipe/flatMap chains, as this produces more readable and debuggable code for developers unfamiliar with functional programming.

The `ManagedRuntime` is used rather than `Effect.runPromise` directly, because `ManagedRuntime` preserves the layer composition across multiple effect runs, avoiding the cost of re-building the layer on every request. This is particularly important in a serverless edge environment where cold start time is a concern.

### On Payload CMS v3 Architecture

Payload v3 is architecturally dependent on Next.js 15 for its admin panel. The CMS subfolder is therefore a Next.js 15 application. This is the officially supported approach and is not a limitation — it means the admin panel benefits from Next.js's App Router, server actions, and streaming, giving an excellent editing experience. The portfolio itself remains on React Router v7.

The Payload REST API is the integration boundary. Any future migration of the portfolio framework (e.g., to Remix v3, or a custom Hono server) would leave the CMS entirely unaffected.

### On Zero-Cost Deployment

The target deployment cost is as close to zero as possible for a personal portfolio with moderate traffic. The cost model:

| Service | Tier | Cost |
|---|---|---|
| Cloudflare Workers | Free tier (100K requests/day) | $0/month |
| Supabase PostgreSQL | Free tier (500MB storage, 2 CPU) | $0/month |
| Railway.app (CMS) | Free trial credit, then ~$5/month | ~$0–$5/month |
| Cloudflare R2 (media storage) | Free tier (10GB storage) | $0/month |

Total: **$0–$5/month** depending on Railway usage.

### On Future Extensibility

The CMS architecture is designed for pages to be added without code changes. The route manifest in React Router v7 can be extended with a dynamic route segment that fetches page configuration from the CMS. This would allow entirely new portfolio pages (e.g., a writing section, a case studies section) to be created and published purely through the admin panel, without a code deployment.

---

*End of PRD-001*
