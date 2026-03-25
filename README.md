# harihoudini.dev — Immersive 3D Portfolio

An immersive, single-page 3D portfolio built with React Three Fiber, custom GLSL shaders, and procedural generation. Every visual is authored code — no purchased assets.

> **Status:** Phase 2 complete — Payload CMS v3 schema, collections, globals, and Railway deployment config.
> See [PRD-001](./agents/docs/PRD-001-immersive-portfolio.md) for the full specification and [GitHub Issue #1](https://github.com/hari-houdini/me-portfolio/issues/1) for the requirement breakdown.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Router v7 (SSR, framework mode) |
| 3D Engine | React Three Fiber · @react-three/drei · Three.js |
| Post-FX | @react-three/postprocessing |
| Scroll | @react-three/drei ScrollControls · GSAP ScrollTrigger |
| Styling | Tailwind CSS v4 · Outfit · Space Grotesk · Inter |
| Accessibility | React Aria Components |
| Service Layer | Effect-ts (Layer DI · Effect.Effect · typed errors) |
| Schema & Validation | Zod v4 (schemas as source of truth · z.infer<> types) |
| CMS | Payload CMS v3 + Next.js 16 (`cms/` subfolder) |
| CMS DB | PostgreSQL via Supabase |
| CMS Hosting | Railway.app |
| Edge Deployment | Cloudflare Workers (Hono middleware) |
| Build | Vite 7 · Wrangler |
| Package Manager | pnpm |
| Linting & Formatting | Biome 2 |
| Testing | Vitest 4 · MSW 2 · @testing-library/react · zocker |

---

## Project Structure

```
me-portfolio/
├── app/
│   ├── features/               # 3D feature pods (Phase 3+)
│   │   ├── experience/         # R3F Canvas, camera rig, post-FX
│   │   ├── galaxy/             # Sections 1 + 2 — spiral galaxy particle system
│   │   ├── city/               # Section 3 — Blade Runner procedural city
│   │   ├── hero/ about/ work/ contact/ audio/
│   ├── services/
│   │   ├── cms/                # CMS service pod (complete)
│   │   │   ├── cms.schemas.ts  # Zod v4 schemas — single source of truth
│   │   │   ├── cms.types.ts    # Re-exports z.infer<> types from schemas
│   │   │   ├── cms.errors.ts   # Tagged Effect-ts error classes
│   │   │   ├── cms.repository.ts # Raw HTTP + Zod validation
│   │   │   ├── cms.service.ts  # Effect.Layer + Context.Tag service
│   │   │   └── mod.ts          # Public barrel — schemas, types, service tag
│   │   └── runtime.ts          # AppLayer = Layer.mergeAll(...)
│   ├── routes/
│   │   └── home.tsx            # SSR loader — Effect-ts CMS data fetching
│   ├── test/
│   │   ├── fixtures/           # zocker-generated schema-driven mocks
│   │   └── msw/                # MSW Node.js intercept server + handlers
│   ├── root.tsx                # HTML shell, fonts, error boundary
│   └── app.css                 # Tailwind v4, cyberpunk palette, typography
├── workers/
│   └── app.ts                  # Cloudflare Workers entry (Hono + RR7 handler)
├── cms/                        # Payload CMS v3 + Next.js 16 (complete)
│   ├── src/
│   │   ├── access/             # isAdmin access control function
│   │   ├── collections/        # Users, Media, Projects
│   │   ├── globals/            # SiteConfig, About, Contact
│   │   └── payload.config.ts   # Main Payload config (DB, editor, CORS, sharp)
│   ├── app/(payload)/          # Next.js admin panel + REST API routes
│   ├── railway.json            # Railway deployment config
│   └── .env.example            # Required environment variables
├── agents/
│   └── docs/
│       └── PRD-001-immersive-portfolio.md
├── wrangler.toml               # Cloudflare Workers config
├── vitest.config.ts
└── biome.json
```

### Pod / Module Rules

- Every feature lives in a **self-contained pod** with its own components, shaders, types, and tests.
- The pod's **`mod.ts` barrel** is the only public interface. Cross-pod imports always go through `mod.ts`, never internal paths.
- Internal utilities and sub-components are not exported from `mod.ts`.

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL (via Supabase free tier) — for Phase 2 CMS

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

App available at `http://localhost:5173`.

### Run Tests

```bash
# Single run
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Type-check

```bash
pnpm typecheck
```

### Lint & Format

```bash
pnpm check
```

---

## CMS Setup

The Payload CMS lives in `cms/` and runs as a separate Next.js 16 application.

### Local development

```bash
# 1. Copy environment file and fill in your values
cp cms/.env.example cms/.env

# 2. Install CMS dependencies
cd cms && pnpm install

# 3. Start the CMS dev server (admin panel at http://localhost:3001/admin)
pnpm dev
```

On first run, navigate to `http://localhost:3001/admin/create-first-user` to create your admin account.

### Required environment variables (`cms/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URI` | PostgreSQL connection string (Supabase: Settings → Database → URI) |
| `PAYLOAD_SECRET` | Random 32-char secret: `openssl rand -hex 32` |
| `NEXT_PUBLIC_SERVER_URL` | CMS origin (e.g. `http://localhost:3001`) |
| `PORTFOLIO_URL` | Portfolio origin, added to CMS CORS allow-list |

### Pointing the portfolio at the CMS

Set `PAYLOAD_API_URL` in the **portfolio** app's environment:

```bash
# portfolio/.env (local)
PAYLOAD_API_URL=http://localhost:3001
```

### CMS schema

| Resource | Slug | Type | Key fields |
|---|---|---|---|
| Users | `users` | Collection | email, password (auth built-in) |
| Media | `media` | Collection | file, alt, imageSizes: thumbnail (400px), og (1200×630) |
| Projects | `projects` | Collection | title, description, thumbnail, tags, url, github, featured, year, status, order |
| Site Config | `site-config` | Global | name, tagline, subtitle, sectionTitles, seo (metaTitle, metaDescription, ogImage) |
| About | `about` | Global | bio (richText), skills array, photo |
| Contact | `contact` | Global | email, ctaText, socials array (platform, url, label) |

### Payload array-of-objects format

Payload wraps every `array` field item in an object with an auto-generated `id`:

```
tags → [{ id: "abc", tag: "React" }]     (Payload API)
     → ["React"]                          (after Zod transform)
```

The portfolio's Zod schemas handle this transparently via a union transform that
accepts both the Payload object format AND plain strings (used in test fixtures).
No change is needed in the consuming components — they always receive `string[]`.

---

## Deployment

### Portfolio — Cloudflare Workers

```bash
# 1. Build the React Router server bundle
pnpm build

# 2. Deploy to Cloudflare Workers
pnpm deploy

# Preview deployment
pnpm deploy:preview
```

Configure `PAYLOAD_API_URL` as a Wrangler environment variable in `wrangler.toml` or via the Cloudflare dashboard.

### CMS — Railway.app

```bash
# From your Railway project, link the cms/ directory and set env vars
railway up --service cms
```

Set the following environment variables in Railway:

| Variable | Description |
|---|---|
| `DATABASE_URI` | Supabase PostgreSQL connection string (SSL required) |
| `PAYLOAD_SECRET` | Random 32-character secret (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_SERVER_URL` | The Railway public domain for this service |
| `PORTFOLIO_URL` | `https://harihoudini.dev` (for CORS) |

Railway uses `pnpm start` (configured in `cms/railway.json`) which runs `next start --port 3001`.
The CMS build produces a standalone Next.js output for minimal image size.

---

## Architecture Notes

### Effect-ts Service Layer

All CMS data fetching is expressed as composable `Effect.Effect` computations with explicit typed errors. This means every failure mode is visible in the type signature — no hidden exceptions.

```ts
// Route loader pattern
export const loader = async () =>
  Effect.runPromise(
    Effect.gen(function* () {
      const cms = yield* CmsService
      return yield* cms.getAllPageData()
    }).pipe(
      Effect.provide(AppLayer),
      Effect.catchAll(() => Effect.succeed(fallbackPageData)),
    ),
  )
```

Error variants: `CmsNetworkError` · `CmsNotFoundError` · `CmsParseError` — all tagged `Data.TaggedError` classes that can be exhaustively pattern-matched.

### Zod v4 Schemas

Schemas in `cms.schemas.ts` are the **single source of truth**. TypeScript types are derived exclusively via `z.infer<>` — none are written by hand.

Every API response is validated at runtime via `schema.safeParse()`. A structurally invalid response produces a `CmsParseError` instead of silently passing bad data downstream.

### Cloudflare Workers Entry

`workers/app.ts` wraps the React Router request handler in a Hono middleware layer for security headers, CORS, and future middleware concerns. The Cloudflare-to-Pages EventContext adapter will be integration-tested in Phase 5 (deploy).

### Testing Philosophy

> Test observable external behaviour — not implementation details.

- **Unit / integration tests** use Vitest + MSW (Node intercept server).
- **Fixtures** are generated from Zod schemas via `zocker().setSeed(42)`. If a schema changes, the fixture type errors surface immediately.
- Three.js / WebGL rendering is **not** unit-tested — verified manually in browser.

---

## Roadmap

| Phase | Status | Description |
|---|---|---|
| Phase 0 | ✅ Complete | PRD, architecture decisions, GitHub issue |
| Phase 1 | ✅ Complete | Foundation: deps, build, CMS service layer, tests |
| Phase 2 | ✅ Complete | Payload CMS v3: collections (Users, Media, Projects), globals (SiteConfig, About, Contact), Railway deploy config |
| Phase 3 | 🔜 Next | 3D experience: galaxy + cyberpunk city + scroll |
| Phase 4 | Planned | Content + polish: overlays, audio, mobile fallback, a11y |
| Phase 5 | Planned | Deploy: Cloudflare Workers + Railway + Supabase |

---

## Contributing / Working in this codebase

- All commits follow **Conventional Commits** (`feat:`, `fix:`, `chore:`, `test:`, `docs:`, `style:`, `refactor:`, `build:`).
- Run `pnpm check` before committing — Biome auto-fixes formatting.
- Test coverage threshold: **60%** lines/functions/branches on the `services/` module.
- New features get a pod in `app/features/` — see existing pods for the file/naming convention.
