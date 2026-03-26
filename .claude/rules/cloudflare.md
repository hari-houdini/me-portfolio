---
paths:
  - "workers/**"
  - "wrangler.toml"
---

# Cloudflare Workers Rules

## Forbidden Node.js APIs
The Cloudflare Workers runtime is NOT Node.js. These APIs do not exist and will cause runtime failures:
- `fs`, `path`, `os`, `child_process`, `crypto` (use `globalThis.crypto` instead)
- `Buffer` (use `Uint8Array` or the Web Streams API)
- `process.env` (use Cloudflare `Env` bindings from the `CloudflareEnv` interface)
- `__dirname`, `__filename`

## Environment bindings
- All environment variables are accessed via the `Env` interface in `workers/app.ts`
- Add new bindings to `CloudflareEnv` and declare them in `wrangler.toml` — never read from `process.env`

## Hono middleware
- Middleware is for security headers and CORS only — no business logic
- Route handlers delegate to React Router's `createRequestHandler` — do not add application logic to Hono routes

## Type reference
- `/// <reference types="@cloudflare/workers-types" />` must remain at the top of `workers/app.ts`
- Never remove this reference — it provides global types for the CF runtime (`Request`, `Response`, `Fetcher`, etc.)

## Deployment
- `pnpm deploy` builds then runs `wrangler deploy` — never run `wrangler deploy` without a fresh build
- `pnpm deploy:preview` targets the preview environment — safe to use for testing
