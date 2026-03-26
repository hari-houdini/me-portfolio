---
name: new-pod
description: Scaffold a new feature pod with the correct directory structure, barrel file, and all layer stubs. Use when creating a new feature area in app/features/.
argument-hint: <pod-name>
disable-model-invocation: true
---

# Scaffold a New Feature Pod

Create a complete pod at `app/features/$ARGUMENTS/` following the project naming conventions.

## Steps

1. Ask the user which layers this pod needs if not obvious from context:
   - service (Effect-ts service layer)
   - repository (data access)
   - schema (Zod schemas)
   - util (shared constants / helpers)
   - client component (browser-only, Three.js or interactive UI)
   - iso component (SSR-safe React component)

2. Create the directory and all requested files using the correct suffixes:

```
app/features/<pod-name>/
  mod.ts                                  ← barrel, public export surface only
  <pod-name>.schema.ts                    ← Zod schemas (if requested)
  <pod-name>.service.ts                   ← Effect-ts service (if requested)
  <pod-name>.repository.ts                ← data access (if requested)
  <pod-name>.util.ts                      ← shared utilities (if requested)
  <pod-name>.client.component.tsx         ← CSR-only component (if requested)
  <pod-name>.iso.component.tsx            ← SSR-safe component (if requested)
  __tests__/
    <pod-name>.unit.test.ts               ← Vitest unit tests
```

3. File stubs — use these exact shapes:

**mod.ts**
```typescript
// <pod-name>/mod.ts — public API surface for the <pod-name> pod
// Only export what external code needs. Never re-export internal paths.
export {} // replace with actual exports
```

**schema.ts**
```typescript
import { z } from "zod";

// TODO: define Zod schemas for this pod
// All TypeScript types must be derived via z.infer<> — never hand-written
export const ExampleSchema = z.object({});
export type Example = z.infer<typeof ExampleSchema>;
```

**service.ts**
```typescript
import { Context, Data, Effect, Layer } from "effect";

class <PodName>Error extends Data.TaggedError("<PodName>Error")<{
  cause?: unknown;
}> {}

export class <PodName>Service extends Context.Tag("<PodName>Service")<
  <PodName>Service,
  { readonly example: () => Effect.Effect<void, <PodName>Error> }
>() {}

export const <PodName>ServiceLive = Layer.succeed(<PodName>Service, {
  example: () => Effect.succeed(void 0),
});
```

**unit.test.ts**
```typescript
import { describe, expect, it } from "vitest";

describe("<pod-name>", () => {
  it("TODO: write tests", () => {
    expect(true).toBe(true);
  });
});
```

4. After creating files, remind the user to:
   - Add public exports to `mod.ts`
   - Run `pnpm typecheck` to verify the new files compile
