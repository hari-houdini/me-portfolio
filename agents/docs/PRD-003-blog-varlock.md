# PRD-003: Blog and Typed Environment — harihoudini.dev

**Status:** Approved
**Author:** Hari Houdini
**Created:** 2026-04-02
**Last Updated:** 2026-04-02
**Version:** 1.0.0
**Linked Issue:** TBD
**Linked PRD:** [PRD-002 — Architecture Rewrite](./PRD-002-architecture-rewrite.md)
**Linked Spec:** [REWRITE-001 — Implementation Guide](./REWRITE-001-architecture-rewrite.md)

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution](#2-solution)
3. [User Stories](#3-user-stories)
   - 3.1 [Portfolio Owner — Publishing](#31-portfolio-owner--publishing)
   - 3.2 [Visitor — Blog Experience](#32-visitor--blog-experience)
   - 3.3 [Developer — Environment Safety](#33-developer--environment-safety)
4. [Implementation Decisions](#4-implementation-decisions)
   - 4.1 [Modules](#41-modules)
   - 4.2 [Technical Clarifications](#42-technical-clarifications)
   - 4.3 [Architectural Decisions](#43-architectural-decisions)
   - 4.4 [Schema Changes](#44-schema-changes)
   - 4.5 [Quality Standards](#45-quality-standards)
5. [Testing Decisions](#5-testing-decisions)
6. [Out of Scope](#6-out-of-scope)
7. [Further Notes](#7-further-notes)

---

## 1. Problem Statement

### Background

Phase 3 (PRD-002) delivers a fully accessible, server-side rendered HTML shell of the portfolio. The
shell surfaces all CMS-managed content — name, bio, projects, contact — but the site has no
mechanism for the owner to publish long-form writing. A portfolio without a writing presence
communicates only what was built, not how the builder thinks.

Additionally, environment variables in the application are consumed via raw `process.env` access
scattered across `payload.config.ts` and `sst.config.ts`. There is no centralised validation, no
compile-time safety, and no guarantee that a misconfigured deployment fails loudly at startup rather
than silently at runtime when the first CMS query is made.

### From the Portfolio Owner's Perspective

I have deep opinions on technology, craft, and creative process. I publish regularly on dev.to,
where my posts reach a wide audience. Today, those posts live on a platform I do not control:
dev.to's algorithm, design, and domain. I have no version of that content on my own site. When I
share a link to my work it points elsewhere, not to harihoudini.dev.

I also have no awareness that my environment is misconfigured until something breaks in production —
at which point I am debugging live failures rather than catching problems at startup.

### From a Visitor's Perspective

When I visit a developer's portfolio I judge their thinking as much as their work. The project grid
shows what they built. Only long-form writing shows how they reason, what they notice, and whether
they can teach. A portfolio without writing is a CV. A portfolio with a thoughtful engineering blog
is evidence of a practitioner.

I also expect the blog experience to meet the same quality bar as the rest of the site: fast, fully
keyboard-navigable, well-typeset, and accessible regardless of how I choose to read it.

### Core Problem Statement

> A portfolio that does not surface the owner's thinking is incomplete. And a codebase where secrets
> fail silently is waiting for a production incident.

---

## 2. Solution

### Vision

Add a first-class, CMS-managed blog to harihoudini.dev with a reading experience modelled on
dev.to's editorial quality — rich typography, server-side syntax highlighting, and a content model
that the owner can publish to from the existing Payload admin panel. Add a home page carousel
surfacing the four most recent posts so visitors discover the writing without navigating directly to
`/blog`. Simultaneously, centralise all environment variable access behind a Zod-validated `env.ts`
module so that every missing or malformed secret causes a loud startup failure rather than a silent
runtime error.

### From the Portfolio Owner's Perspective

I will have a fully owned blog at harihoudini.dev/blog. Writing a new post means opening the Payload
admin, filling in title, body, tags, and hitting Publish. The post appears on the site within an
hour (ISR revalidation). My writing is mine — hosted on my domain, styled on my terms.

I will also know immediately if a deployment is misconfigured. If `PAYLOAD_SECRET` is missing or
`DATABASE_URL` is malformed, the application throws a `ZodError` at startup that lists every
offending variable by name, before a single HTTP request is served.

### From a Visitor's Perspective

Arriving at harihoudini.dev I see the four most recent blog posts in a carousel immediately after
the hero section — a clear signal that this person writes. Clicking through to `/blog` I get a
well-organised list with search, tag filtering, and sort. Individual post pages are typeset for long
reading: measured line lengths, generous line height, and code blocks with full syntax highlighting.
Every page is fully keyboard-accessible and passes WCAG AAA contrast standards.

---

## 3. User Stories

### 3.1 Portfolio Owner — Publishing

- As the **portfolio owner**, I want to write and publish blog posts from the Payload admin panel
  using the same interface I use for everything else, so that I do not need a separate CMS or
  writing tool.
- As the **portfolio owner**, I want each blog post to have a title, body (rich text), excerpt,
  cover image, tags, per-post SEO fields, published date, and status (draft/published), so that I
  have full control over how each post is presented and indexed.
- As the **portfolio owner**, I want posts to appear on the live site within an hour of being
  published, without requiring a redeploy, so that publishing feels immediate.
- As the **portfolio owner**, I want to assign tags to posts from a shared Tags collection so that
  the same tag (e.g. "React") can describe both a project and a blog post without duplicating the
  label.
- As the **portfolio owner**, I want to reorder tags, add descriptions to them, and give them
  URL-safe slugs, so that tag archive pages are well-organised and linkable.
- As the **portfolio owner**, I want draft posts to never appear publicly, so that I can write
  without fear of incomplete work being visible.
- As the **portfolio owner**, I want my misconfigured environment to fail loudly at startup, so that
  production incidents from missing secrets are impossible.
- As the **portfolio owner**, I want all required secrets defined in a single `.varlock` config, so
  that every developer and CI environment knows exactly which secrets are needed.

### 3.2 Visitor — Blog Experience

- As a **visitor on the home page**, I want to see the four most recent blog posts in a carousel
  immediately after the hero section, so that I discover the owner's writing without navigating
  away.
- As a **visitor browsing the carousel**, I want to scroll through post cards using keyboard arrow
  keys or swipe gestures, so that navigation is accessible without a mouse.
- As a **visitor on `/blog`**, I want to see a paginated list of all published posts with title,
  excerpt, date, reading time, and tags, so that I can quickly evaluate which posts are relevant
  to me.
- As a **visitor on `/blog`**, I want to search posts by title, excerpt, and tag label, so that I
  can find writing on a specific topic without scrolling through the full list.
- As a **visitor on `/blog`**, I want to filter posts by tag, so that I see only posts relevant to
  a technology or topic I care about.
- As a **visitor on `/blog`**, I want to sort posts by newest or oldest, so that I can read
  chronologically if I prefer.
- As a **visitor with active filters**, I want a "Clear filters" control that resets all active
  search and filter state in one action, so that returning to the full unfiltered list is
  frictionless.
- As a **visitor on a post page**, I want to see an estimated reading time near the title, so that
  I can decide whether I have time to read the full post now.
- As a **visitor on a post page**, I want a "Previous post" and "Next post" link at the bottom, so
  that I can continue reading without returning to the list.
- As a **visitor who arrived at a post from a filtered list**, I want the prev/next links to
  navigate within the same filtered set, so that I do not lose my filter context mid-reading.
- As a **visitor who arrived at a post from a filtered list**, I want a visible indicator of the
  active filter and an option to clear it and return to the full list, so that I always understand
  my current context.
- As a **visitor reading a code-heavy post**, I want code blocks to display with accurate syntax
  highlighting and sufficient contrast, so that the code is readable without eye strain.
- As a **visitor on `/blog/tag/[slug]`**, I want to see all posts tagged with a specific tag, so
  that tag chips on post cards and the list page are navigable links.
- As a **visitor using a keyboard**, I want every interactive element on all blog pages to be
  reachable and operable by keyboard, so that the full experience is accessible without a mouse.
- As a **visitor using a screen reader**, I want all page regions, headings, and navigation
  landmarks to be correctly labelled, so that the blog structure is fully navigable by assistive
  technology.

### 3.3 Developer — Environment Safety

- As the **developer**, I want all `process.env` access centralised in a single `lib/env.ts` file
  validated by a Zod schema, so that adding or removing an environment variable requires one
  change in one place.
- As the **developer**, I want the application to throw a `ZodError` at module load time if any
  required env var is missing or invalid, so that deployment failures are caught before the first
  request rather than mid-request.
- As the **developer**, I want a `.varlock` config at the repository root that documents every
  secret the application needs, so that onboarding to a fresh clone is a single
  `varlock pull --env development > .env.local` command.
- As the **developer**, I want `pnpm varlock:pull` and `pnpm varlock:push` scripts in
  `package.json`, so that secret management is a first-class command, not a README footnote.

---

## 4. Implementation Decisions

### 4.1 Modules

The following modules are created or significantly modified.

#### New Modules

| Module | Responsibility |
|---|---|
| **`lib/env`** | Zod-validated env module. Single source of truth for all environment variables in app code. Exports a typed `env` object. Never allows raw `process.env` access outside this file. |
| **`blog` feature pod** | Owns all blog UI: post card, blog list, blog post layout, filter client component, home page carousel, Lexical renderer with Shiki code blocks, reading time utility. Public interface via `mod.ts`. |

#### New Payload Collections / Globals

| Resource | Responsibility |
|---|---|
| **`Tags` collection** | Shared tag taxonomy used by both Posts and Projects. Fields: `label`, `slug` (auto-generated), `description`. |
| **`Posts` collection** | Blog post content. Fields: `title`, `slug`, `body` (Lexical), `excerpt`, `coverImage` (→ Media), `tags` (→ Tags), `publishedAt`, `status`, `metaTitle`, `metaDescription`. |

#### Modified Modules

| Module | Change |
|---|---|
| **`Projects` collection** | Migrate `tags` from plain text array to `hasMany` relationship field pointing to `Tags`. |
| **`features/cms`** | Add `TagSchema`, `PostSchema`, `BlogListDataSchema`, `PostPageDataSchema`; extend `ProjectSchema.tags`; extend `PageDataSchema` with `recentPosts`; add repository functions and service methods for posts, tags, and adjacent-post queries; extend `mod.ts` exports. |
| **`app/(portfolio)/page.tsx`** | Destructure `recentPosts` from page data; render `<BlogCarouselLoader>` after `<HeroSection>`. |
| **`app/(portfolio)/globals.css`** | Update `--color-text-muted` to `#a8a8a8` (WCAG AAA); add `--font-mono`; add global `:focus-visible` ring; add blog typography tokens. |
| **`payload.config.ts`** | Register `Tags` and `Posts` collections; replace `process.env.*` with `env.*` from `lib/env`. |

---

### 4.2 Technical Clarifications

**ISR revalidation strategy**
Blog list and post pages use `export const revalidate = 3600`. `generateStaticParams` pre-builds
all published post slugs and tag slugs at deploy time. Subsequent publishes appear within one hour
of the next background revalidation. The filtered list page (`/blog?search=&tag=&sort=`) is
opted into dynamic rendering automatically when Next.js detects `searchParams` access — this is
correct behaviour since filtered views must reflect the current state of the database.

**Server-driven filtering via URL params**
Search, tag filter, and sort order are expressed as URL query parameters (`?search=`, `?tag=`,
`?sort=newest|oldest`). The page is a Server Component that reads `searchParams` and passes them
directly to the Payload Local API query. This makes every filtered view a unique, crawlable URL and
requires no client-side state management. A `BlogFilters` client component updates the URL via
`useRouter` + `useSearchParams` on user interaction.

**Filter-aware prev/next navigation**
When a visitor navigates to a post from a filtered list, the filter state is preserved in the post
URL as query params (`/blog/my-post?tag=react&sort=oldest`). The post page reads these params and
queries Payload for adjacent posts within the same filtered set (posts with the same tag, in the
same sort order, with `publishedAt` before/after the current post). A "Clear filter" link
(`/blog/my-post` without params) is rendered adjacent to the active filter indicator.

**Tags migration for Projects**
The existing `tags` field on the Projects collection is a plain `array` of `{ tag: text }` objects.
This is replaced with a `hasMany` relationship to `Tags`. Existing project data must be manually
re-tagged in the admin after the migration. There is no automated data migration script — this is a
personal CMS with no production data requiring preservation at this stage.

**Shiki — server-side, no client JS**
Syntax highlighting uses Shiki, run exclusively in React Server Components. The Lexical rich text
AST is traversed server-side; code block nodes are processed via `codeToHtml` from Shiki and
injected as raw HTML using `dangerouslySetInnerHTML`. No Shiki code is sent to the browser. Theme
`github-dark-dimmed` is used: all token colours have been verified to achieve ≥ 7:1 contrast on
the post page background.

**`useSearchParams` Suspense boundary**
`BlogFilters` uses `useSearchParams` from `next/navigation`, which requires the component to be
wrapped in a `<Suspense>` boundary. This boundary is placed at the blog list page level. The
fallback renders the static list structure without the interactive filter controls until the client
hydrates.

**Embla Carousel — lazy client component**
`BlogCarousel` is a `"use client"` component using `useEmblaCarousel`. It is dynamically imported
via `React.lazy` in `BlogCarouselLoader` and wrapped in a `<Suspense>`. The server renders the
`<section>` landmark and heading; the carousel slides in after client hydration. If `posts.length
=== 0`, the loader renders nothing.

**Reading time — render-time calculation**
Reading time is calculated at render time from the plain-text word count of the Lexical body. It is
not stored in the database. `Math.max(1, Math.ceil(wordCount / 200))` gives minutes; the result is
formatted as "N min read". A utility function `extractTextFromLexical(state)` recursively traverses
the Lexical AST to extract text nodes.

**`lib/env.ts` scope**
The validated `env` object is imported by `payload.config.ts` and any Server Component or server
utility that needs an env var. It is never imported by client components — browser code does not
have access to server secrets. For public variables (`NEXT_PUBLIC_*`), both the Zod schema and
Next.js's `NEXT_PUBLIC_` prefix convention apply; they are safe to include in the browser bundle
only if they carry the `NEXT_PUBLIC_` prefix.

---

### 4.3 Architectural Decisions

#### Shared Tags Collection (Posts + Projects)

Tags are defined once in a `Tags` Payload collection and referenced via `relationship` fields on
both the `Posts` and `Projects` collections. This eliminates the risk of the same technology
appearing under different spellings (`"React"` vs `"react"` vs `"ReactJS"`) across the two
content types. Tag archive pages (`/blog/tag/[slug]`) are generated from this single collection.

The tradeoff is that Projects must be re-tagged in the admin after the migration. For a personal
CMS with a small number of projects, this is a trivial one-time cost.

#### Lexical Custom Renderer Over `RichText` Component

The `@payloadcms/richtext-lexical/react` `RichText` component is used for the bio on the about
page, where the content is simple (paragraphs, bold, italic, links). For blog post bodies, a custom
`LexicalRenderer` Server Component traverses the AST directly. This is necessary because:

1. Code blocks require async Shiki processing — `RichText`'s converters are synchronous.
2. Full control over each node type is required to meet AAA typographic standards.
3. A custom renderer can be incrementally extended without coupling to Payload's internal converter
   interface.

#### Numbered Pagination With Server-Driven Filters

The blog list page uses numbered pagination (`/blog?page=2`) combined with server-driven search,
tag, and sort filters. Pagination is implemented at the Payload query level (`limit` + `page`
arguments). Filters are applied via Payload's `where` clause. The combination is resolved server-
side on every request when query params are present, and served from ISR cache when no params are
present.

This gives every filter combination a unique URL, making filtered views bookmarkable and shareable.
Search engine crawlers can index tag pages and paginated pages independently.

#### WCAG AAA as the Default Standard

All text on all pages in this phase is authored to meet WCAG AAA (SC 1.4.6: 7:1 contrast ratio for
normal text, SC 1.4.3: 4.5:1 for large text). Where AAA is architecturally impossible (e.g. Shiki
token colours in code blocks — some languages have semantic colours that cannot be freely changed),
the fallback is WCAG 2.2 AA (4.5:1). The `github-dark-dimmed` Shiki theme is selected specifically
because it is one of the few themes where all common token colours exceed 4.5:1 against the dark
background.

The `--color-text-muted` token is updated from `#888888` (4.5:1 — AA only) to `#a8a8a8` (7.2:1 —
AAA) globally. This affects metadata text, tag labels, dates, and reading time across all pages.

---

### 4.4 Schema Changes

#### New: `tags` Collection

| Field | Type | Required | Notes |
|---|---|---|---|
| `label` | text | yes | Display name. e.g. "React" |
| `slug` | text | yes, unique | URL-safe. Auto-generated from `label` if not provided. |
| `description` | textarea | no | Optional longer description for tag archive page. |

#### New: `posts` Collection

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | text | yes | Post display title. |
| `slug` | text | yes, unique | URL-safe. Auto-generated from `title` if not provided. |
| `body` | richText | yes | Lexical rich text. Full post content. |
| `excerpt` | textarea | no | Short description. Used on list cards and as fallback `metaDescription`. |
| `coverImage` | upload (Media) | no | Cover image. Used as OG image if provided. |
| `tags` | relationship (Tags, hasMany) | no | Associated tags. |
| `publishedAt` | date | no | Auto-set to now when `status` first changes to `published`. |
| `status` | select (draft, published) | yes | Default: `draft`. Only `published` posts are publicly visible. |
| `metaTitle` | text | no | SEO title override. Falls back to `title`. |
| `metaDescription` | textarea | no | SEO description override. Falls back to `excerpt`. |

#### Modified: `projects` Collection

| Field | Change |
|---|---|
| `tags` | Migrated from `array` of `{ tag: text }` to `relationship (Tags, hasMany)`. |

---

### 4.5 Quality Standards

The following standards apply to every file written in this phase. They are non-negotiable and
enforced by `pnpm typecheck` + `pnpm ci:check` before any PR is considered ready.

#### Performance (Next.js)

- All data fetching in Server Components. Client Components receive pre-fetched props.
- `generateStaticParams` on every dynamic route with a known set of slugs (`/blog/[slug]`,
  `/blog/tag/[slug]`).
- `export const revalidate = 3600` on all blog routes.
- `next/image` for every `<img>` element without exception.
- `React.lazy` + `<Suspense>` for every Client Component imported from a Server Component.
- No Client Component imports in the module graph of any route loader path.

#### Performance (Payload Local API)

- `depth: 1` on all `payload.find` / `payload.findGlobal` calls. Never `depth: 0` when
  relationships need to be expanded; never `depth > 1` in a route that is not specifically
  designed for deep expansion.
- `select` fields specified on every Payload query to avoid fetching unused columns.
- `limit` always specified. Never an unbounded query.

#### HTML Semantics

- One `<h1>` per page. Section headings use `<h2>`. Post sub-headings use `<h3>`–`<h4>`.
- Every `<section>` has an `aria-labelledby` pointing to its heading `id`.
- Pagination uses `<nav aria-label="Blog pagination">` with `<ol>`.
- Carousel uses `role="region"` with `aria-label="Recent posts"` and `aria-roledescription=
  "carousel"` on the slide container.
- Tags rendered as `<ul>` of `<li><a>` — never raw `<div>` or `<span>` lists.
- Search input uses `role="search"` on the containing `<form>`.
- Time elements use `<time datetime="ISO-8601">`.

#### Accessibility (WCAG 2.2 AA as minimum, AAA wherever achievable)

- Focus management: `:focus-visible` ring (3 px, accent colour, 3 px offset) on all interactive
  elements.
- Keyboard: carousel arrows operable by keyboard. Pagination links are standard `<a>` elements
  (keyboard-native). Filters are standard `<form>` / `<select>` / `<input>` elements.
- Screen reader: all icon-only buttons have `aria-label`. `aria-live="polite"` on the post count
  result when filters change.
- Skip link: `<a href="#main-content">Skip to content</a>` present on every page.
- Contrast: body text ≥ 7:1. Large text ≥ 4.5:1. UI component boundaries ≥ 3:1.

#### Effect-ts

- All repository functions return `Effect.Effect<T, CmsNetworkError | CmsParseError, never>`.
- `Effect.tryPromise` with explicit `catch` that maps to a typed `Data.TaggedError` — never
  `new Error()`.
- `Effect.all` for concurrent Payload queries (e.g. fetching post + adjacent posts).

---

## 5. Testing Decisions

### What Is Tested

| Module | Test type | What is verified |
|---|---|---|
| `reading-time.util.ts` | Unit | 200 wpm average; minimum 1 min; empty string returns 1; whitespace-only returns 1 |
| `post-card.component.tsx` | Component | Title, date, reading time render; tags render as links; no cover image → no `<img>`; no link/github → link absent; featured badge conditional |
| `blog-list.component.tsx` | Component | All posts render; empty state renders gracefully; pagination controls present when `totalPages > 1` |
| `blog-carousel.client.component.tsx` | Component | 4 post cards rendered; prev/next buttons have `aria-label`; zero posts → nothing rendered |
| `blog-filters.client.component.tsx` | Component | Search input has accessible label; tag chip links render; clear link renders only when filter is active |
| `cms.repository.ts` (blog additions) | Unit (vi.mock) | `fetchRecentPosts` queries with `limit: 4`, `status: published`; `fetchBlogList` applies search/tag/sort to Payload where clause; `fetchPostBySlug` returns correct post; `fetchAdjacentPosts` queries before/after `publishedAt` |
| `lib/env.ts` | Unit | Valid env object parses without error; missing required field throws `ZodError`; invalid `DATABASE_URL` format throws `ZodError`; `NODE_ENV` defaults to `development` |

### What Is Not Tested

- Shiki rendering fidelity (requires a real runtime with language grammars; verified manually in
  the browser).
- Embla Carousel scroll behaviour (DOM measurement; verified manually in the browser).
- ISR revalidation timing (a Next.js framework concern; not unit-testable).
- Tag auto-slug generation in Payload hooks (covered by manual Payload admin testing).

### Mock Additions Required

```typescript
// Shiki — async, not available in jsdom
vi.mock("shiki", () => ({
  codeToHtml: async (code: string) => `<pre><code>${code}</code></pre>`,
}));

// Embla Carousel — requires DOM measurement APIs
vi.mock("embla-carousel-react", () => ({
  default: () => [vi.fn(), { scrollPrev: vi.fn(), scrollNext: vi.fn() }],
}));
```

---

## 6. Out of Scope

The following are explicitly **not** in scope for this PRD:

**Blog comments.** No commenting system, no third-party embed (Disqus, Giscus), no reactions.

**Blog post series / collections.** No grouping of posts into named series with prev/next within the
series. Standard chronological prev/next only.

**RSS / Atom feed.** A feed endpoint is not included. This may be added as a small standalone PR
later.

**Newsletter / email subscription.** No email capture, no mailing list integration.

**Post view counts or analytics.** No tracking of read counts, click-through rates, or engagement.

**Table of contents.** Not included based on scope confirmation. Can be added as a follow-up.

**Cover image on post page.** Not included based on scope confirmation. Posts have a cover image
field in the CMS for OG metadata use, but it is not displayed as a hero image on the post page.

**Author collection.** There is only one author: the portfolio owner. No Author collection or author
profile page.

**Deployment (CI/CD, SST pipeline, Varlock push to production).** Deferred to a separate deployment
PRD. This phase only installs Varlock, creates the `.varlock` config, and adds `varlock:pull` /
`varlock:push` scripts. The CI/CD workflows and production secret injection are not modified.

**3D canvas experience.** The canvas continues to return `null`. The blog carousel is a standard
Embla Carousel, not a 3D scene.

**Light/dark mode toggle.** The blog uses the same dark palette as the rest of the portfolio. No
theme switcher.

**Internationalisation.** English only.

---

## 7. Further Notes

### On the dev.to Design Reference

"Looks like a dev.to post" is interpreted as a reading-quality standard, not a visual replica:

- **Narrow prose column** (`max-width: 680px`) centered in the viewport for comfortable line
  lengths (~70 characters per line).
- **18 px base font size** with 1.8 line height for long-form reading.
- **Heading hierarchy** that is visually distinct and uses relative size steps (h1 > h2 > h3).
- **Code blocks** with monospace font, syntax highlighting, horizontal scroll for overflow, and a
  clearly visible background differentiated from prose.
- **Tags** as small, rounded chips at the top of the post below the title.
- **Reading time and date** as muted secondary metadata near the title.

dev.to-specific features that are not replicated: reactions bar, bookmark button, follow author
button, comment thread.

### On Varlock in This Phase

This phase installs the `varlock` npm package, creates the `.varlock` config, and adds `lib/env.ts`
for runtime validation. The `varlock push` workflow (pushing encrypted secrets to the Varlock SaaS
for CI injection) is not wired until the deployment PRD. In this phase, `varlock pull` is a local
developer convenience, and `lib/env.ts` is the enforcement mechanism.

This means the `VARLOCK_TOKEN` CI secret referenced in REWRITE-001 §6 is not required yet.

### On ISR and the Payload Admin

When a post is published or updated in the Payload admin, the change is written to the database
immediately. The live site continues serving the previously cached version until the ISR 3600-second
timer expires and the next visitor triggers a background revalidation. For a personal blog this
latency is acceptable. A future enhancement could add an on-demand revalidation webhook triggered
by Payload's `afterChange` hook, reducing the latency to seconds.

### On the Tags Migration for Projects

The plain text `tags` array on Projects (`[{ id, tag }]`) is replaced with a `hasMany` relationship
to the Tags collection. In the Zod schema, `ProjectSchema.tags` changes from
`z.array(z.object({ tag: z.string() }))` to `z.array(TagOrIdSchema)`. After deploying this change,
existing projects will have empty `tags` arrays until manually re-tagged in the admin. There is no
automated data migration because the portfolio CMS has no production data that must be preserved at
this stage.

### On `payload-types.ts` After Schema Changes

Adding `Tags` and `Posts` to `payload.config.ts` changes the generated `payload-types.ts`. After
implementing the Payload schema changes, run `pnpm payload:generate-types` against a live database
to refresh the types file. The `_Assert` type alignment checks in `cms.schema.ts` will fail to
compile until this is done.

---

*End of PRD-003*
