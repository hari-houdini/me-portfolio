---
paths:
  - ".github/workflows/**"
  - ".releaserc.json"
  - ".github/dependabot.yml"
---

# CI/CD Rules

## GitHub Actions
- All action `uses:` versions must be pinned to full commit SHAs — never mutable tags like `@v4` or `@main`
  Format: `uses: actions/checkout@<40-char-sha>  # v4`
- No `continue-on-error: true` on the required `Quality gate` job — this silently masks failures
- The `if:` condition variant for optional jobs is acceptable (e.g., `if: contains(github.head_ref, 'phase-3')`)

## Secrets and permissions
- `gh pr review` requires `GH_TOKEN: ${{ github.token }}` in the step's `env:` block
- `environment: production` belongs only in `release.yml` — not in `claude-review.yml` or `ci.yml`
- Secrets used in `claude-review.yml` are repo-level (`CLAUDE_CODE_OAUTH_TOKEN`); no environment gate needed

## Semantic release
- Conventional commit types drive version bumps: `feat` → minor, `fix`/`perf` → patch, `BREAKING CHANGE` → major
- `[skip ci]` in commit message prevents CI re-run loop after semantic-release commits back to main
- Never manually edit `CHANGELOG.md` or the `version` field in `package.json` — semantic-release owns these

## Merge plan integration
- Branch protection on `main` requires: CI Quality Gate ✅ + Claude APPROVE ✅
- PRs are merged manually by the repo owner only — no auto-merge configuration
