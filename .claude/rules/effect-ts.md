---
paths:
  - "app/services/**/*.ts"
  - "app/features/**/*.service.ts"
  - "app/features/**/*.repository.ts"
---

# Effect-ts Patterns

## Composition
- Use `Effect.gen` for all Effect compositions — never raw `.pipe(flatMap(...))` chains that reduce readability
- Use `.pipe` only for single-step transforms where `Effect.gen` would be more verbose

## Error types
- All domain errors extend `Data.TaggedError` with a `_tag` discriminant string
- Never use `new Error("message")` inside an Effect — always use a tagged error class
- Pattern-match on `_tag` at the service boundary to convert domain errors to HTTP responses

## Dependency injection
- Services exposed via `Layer` / `Context.Tag` — never `new MyService()` at call sites
- `ManagedRuntime` is constructed once at module load, not per-request

## Concurrency
- Concurrent CMS fetches use `Effect.all([...], { concurrency: "unbounded" })` — not sequential awaits
- Never block the event loop with synchronous I/O inside an Effect

## Boundaries
- Effect-ts is **never** imported inside React components, Three.js files, or GSAP callbacks
- Effect-ts is **never** imported in files under `workers/` — Cloudflare Workers has no Effect runtime
- The boundary is: loaders call `runtime.runPromise(effect)` — the component receives plain data
