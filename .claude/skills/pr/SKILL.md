---
name: pr
description: Create a pull request using the project's standard body template. Use when ready to open a PR.
argument-hint: [base-branch]
disable-model-invocation: true
---

# PR Creation Helper

Create a pull request for the current branch using the project's standard template.

## Steps

1. Gather context:
   ```bash
   git branch --show-current           # head branch
   git log --oneline origin/main..HEAD # commits above base
   git diff --stat origin/main..HEAD   # files changed
   gh pr list --state open             # existing PRs (avoid duplicates)
   ```

2. Determine the base branch: use `$ARGUMENTS` if provided, otherwise `main`.

3. Infer the PR title from the branch name and commits:
   - `feat/phase-N` → `feat(phase-N): <description from commits>`
   - `fix/...` → `fix(...): <description>`
   - Follow conventional commit format

4. Build the PR body using this template:
   ```markdown
   ## Summary
   <1–3 sentence description of what this PR does and why>

   ## Changes

   | Commit | Contents |
   |--------|----------|
   | `<sha>` | `<message>` |

   ## Rebase / cherry-pick notes
   <describe any conflict resolutions if applicable, or "N/A">

   ## CI checklist
   - [ ] Quality Gate green (typecheck, biome, tests)
   - [ ] `@claude review this PR` triggered — Claude APPROVE received

   ## Linked
   - Issue: #18 (MERGE-PLAN-001)
   - PRD: #1 (PRD-001)
   ```

5. Show the draft title and body. Ask for confirmation.

6. On confirmation:
   ```bash
   gh pr create --base <base> --title "<title>" --body "<body>"
   ```

## Rules
- Never open a PR to `main` without confirming the CI checklist items are addressed
- Never open a duplicate PR for the same branch (check existing PRs first)
- Always link back to Issue #18 (MERGE-PLAN-001) for phase PRs
