#!/usr/bin/env bash
# stop-checklist.sh — Stop hook that prints a pre-commit checklist and optionally
# posts a "Claude finished" comment to the open PR for this branch.
# Runs async so it does not delay Claude's response.

set -uo pipefail

# ── Terminal checklist ────────────────────────────────────────────────────────
echo ""
echo "┌──────────────────────────────────────────────┐"
echo "│  Before pushing / requesting review:         │"
echo "│                                              │"
echo "│  □  pnpm ci:check    (biome lint + format)  │"
echo "│  □  pnpm typecheck                           │"
echo "│  □  pnpm test --run                          │"
echo "│  □  No console.log remaining in changed files│"
echo "│  □  mod.ts barrel exports updated            │"
echo "│  □  No [ci-stub] commits in branch           │"
echo "│                                              │"
echo "│  Run /review-prep to check all at once.      │"
echo "└──────────────────────────────────────────────┘"
echo ""

# ── PR comment (if an open PR exists for this branch) ────────────────────────
BRANCH=$(git branch --show-current 2>/dev/null || exit 0)
PR_NUMBER=$(gh pr view "$BRANCH" --json number --jq '.number' 2>/dev/null || echo "")

if [ -n "$PR_NUMBER" ]; then
  gh pr comment "$PR_NUMBER" \
    --body "Claude finished making changes to this PR. Please verify before merging:
- \`pnpm ci:check\` passes
- \`pnpm typecheck\` passes
- \`pnpm test --run\` passes
- No \`console.log\` remaining
- Barrel exports (\`mod.ts\`) updated for any new public APIs" \
    2>/dev/null || true
fi

exit 0
