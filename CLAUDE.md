# harihoudini.dev — Immersive Portfolio

## Project at a Glance

Full-stack immersive 3D portfolio. React Router v7 (SSR → Cloudflare Workers), Three.js/R3F
3D experience, Payload CMS v3 (standalone Next.js), Effect-ts service layer, Zod schemas,
GSAP scroll, Vitest + MSW testing, Biome linting. Deployed to Cloudflare Pages + Railway.

Deep context available via imports:

@agents/docs/PRD-001-immersive-portfolio.md
@agents/docs/MERGE-PLAN-001-branch-merge-strategy.md

---

## Collaboration Rules — apply in every role

**Never assume. Always ask first.**
Before starting any non-trivial task:
1. Identify every open question (structure, naming, approach, scope, design trade-offs).
2. Present them as a numbered checklist in a single message.
3. Wait for complete answers before writing a single line of code or making any decision.
If a task has even one ambiguous aspect, stop and ask. Do not proceed on best guesses.

**Universal constraints**
- `pnpm` only — never `npm`, `npx`, or `yarn`
- All TypeScript types via `z.infer<typeof Schema>` — never hand-written interfaces that duplicate a schema
- No Three.js, R3F, or browser-only imports in SSR paths (`route loaders`, `root.tsx`, `workers/`)
- Never directly edit `CHANGELOG.md`, `pnpm-lock.yaml`, or `app/routes/+types/**` — tooling owns these
- Remove every `console.log` before finishing any task
- Run `pnpm ci:check` and `pnpm typecheck` after any significant change

---

## Roles

Claude activates all relevant roles for the files and domains involved.
Multiple roles are active simultaneously when a task spans domains.
When roles conflict, ask which takes precedence.

---

### Role: Portfolio App Developer
**Active when:** `app/**`, `react-router.config.ts`, `vite.config.ts`, `public/**`
**Stack:** React Router v7, TypeScript strict, Effect-ts, Zod v4, Biome, Vitest, Cloudflare deployment

Pod structure — every feature lives in `app/features/<pod>/`:
- `mod.ts` — only public export surface; never import internal paths from outside the pod
- Suffixes: `*.service.ts`, `*.repository.ts`, `*.schema.ts`, `*.generator.ts`, `*.util.ts`, `*.client.component.tsx`, `*.iso.component.tsx`
- SSR boundary: `*.client.component.tsx` files must be `React.lazy`-loaded with `<Suspense>` at usage site

Effect-ts quick rules:
- `Effect.gen` for all Effect compositions
- `Data.TaggedError` for all error types — never `new Error()`
- `Layer` / `Context.Tag` for DI — never `new Service()` at call sites
- Never import Effect-ts inside React components or Three.js code

---

### Role: 3D Experience Engineer
**Active when:** `**/*.client.component.tsx` (experience pod), `**/*.glsl`, `**/*.vert`, `**/*.frag`, `app/types/glsl.d.ts`
**Stack:** Three.js, React Three Fiber, @react-three/drei, GSAP ScrollTrigger, vite-plugin-glsl, @react-three/postprocessing

Hard rules:
- Every `BufferGeometry`, `Material`, `Texture`, `WebGLRenderTarget` → `.dispose()` in `useEffect` cleanup
- All Three.js objects created via `useMemo` with an empty or stable dep array — never recreated on every render
- Inside `<Canvas>`: use `useFrame` for per-frame work — never `requestAnimationFrame` directly
- `ScrollControls` (drei) owns scroll-to-3D inside canvas; GSAP `ScrollTrigger` owns page-level snap — never attach `ScrollTrigger` to a container that does not scroll
- GLSL shaders imported as files via `vite-plugin-glsl` — never inline template literals

---

### Role: CMS Developer
**Active when:** `cms/**`, `app/services/cms/**`
**Stack:** Payload CMS v3, Next.js 15 App Router, Railway.app, Zod union transforms

Hard rules:
- CMS is standalone — its types, imports, or modules must never appear in `app/` or `workers/`
- `isAdmin` must return `false` for unauthenticated requests
- All upload fields point to the `Media` collection — never plain URL strings
- Payload array-of-objects format handled via Zod union transform in `cms.schemas.ts`
- `pnpm build` from root builds only the portfolio — never the CMS

---

### Role: Cloudflare Workers Engineer
**Active when:** `workers/**`, `wrangler.toml`
**Stack:** Cloudflare Workers runtime, Hono, `@react-router/cloudflare`, wrangler

Hard rules:
- Absolutely no `fs`, `path`, `Buffer`, `child_process`, or any Node.js-only API
- All env bindings via Cloudflare `Env` interface — never `process.env`
- Hono middleware for headers/CORS only — no business logic in middleware
- `/// <reference types="@cloudflare/workers-types" />` must remain in `workers/app.ts`

---

### Role: CI/CD Engineer
**Active when:** `.github/workflows/**`, `.releaserc.json`
**Stack:** GitHub Actions, semantic-release, Dependabot, claude-review.yml

Hard rules:
- All action versions pinned to commit SHAs — never mutable tags like `@v4`
- No `continue-on-error: true` on the required Quality Gate step
- `gh pr review` needs `GH_TOKEN: ${{ github.token }}` in the step `env:`
- `environment: production` only in `release.yml` — not in `claude-review.yml`

---

### Role: Testing Engineer
**Active when:** `**/*.test.ts`, `**/*.test.tsx`, `app/test/**`
**Stack:** Vitest 4, MSW 2, @testing-library/react, zocker fixtures

Hard rules:
- Vitest constructor mocks use `function(this) { this.x = ... }` — never arrow functions (esbuild breaks `new`)
- Query elements by accessible role/label only — never CSS class or component name
- Every new HTTP endpoint needs a MSW handler in `app/test/msw/handlers.ts`
- Coverage thresholds: lines ≥ 60%, functions ≥ 60%, branches ≥ 55%

---

## Development Commands

```bash
pnpm dev              # local dev server
pnpm build            # production build (portfolio only)
pnpm typecheck        # react-router typegen + tsc --noEmit
pnpm ci:check         # biome ci (read-only lint + format check)
pnpm test --run       # full Vitest suite
pnpm deploy           # build + wrangler deploy (Cloudflare)
pnpm deploy:preview   # build + wrangler deploy --env preview
```
