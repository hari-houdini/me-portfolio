---
name: review-prep
description: Prepare a branch for Claude review — run all local CI checks, verify no ci-stub commits, check diff is clean. Use before triggering @claude review.
disable-model-invocation: true
---

# PR Review Preparation

Run all local quality checks and report what must be fixed before requesting Claude's review.

## Steps

1. **Check for ci-stub commits** (must be zero):
   ```bash
   git log --oneline --grep='\[ci-stub\]' origin/main..HEAD
   ```
   If any exist, list them — they must be reverted or dropped before merge.

2. **Biome lint and format** (must pass):
   ```bash
   pnpm ci:check
   ```

3. **TypeScript type check** (must pass):
   ```bash
   pnpm typecheck
   ```

4. **Full test suite** (must pass):
   ```bash
   pnpm test --run
   ```

5. **Scan for console.log** in changed files:
   ```bash
   git diff origin/main..HEAD -- '*.ts' '*.tsx' | grep '^+.*console\.'
   ```

6. **Check barrel exports** — for every new file added, verify its public API is exported from `mod.ts`:
   ```bash
   git diff --name-only origin/main..HEAD | grep 'app/features'
   ```

7. Report results as a table:
   ```
   Check              | Status
   ci-stub commits    | ✅ None
   pnpm ci:check      | ✅ Passed
   pnpm typecheck     | ❌ 2 errors
   pnpm test --run    | ✅ 119 tests passed
   console.log        | ✅ None found
   barrel exports     | ⚠️  Check app/features/warp/mod.ts
   ```

8. If any check fails, fix the issues before confirming readiness.

9. When all checks pass: "Branch is ready for @claude review."
