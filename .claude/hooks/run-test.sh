#!/usr/bin/env bash
# run-test.sh — PostToolUse hook that runs Vitest for the specific test file that was edited.
# Feeds the result back to Claude so it can address failures immediately.

set -uo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')

# Only trigger for test files
if [[ "$FILE" =~ \.(test|spec)\.(ts|tsx)$ ]]; then
  echo "Running tests for: $FILE" >&2

  RESULT=$(pnpm test --run "$FILE" 2>&1)
  EXIT_CODE=$?

  if [ $EXIT_CODE -ne 0 ]; then
    # PostToolUse cannot block, but stdout is shown to Claude as context
    echo "=== Test run failed for $FILE ==="
    echo "$RESULT"
    echo "=== Fix the failing tests before finishing this task ==="
  fi
fi

exit 0
