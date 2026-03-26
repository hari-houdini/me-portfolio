---
name: fix-types
description: Run pnpm typecheck, parse the errors, and fix them systematically one file at a time. Use when typecheck is failing.
disable-model-invocation: false
---

# TypeScript Error Fixer

Run the typecheck pipeline and fix every error, file by file.

## Steps

1. Run typecheck and capture all errors:
   ```bash
   pnpm typecheck 2>&1
   ```

2. Group errors by file. List them in a table:
   ```
   File                                  | Errors
   app/features/cms/cms.service.ts       | 3
   app/routes/home.tsx                   | 1
   ```

3. For each file (highest error count first):
   a. Read the full file
   b. Read the exact error message and line number
   c. Explain the root cause in one sentence
   d. Apply the fix — prefer the minimal, correct change:
      - If the type is wrong: fix the type annotation or derive from Zod schema
      - If the import is missing: add the import
      - If the function signature is wrong: correct the signature
   e. Do NOT use `as unknown as X` or `// @ts-ignore` to silence errors

4. After all fixes are applied, run typecheck again:
   ```bash
   pnpm typecheck 2>&1
   ```
   If new errors appear, repeat from step 2.

5. When typecheck exits 0, report the number of errors fixed.

## Rules
- Never add `any` to silence a type error
- Never use `@ts-ignore` or `@ts-expect-error` without an accompanying explanation comment
- All TypeScript types must be derived from Zod schemas via `z.infer<>` — never hand-written interface duplicates
- If a fix is non-obvious, explain the reasoning before applying it
