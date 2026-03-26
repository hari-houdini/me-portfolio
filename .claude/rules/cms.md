---
paths:
  - "cms/src/**"
  - "cms/app/**"
  - "cms/package.json"
  - "cms/next.config.ts"
---

# Payload CMS v3 Rules

## Isolation boundary
- The CMS is a **standalone Next.js 15 application** — its types, modules, and imports must NEVER appear in `app/` or `workers/`
- The integration boundary is exclusively the Payload REST API
- `tsconfig.json` at the repo root excludes `cms/**/*` — this is intentional and must not be removed

## Access control
- `isAdmin` (`cms/src/access/is-admin.access.ts`) must return `false` for unauthenticated requests
- Read access on all globals and the `Projects` collection is public (no auth required) — the portfolio server fetches without credentials
- Write access (create, update, delete) on all collections and globals requires `isAdmin`

## Collections and globals
- All upload/image fields must use Payload's `upload` type pointing to the `Media` collection — never plain URL strings
- `SiteConfig`, `About`, and `Contact` are `globals`, not collections
- The `socials` field in `Contact` is an `array` with `platform`, `url`, and `label` sub-fields

## Schema alignment
- Payload's `array` field type wraps items in objects with an auto-generated `id`
- The Zod union transform in `app/services/cms/cms.schemas.ts` handles both `string[]` and `{value: string, id: string}[]` shapes
- When adding a new Payload field, also update the corresponding Zod schema and run `/cms-schema` to verify alignment

## Build isolation
- `pnpm build` from the repo root builds **only** the React Router portfolio — never the CMS
- The CMS is built and deployed independently to Railway.app via its own CI
