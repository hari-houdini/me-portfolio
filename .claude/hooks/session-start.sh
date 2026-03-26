#!/usr/bin/env bash
# session-start.sh — inject minimal project context at session startup
# Outputs branch name and open PRs as additionalContext for Claude.

set -euo pipefail

BRANCH=$(git branch --show-current 2>/dev/null || echo "detached HEAD")

PRS=$(gh pr list \
  --author "@me" \
  --state open \
  --json number,title,headRefName \
  --jq '.[] | "  #\(.number) [\(.headRefName)] — \(.title)"' \
  2>/dev/null || echo "  (could not fetch — check gh auth)")

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}' \
  "=== Project context ===\nBranch: ${BRANCH}\nOpen PRs:\n${PRS:-  none}\n========================"
