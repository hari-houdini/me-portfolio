---
name: commit
description: Draft a conventional commit message from staged changes. Use when ready to commit work.
disable-model-invocation: true
---

# Conventional Commit Helper

Draft a commit message for the currently staged changes and create the commit after confirmation.

## Steps

1. Read the staged diff:
   ```bash
   git diff --cached --stat
   git diff --cached
   ```

2. Analyse the changes and determine:
   - **Type**: `feat` | `fix` | `refactor` | `chore` | `test` | `docs` | `style` | `build` | `perf`
   - **Scope**: infer from the changed file paths
     - `app/features/<pod>/` → scope is the pod name (e.g., `cms`, `warp`, `galaxy`)
     - `app/services/` → scope is the service name
     - `.github/workflows/` → scope is `ci`
     - `cms/` → scope is `cms`
     - `workers/` → scope is `workers`
     - Multiple unrelated areas → omit scope
   - **Description**: one line, imperative mood, lowercase, no trailing period, ≤ 72 chars
   - **Body** (if needed): explain WHY, not WHAT. Wrap at 72 chars.

3. Present the draft message for review:
   ```
   type(scope): description

   Optional body explaining the motivation.
   ```

4. Ask: "Does this look right? I'll run `git commit` with this message."

5. On confirmation, run:
   ```bash
   git commit -m "type(scope): description"
   ```
   Or with a body:
   ```bash
   git commit -m "type(scope): description" -m "Body text here."
   ```

## Rules
- Never include "I", "we", or "Claude" in the commit message
- Never use past tense ("added", "fixed") — use imperative ("add", "fix")
- If no files are staged, remind the user to `git add` first
- Never commit `console.log`, conflict markers, or `[ci-stub]` commits
