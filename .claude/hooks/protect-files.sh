#!/usr/bin/env bash
# protect-files.sh — PreToolUse hook that blocks direct writes to tooling-owned files.
# Tooling-owned files must only be changed by pnpm, semantic-release, or react-router typegen.

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

PROTECTED_FILES=(
  "CHANGELOG.md"
  "pnpm-lock.yaml"
)

PROTECTED_PATTERNS=(
  "app/routes/+types/"
  ".react-router/types/"
)

# Check exact file matches
for protected in "${PROTECTED_FILES[@]}"; do
  if [[ "$FILE" == *"$protected"* ]] || [[ "$COMMAND" == *"$protected"* ]]; then
    jq -n \
      --arg file "$protected" \
      '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:("Direct edits to " + $file + " are not allowed. This file is owned by tooling (semantic-release / pnpm) and will be overwritten. Make your change via the appropriate tool instead.")}}'
    exit 0
  fi
done

# Check pattern matches (generated files)
for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE" == *"$pattern"* ]]; then
    jq -n \
      --arg file "$FILE" \
      --arg pattern "$pattern" \
      '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:("Direct edits to generated files under " + $pattern + " are not allowed. Run pnpm typecheck (which calls react-router typegen) to regenerate them. Edit the source route file instead.")}}'
    exit 0
  fi
done

exit 0
