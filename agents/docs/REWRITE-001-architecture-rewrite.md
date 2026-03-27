# REWRITE-001: Architecture Rewrite — Next.js 16 + SST + Payload Embedded

**Status:** In Progress
**Author:** Hari Houdini
**Created:** 2026-03-27
**Version:** 1.0.0
**Linked Plan:** [kind-growing-hoare.md](../../.claude/plans/kind-growing-hoare.md)

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Decision Summary](#2-decision-summary)
3. [File Naming Convention](#3-file-naming-convention)
4. [New Architecture](#4-new-architecture)
5. [Phase Breakdown](#5-phase-breakdown)
6. [Environment Variables](#6-environment-variables)
7. [Key Gotchas](#7-key-gotchas)
8. [Verification Steps](#8-verification-steps)

---

## 1. Problem Statement

The current codebase is structurally split:

- **Portfolio app**: React Router v7 on Cloudflare Workers (Hono), in `app/` + `workers/`
- **CMS app**: Standalone Payload CMS v3 (Next.js 16) in `cms/` with its own `package.json` and `node_modules`

This split creates unnecessary friction:
- Two separate dependency trees to maintain
- REST API overhead between the portfolio and its own CMS (HTTP from Cloudflare Workers → Railway → Payload → Supabase)
- Cloudflare Workers runtime limits full Node.js compatibility (no `fs`, `Buffer`, etc.)
- All existing Three.js 3D experiences are tightly coupled and cannot easily be made CMS-driven

---

## 2. Decision Summary

| Concern | Old | New |
|---|---|---|
| Framework | React Router v7 | Next.js 16 (App Router) |
| CMS | Standalone Payload CMS (separate Next.js app) | Payload v3 embedded in same Next.js app |
| CMS data access | REST HTTP calls (Effect-ts `fetch`) | Payload Local API (`getPayload()`) |
| Deployment | Cloudflare Workers (wrangler) | SST (OpenNext) → AWS Lambda@Edge + CloudFront |
| Media uploads | Local `staticDir` | `@payloadcms/storage-s3` → S3 bucket via SST |
| Database | Supabase PostgreSQL (same) | Supabase PostgreSQL (same — existing project) |
| Env secrets | `.env` files / wrangler vars | Varlock SaaS (CLI pull → `.env.local`) |
| Effect-ts runtime | `ManagedRuntime` module singleton | `Effect.runPromise(program.pipe(Effect.provide(Layer)))` in Server Components |
| 3D experiences | Galaxy + warp tunnel (existing) | Deleted — architecture ready, experiences built later |
| CSS | Tailwind CSS | CSS Modules (unstyled shell initially) |
| Build tooling | Vite + vite-plugin-glsl | Next.js (webpack) + raw-loader |
| Monorepo | Two `package.json` files | Single `package.json` at root |

---

## 3. File Naming Convention

All files follow: `<kebab-case-name>.<role-or-type>.<modifier>.<extension>`

| Segment | Values |
|---|---|
| `name` | kebab-case description |
| `role-or-type` | `client`, `server`, `iso`, `service`, `repository`, `schema`, `error`, `util`, `factory`, `config`, `hook`, `generator`, `access` |
| `modifier` | `component`, `test`, `unit`, `integration` |
| `extension` | `.ts`, `.tsx`, `.css`, `.glsl`, `.vert`, `.frag` |

**Examples:**
- `three-canvas.client.component.tsx` — Client-only Three.js canvas
- `canvas-placeholder.iso.component.tsx` — Isomorphic React component
- `cms.service.ts` — Effect-ts service layer
- `cms.repository.ts` — Payload Local API repository
- `cms.error.ts` — `Data.TaggedError` definitions
- `cms.repository.unit.test.ts` — Unit test
- `hero-section.component.test.tsx` — Component test
- `is-admin.access.ts` — Payload access control function
- `users.collection.ts` — Payload collection definition
- `site-config.global.ts` — Payload global definition

**Framework-owned names (never rename):** `page.tsx`, `layout.tsx`, `error.tsx`, `route.ts`, `next.config.ts`, `sst.config.ts`, `payload.config.ts`, `payload-types.ts`, `mod.ts`

---

## 4. New Architecture

### Directory Structure

```
me-portfolio/
├── app/                              ← Next.js App Router
│   ├── (portfolio)/                  ← Portfolio route group
│   │   ├── page.tsx                  ← Async Server Component (fetches CMS, renders shell)
│   │   ├── layout.tsx
│   │   └── error.tsx
│   ├── (payload)/                    ← Payload admin route group
│   │   └── admin/
│   │       └── [[...segments]]/
│   │           └── page.tsx          ← Payload admin handler
│   ├── api/
│   │   └── [...slug]/
│   │       └── route.ts              ← Payload REST API (auto-generated)
│   ├── layout.tsx                    ← Root layout (<html lang="en"><body>)
│   └── types/
│       └── glsl.d.ts                 ← GLSL import type declarations
├── features/                         ← Feature pods (outside app/ — avoids Next.js route conflicts)
│   ├── cms/
│   │   ├── mod.ts
│   │   ├── cms.service.ts
│   │   ├── cms.repository.ts
│   │   ├── cms.schema.ts
│   │   ├── cms.error.ts
│   │   └── __tests__/
│   │       ├── cms.repository.unit.test.ts
│   │       └── cms.service.integration.test.ts
│   ├── hero/
│   │   ├── mod.ts
│   │   ├── hero-section.component.tsx
│   │   ├── hero-section.module.css
│   │   └── __tests__/hero-section.component.test.tsx
│   ├── about/
│   │   ├── mod.ts
│   │   ├── about-section.component.tsx
│   │   ├── about-section.module.css
│   │   └── __tests__/about-section.component.test.tsx
│   ├── work/
│   │   ├── mod.ts
│   │   ├── work-section.component.tsx
│   │   ├── project-card.component.tsx
│   │   ├── work-section.module.css
│   │   └── __tests__/
│   │       ├── work-section.component.test.tsx
│   │       └── project-card.component.test.tsx
│   ├── contact/
│   │   ├── mod.ts
│   │   ├── contact-section.component.tsx
│   │   ├── contact-section.module.css
│   │   └── __tests__/contact-section.component.test.tsx
│   ├── canvas/
│   │   ├── mod.ts
│   │   ├── canvas-placeholder.iso.component.tsx
│   │   └── three-canvas.client.component.tsx   ← "use client"; returns null for now
│   └── test/
│       ├── setup.ts
│       ├── fixtures/cms.fixtures.ts
│       └── msw/
│           ├── server.ts
│           └── handlers.ts
├── collections/
│   ├── users.collection.ts
│   ├── media.collection.ts           ← Uses @payloadcms/storage-s3 in production
│   └── projects.collection.ts
├── globals/
│   ├── site-config.global.ts
│   ├── about.global.ts
│   └── contact.global.ts
├── access/
│   └── is-admin.access.ts
├── payload.config.ts                 ← Root-level Payload config
├── payload-types.ts                  ← Auto-generated by `pnpm payload:generate-types` — NEVER EDIT
├── next.config.ts                    ← withPayload + webpack raw-loader for GLSL
├── sst.config.ts                     ← SST: Nextjs + Bucket + Secrets
├── tsconfig.json
├── biome.json
├── vitest.config.ts
├── package.json                      ← Single unified package.json
├── .env.example
└── CLAUDE.md
```

### Effect-ts Pattern

No `ManagedRuntime`. Use `React.cache()` + `Effect.runPromise` in Server Components:

```typescript
// app/(portfolio)/page.tsx
import { cache } from 'react'
import { Effect } from 'effect'
import { CmsService, CmsServiceLive } from '@cms/mod'

const getPageData = cache(() =>
  Effect.runPromise(
    Effect.gen(function* () {
      const cms = yield* CmsService
      return yield* cms.getAllPageData()
    }).pipe(
      Effect.provide(CmsServiceLive),
      Effect.catchAll(() => Effect.succeed(fallbackPageData))
    )
  )
)
```

### CMS Data Access

Payload Local API (no HTTP):

```typescript
// features/cms/cms.repository.ts
import { getPayload } from 'payload'
import config from '@payload-config'
import { Effect } from 'effect'

export const fetchProjects = Effect.tryPromise({
  try: async () => {
    const payload = await getPayload({ config })
    return payload.find({ collection: 'projects', where: { status: { equals: 'published' } } })
  },
  catch: (e) => new CmsNetworkError({ message: String(e) }),
})
```

### Path Aliases

```json
{
  "@app/*": ["./app/*"],
  "@features/*": ["./features/*"],
  "@payload-config": ["./payload.config.ts"],
  "@cms/*": ["./features/cms/*"]
}
```

---

## 5. Phase Breakdown

### Phase 1: `feat/rewrite-p1-foundation`

**Goal:** Working Next.js + Payload embedded + SST config. `pnpm dev` starts. `/admin` accessible.

**Delete:**
- `workers/`, `wrangler.toml`, `react-router.config.ts`, `vite.config.ts`
- `app/` (entire), `cms/` (entire — content migrated to root)

**Create:**
- `package.json` (unified), `tsconfig.json`, `next.config.ts`, `sst.config.ts`, `biome.json`, `vitest.config.ts`
- `payload.config.ts`, `collections/`, `globals/`, `access/`
- `app/` skeleton (layout, page stub, admin, api, types)
- `agents/docs/REWRITE-001-architecture-rewrite.md` (this file)

**Verification:**
```bash
pnpm install && pnpm typecheck && pnpm ci:check && pnpm dev
# / → returns null (stub)
# /admin → Payload admin login renders
```

### Phase 2: `feat/rewrite-p2-cms`

**Goal:** Full CMS service layer. All tests pass.

**Create:**
- `features/cms/` (service, repository, schema, errors, tests)
- `features/test/` (setup, fixtures, MSW)
- Run `pnpm payload:generate-types` → `payload-types.ts`

**Verification:**
```bash
pnpm payload:generate-types && pnpm typecheck && pnpm test --run
```

### Phase 3: `feat/rewrite-p3-portfolio`

**Goal:** Accessible HTML shell. SSR confirmed. `React.lazy` canvas placeholder.

**Create:**
- `app/(portfolio)/page.tsx` (full Server Component)
- `features/hero/`, `features/about/`, `features/work/`, `features/contact/`, `features/canvas/`
- Component tests for each section

**Verification:**
```bash
pnpm dev
# view-source: shows all text content in HTML
# Tab through page: all interactive elements reachable
pnpm test --run  # all ~20+ tests pass
```

### Phase 4: `feat/rewrite-p4-cicd`

**Goal:** CI/CD rebuilt for Next.js + SST. CLAUDE.md rewritten.

**Create/Modify:**
- `.github/workflows/ci.yml`, `deploy.yml`, `release.yml`, `claude-review.yml`
- `CLAUDE.md` (full rewrite)
- Delete `.github/workflows/bundle-size.yml` (Cloudflare-specific)

**Verification:**
```bash
# CI passes on PR push
pnpm sst deploy --stage dev  # deploys to AWS
```

---

## 6. Environment Variables

| Variable | Used by | Notes |
|---|---|---|
| `DATABASE_URL` | Payload CMS | Supabase PostgreSQL connection string. Add `?pgBouncer=true` for Lambda connection pooling |
| `PAYLOAD_SECRET` | Payload CMS | Random 32+ char secret for JWT signing |
| `NEXT_PUBLIC_SERVER_URL` | Payload CMS, Next.js | `http://localhost:3000` in dev, CloudFront URL in prod |
| `S3_BUCKET` | Payload media uploads | Provisioned by SST |
| `S3_REGION` | Payload media uploads | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | Local dev S3 only | Not needed in Lambda (IAM role) |
| `AWS_SECRET_ACCESS_KEY` | Local dev S3 only | Not needed in Lambda (IAM role) |
| `VARLOCK_TOKEN` | CI/CD | Injects all secrets at deploy time |

**Local dev:** `varlock pull --env development > .env.local`
**Production:** Varlock injects at `pnpm sst deploy`

---

## 7. Key Gotchas

1. **`pnpm build` needs `DATABASE_URL`** — Payload connects at build time. Keep out of `ci.yml`. Only run in `deploy.yml` with Varlock-injected secrets.

2. **Lambda connection pool limit** — Supabase free tier: 30 connections. Add `?pgBouncer=true` to `DATABASE_URL` for transaction pooling.

3. **`vi.mock('payload')` in tests** — Payload Local API cannot run in jsdom. Mock `payload` and `@payload-config` in all repository tests.

4. **`payload generate:types` before Phase 2 type assertions** — `_Assert` type checks fail until `payload-types.ts` exists.

5. **S3 not available locally** — Use conditional config: local `staticDir` when `NODE_ENV === 'development'`, S3 plugin in production only.

6. **`--turbopack` is banned** — `next dev` must use webpack. Turbopack does not support `raw-loader` (needed for GLSL shaders).

7. **`React.cache()` deduplication** — Wrap `getPageData` in `cache()` to prevent double DB hits from `generateMetadata` + `page.tsx` both calling it.

8. **SST secrets must be set before first deploy** — `pnpm sst secret set DatabaseUrl "..."` before running `pnpm deploy`.

---

## 8. Verification Steps

### Per Phase

| Phase | Commands | Expected |
|---|---|---|
| P1 | `pnpm install && pnpm typecheck && pnpm ci:check && pnpm dev` | Server starts, `/admin` renders |
| P2 | `pnpm payload:generate-types && pnpm typecheck && pnpm test --run` | Types clean, all CMS tests pass |
| P3 | `pnpm dev && pnpm test --run` | SSR HTML visible in source, ~20+ tests pass |
| P4 | CI green on PR push, `pnpm sst deploy --stage dev` | Deploys to AWS, `/admin` accessible |

### Post All Phases

```bash
pnpm test:coverage   # lines ≥ 60%, functions ≥ 60%, branches ≥ 55%
pnpm ci:check        # zero Biome errors
pnpm typecheck       # zero TypeScript errors
pnpm build           # production build succeeds (with DATABASE_URL set)
```

---

*End of REWRITE-001*
