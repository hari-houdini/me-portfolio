# PRD-002: Architecture Rewrite — harihoudini.dev

**Status:** In Progress
**Author:** Hari Houdini
**Created:** 2026-03-27
**Last Updated:** 2026-03-27
**Version:** 1.0.0
**Linked Issue:** [GitHub Issue #24](https://github.com/hari-houdini/me-portfolio/issues/24)
**Linked Spec:** [REWRITE-001 — Implementation Guide](./REWRITE-001-architecture-rewrite.md)
**Linked PRD:** [PRD-001 — Immersive Portfolio](./PRD-001-immersive-portfolio.md)

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution](#2-solution)
3. [User Stories](#3-user-stories)
   - 3.1 [Portfolio Owner — Content & Deployment](#31-portfolio-owner--content--deployment)
   - 3.2 [Developer — DX & Maintainability](#32-developer--dx--maintainability)
4. [Implementation Decisions](#4-implementation-decisions)
   - 4.1 [Why Each Technology Was Dropped](#41-why-each-technology-was-dropped)
   - 4.2 [Why Each Technology Was Chosen](#42-why-each-technology-was-chosen)
   - 4.3 [Architectural Decisions](#43-architectural-decisions)
   - 4.4 [Schema Changes](#44-schema-changes)
   - 4.5 [Phase Breakdown](#45-phase-breakdown)
5. [Testing Decisions](#5-testing-decisions)
6. [Out of Scope](#6-out-of-scope)
7. [Further Notes](#7-further-notes)

---

## 1. Problem Statement

### Background

PRD-001 established the vision for harihoudini.dev: an immersive 3D portfolio powered by a headless CMS, server-side rendered, and deployed globally. The initial implementation delivered on that vision — but the architectural choices made to get there quickly have become a compounding source of friction.

The codebase is split across two completely separate applications with two separate deployment pipelines:

| Layer | Technology | Host |
|---|---|---|
| Portfolio app | React Router v7 + Cloudflare Workers (Hono) | Cloudflare Pages |
| CMS admin | Standalone Payload CMS v3 (Next.js 16) in `cms/` | Railway.app |
| Database | Supabase PostgreSQL | Supabase |

These two applications do not share code, dependencies, or tooling. They communicate only over HTTP. Every content update the portfolio displays requires a REST round-trip from Cloudflare Workers → Railway → Payload → Supabase — a chain that crosses three separate services.

### Per-Technology Rationale

#### React Router v7

React Router v7 (previously Remix) is an excellent framework. The specific problem is not React Router itself — it is that Cloudflare Workers is its deployment target. The Workers runtime imposes hard constraints that conflict with what Payload CMS v3 requires to run:

- **No `fs` module.** Payload's file system operations, local media storage, and plugin loading require Node.js `fs`. Cloudflare Workers has no `fs` — not even the compatibility polyfill covers all Payload's needs.
- **No native Node.js APIs.** Payload uses `path`, `child_process`, and other Node.js builtins internally. These are unavailable in the Workers runtime by default.
- **Separate deployment.** As a result, Payload must run on a separate platform (Railway) with its own deployment pipeline, secrets, and database connection — turning what should be one app into two.
- **REST overhead.** The portfolio loader fetches data from Payload over HTTP. That is an external network call on every uncached page request, adding latency and a failure mode that does not need to exist.

#### Cloudflare Workers

Cloudflare Workers was chosen for its global edge distribution and zero-cold-start performance. In practice, the portfolio's CMS data requirement makes this advantage irrelevant:

- **Edge data fetching is still slow.** The Workers edge node fetches content from a Railway server in a single region. The final response latency is dominated by that origin call, not by the edge worker.
- **Wrangler + Vite friction.** Two bundlers (`vite` for React Router, `wrangler` for Workers) with separate config files add complexity to every local dev session. Type safety between the two requires manual maintenance.
- **`@cloudflare/workers-types` in the wrong place.** The Workers types must be referenced from both `workers/` and the React Router app, creating an unusual dual-TypeScript-project structure.
- **Payload incompatibility.** As described above, the Workers runtime cannot run Payload. This alone forces the split architecture.

#### Standalone Payload CMS (`cms/`)

Running Payload as a standalone Next.js app inside a `cms/` subdirectory of the same repository creates a false impression of unity — the two apps share a git repository but nothing else:

- **Two `package.json` files.** Every dependency update must be applied twice: once in the root and once in `cms/`. Biome, TypeScript, and vitest configs must be duplicated.
- **Two separate lock files.** `pnpm-lock.yaml` at root and `cms/pnpm-lock.yaml` cannot share packages. The combined dependency footprint is larger than it needs to be.
- **REST is the only integration point.** The portfolio knows nothing about Payload's types or schema at the TypeScript level. It calls the REST API, parses the response through Zod, and hopes it matches. Type drift between the Payload schema and the Zod schemas is caught only at runtime.
- **Separate Railway deployment.** Railway adds $5–$8/month to the running cost. It has its own release pipeline, environment variables, and restart behaviour. A CMS deploy is independent of a portfolio deploy, which sounds like a feature but in practice means the two can fall out of sync.

#### Tailwind CSS

Tailwind was included in the initial scaffold but never applied at scale. The portfolio's design is heavily custom (3D canvas, procedural generation, GSAP scroll). Tailwind's utility classes do not compose well with Three.js-driven layout, shader-controlled colours, or GSAP-animated transforms. It added `@tailwindcss/vite` to the build chain without providing meaningful utility.

#### Vite (with `vite-plugin-glsl`)

Vite is the right choice for a Vite-based React app. It is not the right bundler for a Next.js app — and the rewrite adopts Next.js as the full-stack framework. `vite-plugin-glsl` handles GLSL shader imports in the Vite world; its equivalent in Next.js is `raw-loader` configured via webpack. Retaining Vite alongside Next.js would create two bundlers doing overlapping work.

### Core Problem Statement

> The split architecture doubles maintenance burden, introduces unnecessary latency between the portfolio and its own data, and creates a runtime compatibility wall that prevents embedding the CMS in the same process as the portfolio. Every problem in the current stack is a consequence of this split.

---

## 2. Solution

### Vision

Collapse the two-application split into a single Next.js 16 application with Payload CMS v3 embedded directly. The portfolio and its CMS run in the same process, share the same dependency tree, and communicate via the Payload Local API — a direct in-process function call with no network overhead. The entire application deploys to AWS via SST v4 (OpenNext, v4.5.11), giving global distribution through CloudFront at zero additional operational cost within the AWS free tier.

### From the Portfolio Owner's Perspective

As the owner of harihoudini.dev, the rewrite means:

- **One deployment.** There is no longer a separate Railway CMS to maintain, monitor, or pay for. `pnpm deploy` ships everything: the portfolio, the admin panel, and the media storage.
- **One admin panel.** The Payload admin lives at `harihoudini.dev/admin`. There is no separate CMS domain to remember, no separate login, no Railway dashboard to check.
- **One `.env.local` file.** Secrets are managed by Varlock SaaS. `varlock pull --env development > .env.local` gives a fully-working local environment in one command.
- **Cheaper to run.** Railway ($5–8/month) is eliminated. The entire stack runs within the AWS free tier: Lambda@Edge (1M requests/month free), CloudFront (1TB/month free), S3 (5GB free). Running cost is effectively $0/month for a personal portfolio at typical traffic.
- **Content updates are immediate.** Changes saved in the Payload admin are reflected on the next page request. There is no cache invalidation step, no revalidation webhook, no Railway restart.

### From the Developer's Perspective

As the developer maintaining this codebase, the rewrite means:

- **One `package.json`.** All dependencies, scripts, and tooling configuration live in a single file. `pnpm install` installs everything. `pnpm ci:check` lints everything.
- **End-to-end type safety.** `pnpm payload:generate-types` generates `payload-types.ts` from the live Payload schema. Zod schemas in `features/cms/cms.schema.ts` assert against these generated types at the TypeScript level — schema drift is caught at compile time, not in production.
- **No mocking the CMS at runtime.** The Payload Local API (`getPayload({ config })`) is a direct TypeScript function call. In tests, `vi.mock('payload')` replaces it cleanly. There is no HTTP server to mock, no port to manage, no `fetch` to intercept.
- **Cleaner Effect-ts pattern.** `ManagedRuntime` is removed. Each Server Component runs `Effect.runPromise(program.pipe(Effect.provide(LiveLayer)))` directly, with `React.cache()` for request-level deduplication. The pattern is simpler, more readable, and better aligned with Next.js's data fetching model.
- **GLSL support across both dev and build.** `next.config.ts` configures `raw-loader` for webpack (production builds) and `turbopack.rules` for the Turbopack dev server. GLSL shader imports work in both environments — no vite-plugin-glsl required.

---

## 3. User Stories

### 3.1 Portfolio Owner — Content & Deployment

#### Content Management

- As the **portfolio owner**, I want to access the CMS admin panel at the same domain as my portfolio (`harihoudini.dev/admin`), so that I do not need to remember a separate CMS URL or maintain a separate service.
- As the **portfolio owner**, I want to log in to the admin panel using a single set of credentials, so that I am not managing accounts across multiple platforms.
- As the **portfolio owner**, I want changes I save in the CMS to appear on the live site on the next page visit, without needing to trigger a revalidation webhook or restart a service.
- As the **portfolio owner**, I want to add, edit, and publish portfolio projects through the admin panel with exactly the same fields as before (title, description, thumbnail, tags, url, github, featured, year, status, order), so that my existing content workflow is unchanged.
- As the **portfolio owner**, I want media uploads to be automatically stored in S3 with image size variants generated, so that I can upload one image and have thumbnails and OG-size variants handled for me.

#### Deployment & Operations

- As the **portfolio owner**, I want the entire stack (portfolio, admin panel, media storage) to deploy with a single command (`pnpm deploy`), so that I never need to coordinate two separate deployment pipelines.
- As the **portfolio owner**, I want my secrets (database URL, Payload secret, server URL) to be managed by Varlock and injectable from the command line in one step, so that I am never copy-pasting credentials between dashboards.
- As the **portfolio owner**, I want my monthly hosting cost to be zero or near-zero for typical portfolio traffic, so that running this site does not require an ongoing financial commitment.
- As the **portfolio owner**, I want the deployment to target a global CDN (CloudFront + Lambda@Edge), so that visitors anywhere in the world get fast response times.
- As the **portfolio owner**, I want the Supabase PostgreSQL database I already have to remain the data store, so that I do not need to migrate data as part of this rewrite.

### 3.2 Developer — DX & Maintainability

#### Local Development

- As the **developer**, I want a single `pnpm install` at the repository root to install all dependencies for both the portfolio and the CMS, so that there is no `cd cms && pnpm install` step to remember.
- As the **developer**, I want `pnpm dev` to start a local Next.js server that serves both the portfolio (`/`) and the Payload admin (`/admin`) from the same port, so that I can develop both without running two processes.
- As the **developer**, I want `varlock pull --env development > .env.local` to give me a fully-working local environment, so that setting up the project from a fresh clone takes one command after installing dependencies.
- As the **developer**, I want GLSL shader files to be importable as typed string constants in both `next dev` (Turbopack) and `next build` (webpack), so that shader development works correctly in both the dev server and the production build.

#### Type Safety & Schema

- As the **developer**, I want `pnpm payload:generate-types` to generate a `payload-types.ts` file from the live Payload schema, so that all CMS data shapes are type-safe by construction rather than by convention.
- As the **developer**, I want Zod schemas in `features/cms/cms.schema.ts` to include TypeScript type assertions against the generated `payload-types.ts`, so that any drift between the Zod schema and the Payload schema is caught at compile time.
- As the **developer**, I want `pnpm typecheck` to exit zero with no TypeScript errors across the entire codebase (portfolio, CMS config, collections, globals), so that type correctness is enforced in CI.

#### Testing

- As the **developer**, I want to unit-test the CMS repository layer by mocking the Payload module (`vi.mock('payload')`), so that tests run in jsdom without requiring a live database connection.
- As the **developer**, I want test fixtures to be generated from the Zod schemas using `zocker`, so that fixture data is always structurally valid by construction.
- As the **developer**, I want the full test suite to run in under 30 seconds, so that the local feedback loop is fast.
- As the **developer**, I want coverage thresholds (≥60% lines, ≥60% functions, ≥55% branches) to be enforced in CI, so that test coverage cannot regress silently.

#### Code Quality & Architecture

- As the **developer**, I want all features to live in self-contained pods under `features/<pod>/` with `mod.ts` barrel files, so that internal implementation details of one pod are never accidentally imported by another.
- As the **developer**, I want all files to follow the `<name>.<role>.<modifier>.<ext>` naming convention, so that a file's purpose is immediately clear from its name.
- As the **developer**, I want `pnpm ci:check` (Biome lint + format) to run across the entire codebase with a single command, so that code style is consistently enforced without per-directory config.
- As the **developer**, I want `@payload-config`, `@cms/*`, `@features/*`, and `@app/*` path aliases configured in `tsconfig.json`, so that imports do not contain fragile relative `../../../` chains.

---

## 4. Implementation Decisions

### 4.1 Why Each Technology Was Dropped

| Technology | Reason Dropped |
|---|---|
| **React Router v7** | Cloudflare Workers runtime is incompatible with Payload v3 (no `fs`, no Node.js builtins). Moving to Next.js removes the need for React Router as a separate router — Next.js App Router replaces it entirely. |
| **Cloudflare Workers / Hono** | Edge runtime incompatibility with Payload forces a split-app architecture. AWS Lambda@Edge (via SST) provides equivalent global distribution without the Node.js restrictions. |
| **Standalone `cms/` app** | Creates two dependency trees, two lock files, duplicated tooling, and a REST-only integration boundary. Embedding Payload in the portfolio eliminates all of this. |
| **Tailwind CSS** | Never used at meaningful scale in this codebase. Does not compose well with Three.js-driven layout and GSAP-animated transforms. CSS Modules chosen as a lighter, more explicit alternative. |
| **Vite + `vite-plugin-glsl`** | Vite is the right bundler for a Vite app — not a Next.js app. `raw-loader` via webpack (and `turbopack.rules` for the dev server) replaces `vite-plugin-glsl` with no loss of functionality. |
| **`ManagedRuntime` (Effect-ts)** | The `ManagedRuntime` pattern makes sense when Layer composition is expensive and must be shared across many requests (e.g., a long-lived Node.js server). In Lambda (ephemeral) and Next.js Server Components (per-request), `Effect.runPromise(program.pipe(Effect.provide(Layer)))` is simpler and equally performant. `React.cache()` handles request-level deduplication. |

### 4.2 Why Each Technology Was Chosen

| Technology | Decision | Rationale |
|---|---|---|
| **Next.js 16 (App Router)** | Portfolio framework | Full Node.js runtime compatibility (runs Payload). Server Components eliminate the need for a separate data-fetching layer. `generateMetadata` + `page.tsx` pattern replaces the React Router loader model cleanly. |
| **Payload v3 (embedded)** | CMS | Running Payload in the same process removes the REST overhead and gives type-safe Local API access. `payload-types.ts` becomes the source of truth for all CMS data shapes. |
| **Payload Local API** | CMS data access | `getPayload({ config })` is a direct function call. Zero network overhead. No HTTP client to configure. No fetch error handling for internal data — Payload throws, Effect catches. |
| **SST v4 (OpenNext, v4.5.11)** | Deployment | OpenNext wraps Next.js for Lambda@Edge + CloudFront. Infrastructure is defined in `sst.config.ts` as code. Resources are wired via `link`; app code accesses them via `import { Resource } from "sst"`. S3 bucket and Secrets are provisioned automatically. Fully within the AWS free tier. |
| **`@payloadcms/storage-s3`** | Media uploads | Replaces local `staticDir` in production. S3 bucket is provisioned by SST. Conditional config: local storage in `NODE_ENV === 'development'`, S3 plugin in production. |
| **Supabase PostgreSQL** | Database | Unchanged from the current setup. `?pgBouncer=true` appended to `DATABASE_URL` for Lambda transaction pooling (avoids exhausting Supabase free tier's 30-connection limit). |
| **Varlock SaaS** | Secret management | `varlock pull --env development > .env.local` provides a single-command local environment setup. In production, Varlock injects secrets at deploy time via the CI/CD pipeline. |
| **Effect-ts v3** | Service layer | Unchanged from the current approach. `Effect.gen` for composition, `Data.TaggedError` for typed errors, `Context.Tag` + `Layer` for DI. Pattern simplified by removing `ManagedRuntime`. |
| **Zod v4** | Validation + fixtures | Schemas in `features/cms/cms.schema.ts` validate Payload Local API responses. Type assertions against `payload-types.ts` catch schema drift at compile time. `zocker` generates fixtures from schemas. |
| **CSS Modules** | Styling | Scoped, explicit, no build plugin required. The Phase 3 shell ships with no styling (browser defaults) — CSS Modules are added in a future phase. |
| **Biome** | Linting + formatting | Unchanged. Single tool for both lint and format. Configured via root `biome.json`. |
| **Vitest 4** | Testing | Unchanged. `@vitejs/plugin-react` replaces the old Vite config for test-only use. `vite-tsconfig-paths` resolves the `tsconfig.json` path aliases in tests. |

### 4.3 Architectural Decisions

#### Single Next.js App with Embedded Payload

Payload v3 is designed to embed in a Next.js app. The `(payload)` route group (`app/(payload)/admin/[[...segments]]/page.tsx`) serves the admin panel. The `app/api/[...slug]/route.ts` exposes the REST API. The `payload.config.ts` at the root is shared by the portfolio's Server Components via the `@payload-config` alias.

This means one running process, one `pnpm install`, and one deployment.

#### Payload Local API Over REST

The portfolio no longer calls Payload over HTTP. `getPayload({ config })` returns a configured Payload instance in the same process. Repository functions (`cms.repository.ts`) call `payload.find(...)` directly. The Effect-ts layer wraps these calls in `Effect.tryPromise` — not to handle HTTP errors, but to handle unexpected Payload throws (e.g., database connection failure).

#### `React.cache()` for Request Deduplication

`app/(portfolio)/page.tsx` and its `generateMetadata` export both need the same page data. Without deduplication, that is two database round-trips per request. `cache()` from React memoises the result within a single request's render tree, so `getPageData()` hits the database exactly once regardless of how many components call it.

#### Feature Pod Structure (Outside `app/`)

Feature pods live in `features/` at the repository root, not inside `app/`. Next.js App Router treats everything inside `app/` as a potential route segment — placing feature code there risks accidental route creation and naming conflicts. `features/` is a plain TypeScript directory resolved via the `@features/*` alias.

Each pod has a `mod.ts` barrel that is the only public export surface. Nothing outside a pod imports from its internals.

#### Conditional S3 / Local Storage

`payload.config.ts` uses `process.env.NODE_ENV === 'production'` to conditionally apply the `@payloadcms/storage-s3` plugin. In development, Payload uses the local `staticDir` on the `media` collection. In production, the S3 plugin intercepts all media uploads and serves them from S3. This means local development requires no AWS credentials.

#### `--turbopack` is Banned

Next.js 16 defaults to Turbopack for `next dev`. Turbopack is configured in `next.config.ts` via `turbopack.rules` to handle GLSL imports using `raw-loader`. Production builds (`next build`) always use webpack — the `webpack` config in `next.config.ts` applies there. The `pnpm dev` script is plain `next dev` with no flags. This setup ensures GLSL shader imports work in both environments without locking into one bundler.

### 4.4 Schema Changes

No new CMS schema is introduced in this rewrite. The existing Payload collections and globals are migrated as-is:

| Resource | Old location | New location | Changes |
|---|---|---|---|
| `Users` collection | `cms/src/collections/Users.ts` | `collections/users.collection.ts` | Rename only |
| `Media` collection | `cms/src/collections/Media.ts` | `collections/media.collection.ts` | `staticDir` moved to collection; S3 plugin conditionally applied in config |
| `Projects` collection | `cms/src/collections/Projects.ts` | `collections/projects.collection.ts` | Rename only |
| `SiteConfig` global | `cms/src/globals/SiteConfig.ts` | `globals/site-config.global.ts` | Rename only |
| `About` global | `cms/src/globals/About.ts` | `globals/about.global.ts` | Rename only |
| `Contact` global | `cms/src/globals/Contact.ts` | `globals/contact.global.ts` | Rename only |
| `isAdmin` access | `cms/src/access/is-admin.access.ts` | `access/is-admin.access.ts` | Rename only |

### 4.5 Phase Breakdown

| Phase | Branch | Goal | Key deliverables |
|---|---|---|---|
| **1 — Foundation** | `feat/rewrite-p1-foundation` | `pnpm dev` starts. `/admin` accessible. | `next.config.ts`, `payload.config.ts`, `sst.config.ts`, unified `package.json`, `app/` stubs, migrated collections/globals |
| **2 — CMS** | `feat/rewrite-p2-cms` | `pnpm test` passes. Full CMS service layer wired. | `features/cms/` pod, Zod schemas with type assertions, Effect-ts service + repository, `vi.mock('payload')` test suite, zocker fixtures |
| **3 — Portfolio** | `feat/rewrite-p3-portfolio` | SSR HTML shell. All sections render CMS data. | Async Server Component page, hero/about/work/contact section components, `React.lazy` canvas placeholder, component tests |
| **4 — Blog + Varlock** | `feat/rewrite-p4-blog-varlock` | Blog live. Env validated at startup. | `lib/env.ts` (typed env), `.varlock` config, `Tags` + `Posts` collections, blog routes, Embla carousel, Shiki syntax highlighting. See [PRD-003](./PRD-003-blog-varlock.md) |

For the full implementation spec per phase (file lists, verification commands, code examples), see [REWRITE-001](./REWRITE-001-architecture-rewrite.md).

---

## 5. Testing Decisions

### What Makes a Good Test

Identical to the standards established in PRD-001 §5.1: test observable behaviour, not implementation; one behavioural assertion per test; deterministic; meaningful names.

### What Is Tested in This Rewrite

| Module | Test type | What is verified |
|---|---|---|
| `cms.repository.ts` | Unit (vi.mock) | Returns correct shaped data on success; returns `CmsNetworkError` on Payload throw; returns `CmsParseError` on schema mismatch |
| `cms.service.ts` | Unit | `getAllPageData` runs all four fetches concurrently via `Effect.all`; error propagation from repository to service |
| `hero-section.component.tsx` | Component | `siteConfig.name` renders as `<h1>`; null `subtitle` does not render broken markup |
| `about-section.component.tsx` | Component | Skills list renders with accessible list role; null `photo` does not break layout |
| `work-section.component.tsx` | Component | Project cards render; featured badge only when `featured: true`; missing optional fields (url, github) render gracefully |
| `contact-section.component.tsx` | Component | Email renders as `<a href="mailto:...">` with selectable text; social links render with accessible labels |

### What Is Not Tested

- Payload admin panel UI (covered by Payload's own test suite)
- GLSL shader correctness (requires a GPU; verified manually in browser)
- SST deploy correctness (verified via manual `pnpm sst deploy --stage dev`)
- The Three.js canvas (it returns `null` in this rewrite — nothing to test)

### Coverage Thresholds

Unchanged from PRD-001: lines ≥ 60%, functions ≥ 60%, branches ≥ 55%. Enforced in `ci.yml`.

---

## 6. Out of Scope

The following are explicitly **not** part of this rewrite:

**3D experience content.** The Three.js galaxy, warp tunnel, custom GLSL shaders, and all 3D scene code are deleted in Phase 1. The canvas renders `null`. Rebuilding immersive 3D experiences is a future initiative — the architecture is designed to accommodate it (Three.js packages installed, canvas component stub in place, GLSL imports configured) but the actual scenes are out of scope.

**Visual styling and design.** Phases 1–3 ship a completely unstyled HTML shell using browser default styles. CSS Modules are configured but empty. No design system, no typography scale, no colour variables are established in this rewrite. The portfolio will look like an unstyled HTML document until a future styling phase.

**Contact form and email sending.** The contact section displays the owner's email address as selectable text and social media links. No form component, no email-sending API route, and no third-party email service integration are included.

**Analytics, telemetry, and monitoring.** No Real User Monitoring, Core Web Vitals dashboards, Lighthouse CI, event tracking, or error monitoring (Sentry, etc.) are added. These are deferred to a future observability phase.

**Multi-user CMS access.** Payload is configured with a single admin user. No role-based permissions, team invitations, or content workflow approvals are in scope.

**Blog or articles section.** No new CMS collections beyond `Projects` and the three existing globals (`SiteConfig`, `About`, `Contact`).

---

## 7. Further Notes

### On Cost

The total monthly infrastructure cost after this rewrite is designed to be zero:

| Service | Tier | Cost |
|---|---|---|
| AWS Lambda@Edge | 1M requests/month free | $0 |
| AWS CloudFront | 1TB transfer/month free | $0 |
| AWS S3 | 5GB storage free | $0 |
| Supabase PostgreSQL | 500MB + shared compute free | $0 |
| Varlock SaaS | Free tier | $0 |
| Railway.app (CMS) | **Eliminated** | -$5–8/month |

Net change: the split architecture costs $5–8/month for Railway. The rewrite eliminates that cost entirely. Total: **$0/month**.

### On the Visitor Experience

The visitor-facing experience of harihoudini.dev is intentionally degraded during Phase 3 — the site will be a plain, unstyled HTML document with no 3D experience. This is by design. The goal of the rewrite is to prove the full data pipeline end-to-end (CMS → Payload Local API → Effect-ts service → Server Component → HTML) before layering any presentation concerns on top. A visitor who sees the Phase 3 site sees correct content, correctly server-side rendered, accessible, and complete — just without visual styling or animation.

The 3D experience and visual design are restored in future initiatives that build on this architectural foundation.

### On the `payload-types.ts` Dependency

`payload-types.ts` is auto-generated by `pnpm payload:generate-types`. It does not exist in the repository at the end of Phase 1. Phase 2 begins by running this command against a live database. Until it exists, the Zod type assertions in `cms.schema.ts` cannot compile. This is the critical sequencing constraint between Phase 1 and Phase 2.

### On Connection Pooling

Supabase free tier allows 30 simultaneous database connections. AWS Lambda@Edge can spawn many concurrent container instances, each maintaining its own connection pool. Without connection pooling, a traffic spike will exhaust Supabase's connection limit. The `DATABASE_URL` in production must include `?pgBouncer=true` to use Supabase's transaction-mode PgBouncer, which multiplexes connections and keeps the total well within the free tier limit.

### On the Relationship Between PRD-002 and REWRITE-001

This PRD captures the **why** — the problem, the decision rationale, the user stories, and the out-of-scope boundaries. [REWRITE-001](./REWRITE-001-architecture-rewrite.md) captures the **how** — the exact file structure, code examples, phase-by-phase file lists, and verification commands. Both documents are necessary. This PRD is the authoritative record of what was decided and why. REWRITE-001 is the authoritative record of how to implement it.

---

*End of PRD-002*
