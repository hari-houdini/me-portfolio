# MERGE-PLAN-001: Branch Merge Strategy — harihoudini.dev

**Status:** Approved  
**Author:** Hari Houdini  
**Created:** 2026-03-24  
**Last Updated:** 2026-03-24  
**Version:** 1.0.0  
**Linked PRD:** [PRD-001 — Immersive 3D Portfolio](./PRD-001-immersive-portfolio.md)  
**Linked Issue:** [GitHub Issue #18](https://github.com/hari-houdini/me-portfolio/issues/18)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Branch Inventory](#2-branch-inventory)
3. [Pre-Merge Strategy](#3-pre-merge-strategy)
4. [Risk Assessment & Mitigation](#4-risk-assessment--mitigation)
5. [Feature Flag Strategy](#5-feature-flag-strategy)
6. [Merge Process Steps](#6-merge-process-steps)
   - 6.1 [Gate Definitions](#61-gate-definitions)
   - 6.2 [Step 1 — Phase 1](#62-step-1--phase-1)
   - 6.3 [Step 2 — Phase 2](#63-step-2--phase-2)
   - 6.4 [Step 3 — Phase 3](#64-step-3--phase-3)
   - 6.5 [Step 4 — Phase 4](#65-step-4--phase-4)
7. [Claude Review Workflow](#7-claude-review-workflow)
8. [Post-Merge Validation](#8-post-merge-validation)
9. [Branch Cleanup](#9-branch-cleanup)
10. [Decisions Log](#10-decisions-log)

---

## 1. Executive Summary

### Context

The `me-portfolio` repository contains five parallel feature branches representing four distinct phases of the immersive 3D portfolio described in PRD-001. These branches were developed on a parallel track to `main` and have never been cleanly merged. The tree is divergent and messy — a straight merge of any branch would drag unresolvable conflicts and an illegible commit graph into `main`.

### Goal

Land all four phases onto `main` in order, producing a clean, linear, reviewable history — without merge conflicts, without broken CI at any point, and without releasing features out of their intended sequence. Each phase must be independently reviewable and revertable.

### Strategy in One Sentence

**Rebase each phase branch sequentially onto the current tip of `main`, resolve known conflicts as documented, open one PR per phase, pass the CI + Claude review hard gate, then merge — in order, manually.**

### Merge Order

```
main (current) → Phase 1 → Phase 2 → Phase 3 → Phase 4
```

### Non-Negotiables

- Nothing touches `main` without your manual approval of the PR.
- Every PR must pass both the CI Quality Gate and Claude's formal review approval before the merge button is active.
- No phase is merged until the previous phase is already on `main`.
- No squash merges. Merge commits preserve the full history of each phase.

---

## 2. Branch Inventory

### Active Feature Branches

| Branch | Unique commits vs `main` | Phase | Contents |
|--------|--------------------------|-------|----------|
| `feat/phase-1` | 11 | 1 | Foundation: deps, Zod schemas, Effect-ts service layer, MSW test infrastructure, SSR home route loader, Biome/font/colour config |
| `feat/phase-2` | 7 | 2 | CMS: Payload CMS v3 scaffold, Users/Media/Projects collections, SiteConfig/About/Contact globals, access control, schema refinement |
| `refactor/phase-3` | 28 (includes `feat/phase-3-01` through `feat/phase-3-07`) | 3 | 3D Experience: R3F canvas, galaxy particle system, cyberpunk city, post-processing, HTML overlays, Web Audio, GSAP scroll integration, warp tunnel, hero animation, naming refactor |
| `feat/phase-4` | 10 unique (5 CI duplicates to drop) | 4 | Polish: liquid-glass nav, EncryptedText, Tone.js audio rewrite, React Aria RadioGroup, glassmorphism overlays, a11y fixes, self-hosted fonts |

### Phase 3 Sub-Branch Lineage (absorbed into `refactor/phase-3`)

The following branches form a linear chain. They are fully contained within `refactor/phase-3` and do **not** require individual PRs:

`feat/phase-3-01-foundation` → `feat/phase-3-02-experience` → `feat/phase-3-03-galaxy` → `feat/phase-3-04-city` → `feat/phase-3-05-overlays` → `feat/phase-3-06-audio` → `feat/phase-3-07-integration` → `refactor/phase-3`

### Branches to Ignore During This Process

| Branch | Action |
|--------|--------|
| `dependabot/npm_and_yarn/*` | Leave untouched. Dependabot will automatically re-raise them against the updated `main` after all phases land. |

---

## 3. Pre-Merge Strategy

### Continuous Maintenance Rules During the Merge Window

The merge window is the period from when this plan is activated until Phase 4 is merged. During this window:

**Rule 1: No direct commits to `main`.**  
All changes go through a PR. This ensures branch protection checks run on every change and the release pipeline is not accidentally broken.

**Rule 2: No rebase of a phase branch once its PR is open and under review.**  
Rebasing a branch after a PR is open rewrites SHAs, invalidates the existing review thread, and dismisses Claude's pending review. If new changes are needed on a branch that already has an open PR, push a normal fix commit instead. Only rebase before the PR is opened.

**Rule 3: After each phase merges, immediately pull `main` locally before starting the next phase's rebase.**  
```bash
git checkout main && git pull
```
This ensures the next rebase uses the exact latest tip of `main`, not a stale local copy.

**Rule 4: After a force-push rebase (before the PR is opened), CI re-runs automatically.**  
Wait for the CI Quality Gate to go green before commenting `@claude review this PR`. Claude reviewing a failing branch wastes a review cycle.

**Rule 5: If a Dependabot PR targets a branch or package that will be significantly changed by Phase 3 or Phase 4, close it.**  
Dependabot will re-open the PR automatically after all phases land on `main` with the correct base packages.

### Semantic Release Behaviour During the Merge Window

`release.yml` triggers on every push to `main`. Each phase merge will produce a new semantic version:

| Merge | Conventional commit types in that phase | Expected version bump |
|-------|-----------------------------------------|-----------------------|
| Phase 1 | `feat`, `fix`, `chore`, `test`, `style`, `build`, `docs` | **minor** (feat commits present) → `v1.1.0` |
| Phase 2 | `feat`, `refactor`, `docs` | **minor** → `v1.2.0` |
| Phase 3 | `feat`, `fix`, `refactor`, `chore`, `test` | **minor** → `v1.3.0` |
| Phase 4 | `feat`, `fix`, `perf`, `test` | **minor** → `v1.4.0` |

No `BREAKING CHANGE` footers are present in any phase branch, so no major version bump will be triggered. The `CHANGELOG.md` and `package.json` version will be committed back to `main` automatically by `github-actions[bot]` after each merge with `[skip ci]` to prevent a CI re-run loop.

---

## 4. Risk Assessment & Mitigation

### Risk Matrix

| Risk | Likelihood | Impact | Phase | Mitigation |
|------|-----------|--------|-------|------------|
| Rebase conflict in `biome.json` (Phase 1 removes `!cms`, `!.github/` exclusions and `ignoreUnknown: true` that `main` added) | **Certain** | Medium | 1 | Resolve in favour of `main`'s version. Explicitly documented in Step 6.2. |
| Rebase conflict in `workers/app.ts` (Phase 1 removes the Cloudflare types reference `/// <reference types="@cloudflare/workers-types" />`) | **Certain** | Medium | 1 | Keep `main`'s line during conflict resolution. |
| Rebase conflict in `package.json` (`version` field: `main` has `1.0.0` from semantic-release; Phase 1 has no version field) | **Certain** | Low | 1 | Keep `main`'s `"version": "1.0.0"` field. |
| `tsconfig.json` on `main` has no `exclude` array — after Phase 2 adds `cms/`, `tsc` will scan Next.js code and fail typecheck | **Certain** | High | 2 | Add an explicit fix commit to `feat/phase-2` adding `"exclude": ["node_modules", "cms/**/*"]` before opening the PR. |
| Three.js / GLSL build failure during Phase 3 PR (unexpected type gaps or vite-plugin-glsl config issues) | Low | High | 3 | GLSL type declarations are added in the first Phase 3 commit. If a failure emerges that is definitively fixed only in Phase 4, add `continue-on-error: true` to the specific failing `ci.yml` step as a documented temporary commit. Remove before merge. |
| Phase 4 cherry-pick conflicts (CI commits in `feat/phase-4` that are already on `main`) | **Certain** | Medium | 4 | Do not rebase `feat/phase-4`. Create `feat/phase-4-clean` from `main` and cherry-pick only the 10 unique Phase 4 commits, explicitly dropping the 5 CI duplicate commits. |
| Stale review dismissed after a fix push — Claude's APPROVE is wiped, must re-trigger | **Certain** | Low | All | Expected and correct. Comment `@claude re-review` after each fix push. |
| Dependabot PRs conflicting with Phase 3/4 package changes | Low | Low | 3, 4 | Close any conflicting Dependabot PRs. They auto-regenerate after `main` is stable. |
| Semantic-release creates a tag mid-process that conflicts with a later phase's conventional commits | Very Low | Low | All | Semantic-release uses `[skip ci]` on its own commits. No tag conflict is expected since phases introduce only `feat`/`fix` bumps, never `BREAKING CHANGE`. |

### Known Conflicts — Exact File-Level Detail

#### Phase 1 — `biome.json`

`main` has:
```json
"files": {
  "ignoreUnknown": true,
  "includes": ["**", "!**/*.css", "!coverage", "!build", "!cms", "!.github/"]
}
```

`feat/phase-1` has (incorrect):
```json
"files": {
  "ignoreUnknown": false,
  "includes": ["**", "!**/*.css", "!coverage", "!build"]
}
```

**Resolution:** Keep `main`'s version in full.

#### Phase 1 — `workers/app.ts`

`main` has (line 21):
```typescript
/// <reference types="@cloudflare/workers-types" />
```

`feat/phase-1` does not have this line.

**Resolution:** Keep `main`'s line.

#### Phase 2 — `tsconfig.json` (fix commit required)

After rebase, `tsconfig.json` will have no `exclude` array. The `cms/` directory (added by Phase 2) contains Next.js code that will fail type-checking with the portfolio's strict tsconfig.

**Fix commit to add:**
```json
{
  "include": ["**/*", "**/.server/**/*", "**/.client/**/*", ".react-router/types/**/*", "workers/**/*"],
  "exclude": ["node_modules", "cms/**/*"],
  "compilerOptions": { ... }
}
```

This fix already exists in `feat/phase-4` (`git show feat/phase-4:tsconfig.json` confirms it). It belongs in Phase 2 where the `cms/` directory is introduced.

#### Phase 4 — CI duplicate commits to drop

The following 5 commits exist in `feat/phase-4` but are already on `main` via a different path. They must **not** be cherry-picked:

| SHA | Message |
|-----|---------|
| `65c3e251` | `chore(ci): add GitHub workflows, Dependabot, and semantic-release config` |
| `faf1eaa5` | `fix(ci): resolve workflow failures on main` |
| `a634752b` | `fix(types): add Cloudflare Workers types reference to workers/app.ts` |
| `1c7e8a40` | `fix(ci): add environment: production to release and claude-review jobs` |
| `f7b9ebc9` | `chore: trigger initial CI workflow registration [skip ci]` |

---

## 5. Feature Flag Strategy

### Assessment: No Feature Flags Required

This codebase does not use a feature flag system (no LaunchDarkly, Flipt, or environment-variable-gated flags). The phased release is enforced entirely by the merge sequence — a feature does not exist on `main` until its PR is merged.

### Functional Analogues to Feature Flags (Already Built In)

Two mechanisms in the codebase already provide runtime gating that serves a similar purpose:

**1. WebGL / viewport detection gate (Three.js canvas)**  
The Three.js canvas is only mounted when:
- Viewport width ≥ 1024px, AND
- `WebGL2` is supported by the browser, AND
- `prefers-reduced-motion` is not `reduce`

This is not a deployment flag — it is a capability flag. The CSS fallback activates automatically for visitors who do not meet these criteria. No configuration change is needed.

**2. Audio opt-in gate (Tone.js)**  
Audio is suspended by default. The `AudioContext` only resumes on an explicit user gesture (the audio toggle). This satisfies browser autoplay policy and requires no deployment configuration.

### What This Means for the Merge Plan

Because there are no feature flags, there is no "dark launch" or "percentage rollout" phase. Each merged PR is immediately live to 100% of visitors upon deployment. The consequence: **every PR must be production-ready before it is merged.** This is enforced by the CI + Claude hard gate.

---

## 6. Merge Process Steps

### 6.1 Gate Definitions

Every PR must pass **both** gates before the merge button is active:

**Gate 1 — CI Quality Gate** (`ci.yml` — `Quality gate` job)  
Three steps must all exit 0:
1. `pnpm ci:check` — Biome lint and format check (read-only, no auto-fix)
2. `pnpm typecheck` — `react-router typegen && tsc --noEmit` in strict mode
3. `pnpm test --run` — Full Vitest suite

**Gate 2 — Claude Review Approval** (`claude-review.yml`)  
Triggered manually by commenting `@claude review this PR` in the PR. Claude submits a formal GitHub PR review:
- `REQUEST_CHANGES` → merge button disabled; iterate until resolved
- `APPROVE` → merge button active (combined with Gate 1 green)

### 6.2 Step 1 — Phase 1

**Branch:** `feat/phase-1`  
**PR target:** `main`  
**Contains:** Foundation — deps, Zod schemas, Effect-ts service layer, MSW test infrastructure, SSR home route loader, Biome config, cyberpunk colour palette, fonts

#### Rebase

```bash
git checkout feat/phase-1
git rebase main
```

**Conflicts to resolve manually:**

| File | Action |
|------|--------|
| `biome.json` | Keep `main`'s version: `ignoreUnknown: true`, includes `!cms` and `!.github/` |
| `workers/app.ts` | Keep `main`'s `/// <reference types="@cloudflare/workers-types" />` line |
| `package.json` | Keep `main`'s `"version": "1.0.0"` field |

After resolving each conflict:
```bash
git add <file>
git rebase --continue
```

#### Push and open PR

```bash
git push --force-with-lease origin feat/phase-1
```

Open PR: `feat/phase-1` → `main`

**PR description must include:**
- Phase 1 scope (link to PRD-001 §4.1 modules)
- Conflict resolution decisions taken
- Known limitations: Three.js components not yet present; home route returns CMS data but renders a static shell until Phase 3

#### Gates

1. Wait for CI Quality Gate to go green.
2. Comment: `@claude review this PR`
3. Iterate until Claude submits `APPROVE`.
4. Merge.

---

### 6.3 Step 2 — Phase 2

**Branch:** `feat/phase-2`  
**PR target:** `main` (after Phase 1 is merged)  
**Contains:** CMS — Payload CMS v3 scaffold in `cms/` subdirectory, Users/Media/Projects collections, SiteConfig/About/Contact globals, `isAdmin` access control, Zod schema refinement

#### Pull updated `main` first

```bash
git checkout main && git pull
```

#### Rebase

```bash
git checkout feat/phase-2
git rebase main
```

Phase 2 commits are additive (new `cms/` directory, extends existing schemas). Conflict likelihood is low. The Zod schema refinement commit (`2a755a0b`) touches existing schema files — monitor for conflicts there.

#### Add required fix commit

After the rebase completes, `tsconfig.json` must be updated to exclude the `cms/` directory from type-checking:

```bash
# Edit tsconfig.json — add "exclude" array:
# "exclude": ["node_modules", "cms/**/*"]

git add tsconfig.json
git commit -m "fix(tsconfig): exclude cms/ from portfolio type-checking

The cms/ subdirectory is a standalone Next.js application with its own
tsconfig. Without this exclusion, tsc attempts to compile Next.js source
files against the portfolio's strict tsconfig and fails.

Backported from feat/phase-4 where it was originally applied."
```

#### Push and open PR

```bash
git push --force-with-lease origin feat/phase-2
```

Open PR: `feat/phase-2` → `main`

**PR description must include:**
- Phase 2 scope (CMS architecture, Payload CMS v3 choice rationale)
- Note that `cms/` is a standalone Next.js application — `pnpm build` from the root does NOT build it
- CMS deployment is independent of the portfolio (separate Railway.app process)
- The tsconfig fix commit and why it was added here

#### Gates

Same as Step 1. CI green → `@claude review this PR` → iterate → Claude APPROVE → merge.

---

### 6.4 Step 3 — Phase 3

**Branch:** `refactor/phase-3`  
**PR target:** `main` (after Phase 2 is merged)  
**Contains:** Full 3D experience — R3F canvas, galaxy particle system with GLSL shaders, cyberpunk city (replaced by warp tunnel in `refactor/phase-3`), HTML content overlays, Web Audio ambient synthesis, GSAP ScrollTrigger snap, scroll-driven hero animation, naming convention refactor

Note: This branch is the tip of the `feat/phase-3-01` → `feat/phase-3-07` → `refactor/phase-3` chain. All sub-branch commits are included. No sub-branch PRs are needed.

#### Pull updated `main` first

```bash
git checkout main && git pull
```

#### Rebase

```bash
git checkout refactor/phase-3
git rebase main
```

This is the highest-complexity rebase. Phase 3 significantly modifies `app/routes/home.tsx` (integrating the 3D canvas into the route that Phase 1 scaffolded). Monitor these files for conflicts:

| File | Conflict risk | Resolution guidance |
|------|--------------|---------------------|
| `app/routes/home.tsx` | **High** | Preserve Phase 1/2's SSR loader data fetching. Accept Phase 3's canvas mounting and scroll orchestration code. |
| `package.json` | Medium | Phase 3 adds GSAP, additional R3F packages. Accept all new deps. Keep `"version"` from main. |
| `app/root.tsx` | Low | Accept Phase 3's font and CSS variable additions. |

#### Pipeline contingency (Phase 3 only)

**`continue-on-error: true` on the required Quality Gate is not an acceptable mitigation.** It silently masks real build errors on the step that branch protection requires to pass, and there is no automated enforcement of the "remove before merge" clause.

If the CI Quality Gate fails on a specific step due to an issue that is definitively resolved only in Phase 4, the correct approach is to add a **dedicated optional CI job** in `ci.yml` that runs the flaky check in isolation — separate from the required `quality` job:

```yaml
# ci.yml — add alongside the existing required `quality` job
  typecheck-phase3-preview:
    name: Typecheck preview (non-blocking)
    runs-on: ubuntu-latest
    # Only runs on the Phase 3 PR branch. Does not block merge.
    if: contains(github.head_ref, 'phase-3')
    continue-on-error: true   # Isolated to this non-required job only
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
```

Add this as a labelled commit on the Phase 3 branch:
```bash
git commit -m "chore(ci): add non-blocking typecheck preview job for Phase 3 PR

The required Quality Gate job remains unmodified and must still pass.
This optional job surfaces typecheck output for review without blocking
the merge. Remove this job after Phase 3 merges.
[ci-stub]"
```

Key differences from the `continue-on-error` approach:
- The **required** `quality` job is never touched — branch protection still enforces it
- The optional job is scoped to Phase 3 branches only via the `if:` condition
- Failure is visible and reported in CI without blocking the gate
- The `[ci-stub]` label in the commit message makes it grep-able for removal

**This job must be removed before Phase 3 is merged.** Add it to the PR checklist.

#### Push and open PR

```bash
git push --force-with-lease origin refactor/phase-3
```

Open PR: `refactor/phase-3` → `main`

**PR description must include:**
- All sub-phases covered (01 through 07 + refactor)
- Note on the warp tunnel replacing the original cyberpunk city (and why)
- If a `typecheck-phase3-preview` job was added: its commit SHA and the explicit checklist item below
- Checklist item: "[ ] Remove all [ci-stub] commits before merge (grep: `git log --oneline --grep='\[ci-stub\]'`)"

#### Gates

Required `quality` job green → `@claude review this PR` → iterate → Claude APPROVE → merge.

---

### 6.5 Step 4 — Phase 4

**Branch:** `feat/phase-4-clean` *(new branch, created from `main` after Phase 3 merges)*  
**PR target:** `main` (after Phase 3 is merged)  
**Contains:** Polish — liquid-glass section nav, EncryptedText component, Tone.js audio rewrite with section crossfading, React Aria RadioGroup nav, glassmorphism on overlays and project cards, a11y fixes (prefers-reduced-motion reactive, Lexical bio sr-only), self-hosted Outfit/Space Grotesk fonts with `rel=preload`

#### Pull updated `main` first

```bash
git checkout main && git pull
```

#### Create clean branch and cherry-pick

```bash
git checkout -b feat/phase-4-clean main
```

Cherry-pick only the 10 Phase 4-unique commits, in chronological order:

```bash
git cherry-pick 332e9bd6   # fix(scroll): connect GSAP ScrollTrigger to ScrollControls
git cherry-pick 36c8caad   # feat(nav): liquid-glass section navigation with SVG displacement
git cherry-pick a0efe12c   # feat(shared): add EncryptedText component
git cherry-pick 2474e81e   # feat(audio): rewrite ambient music with Tone.js crossfading
git cherry-pick bbeb2092   # test(audio): rewrite service tests to mock Tone.js module
git cherry-pick 51eb8303   # feat(nav): refactor SectionNav to React Aria RadioGroup
git cherry-pick 255d4956   # feat(overlays): apply glassmorphism to project cards, work panel, contact
git cherry-pick 18bfe48a   # fix(a11y): fix Lexical bio serialization in sr-only content
git cherry-pick 3e0c2cc2   # perf(fonts): self-host Outfit and Space Grotesk with rel=preload
git cherry-pick 7d57bd9d   # fix(a11y): make prefers-reduced-motion detection reactive to OS changes
```

**CI duplicate commits — DO NOT cherry-pick:**

| SHA | Message | Why dropped |
|-----|---------|-------------|
| `65c3e251` | `chore(ci): add GitHub workflows...` | Already on `main` |
| `faf1eaa5` | `fix(ci): resolve workflow failures on main` | Already on `main` |
| `a634752b` | `fix(types): add Cloudflare Workers types reference` | Already on `main` |
| `1c7e8a40` | `fix(ci): add environment: production...` | Already on `main` |
| `f7b9ebc9` | `chore: trigger initial CI workflow registration` | Already on `main` |

#### Push and open PR

```bash
git push -u origin feat/phase-4-clean
```

Open PR: `feat/phase-4-clean` → `main`

**PR description must include:**
- Cherry-pick methodology and why `feat/phase-4` was not rebased directly
- List of dropped CI duplicate commits with justification
- Note that `feat/phase-4` (original) is superseded and will be deleted

#### Gates

Same gate sequence: CI green → `@claude review this PR` → iterate → Claude APPROVE → merge.

---

## 7. Claude Review Workflow

### Setup

The `claude-review.yml` workflow has been updated from the baseline version to support:
1. **Auto-detected phase focus** — fetches the PR's head branch from the GitHub API; maps to a phase-specific review prompt
2. **Formal GitHub review submission** — Claude runs `gh pr review --approve` or `gh pr review --request-changes` at the end of each review pass, integrating with branch protection
3. **Iterative back-and-forth** — every `@claude` comment in the PR triggers a fresh review cycle

### Branch Protection Requirement (One-Time Manual Setup)

Repo → **Settings → Branches → Edit rule for `main`**:

| Setting | Value |
|---------|-------|
| Require a pull request before merging | ✅ |
| Required approvals | `1` |
| Dismiss stale reviews when new commits are pushed | ✅ |
| Require status checks to pass — `Quality gate` | ✅ |
| Require branches to be up to date before merging | ✅ |

### Trigger Sequence Per PR

```
CI green
  ↓
@claude review this PR
  ↓
Claude: inline comments + REQUEST_CHANGES (if issues found)
  ↓
Fix issues → push new commit (stale review auto-dismissed)
  ↓
@claude re-review
  ↓
Claude: verifies fixes → APPROVE (if clean) or REQUEST_CHANGES (if new/unresolved issues)
  ↓
Merge button active
```

### Phase-Specific Review Focus

| Phase branch | Primary review focus |
|-------------|---------------------|
| `feat/phase-1` | Effect-ts generator patterns (`Effect.gen`), `Data.TaggedError` error types, `Layer`/`Context.Tag` DI, Zod schemas as single source of truth (no hand-written types), MSW handler correctness, Cloudflare Workers API compatibility (no Node.js APIs), SSR loader error handling, barrel export discipline |
| `feat/phase-2` | Payload CMS field type correctness, `isAdmin` access control exhaustiveness, Zod↔Payload response shape alignment, no Next.js or Payload types leaking into the portfolio application, `cms/` isolation from the portfolio TypeScript project |
| `refactor/phase-3` | `React.lazy`+`Suspense` wrapping of all Three.js components, no Three.js imports on SSR paths, `.dispose()` on every geometry/material/texture in `useEffect` cleanup, `useMemo` for all scene objects, GLSL imported as files (not inline template literals), GSAP ScrollTrigger ↔ `ScrollControls` integration boundary, mobile fallback gate correctness |
| `feat/phase-4-clean` | React Aria `RadioGroup`/`Radio` keyboard contract, Tone.js state machine (idle → playing → idle, no unreachable states), every Tone.js node has `.dispose()`, `prefers-reduced-motion` reactive (not one-shot on mount), sr-only content completeness, `rel=preload` font configuration correctness |

---

## 8. Post-Merge Validation

### After Each Phase Merge

Immediately after each PR is merged to `main`:

**Step A — Verify CI on `main` passes**  
The merge commit triggers `ci.yml` on `main`. Confirm it goes green. If it fails, investigate immediately — do not proceed to the next phase's rebase.

**Step B — Verify semantic release ran**  
`release.yml` triggers on the push to `main`. Confirm:
- A new tag was created (e.g. `v1.1.0` after Phase 1)
- `CHANGELOG.md` was updated
- `package.json` version was bumped
- The release commit has `[skip ci]` (to prevent a CI re-run loop)

If `release.yml` fails (e.g. missing `RELEASE_TOKEN`), investigate before merging the next phase.

**Step C — Confirm the feature behaviour is present on `main`**

| After merging | Verify |
|---------------|--------|
| Phase 1 | `pnpm dev` starts without errors. Home route loads with CMS data (or fallback). 25+ tests pass. |
| Phase 2 | `cms/` directory is present. `tsconfig.json` has `exclude: ["node_modules", "cms/**/*"]`. No typecheck regressions. |
| Phase 3 | `pnpm dev` renders the full 3D experience in a desktop browser. GSAP snap works. Mobile shows the CSS fallback. Tests include warp generator suite. |
| Phase 4 | Section nav responds to keyboard. Audio toggle works. Fonts load with `rel=preload`. `prefers-reduced-motion` disables animations. |

### Post-Mortem Checklist (Run After Phase 4 Merges)

When all four phases are on `main`, complete the following post-mortem:

#### Code Quality

- [ ] Run `pnpm test:coverage` and confirm all coverage thresholds pass (lines ≥ 60%, functions ≥ 60%, branches ≥ 55%, statements ≥ 60%)
- [ ] Run `pnpm ci:check` locally — zero warnings, zero errors
- [ ] Run `pnpm typecheck` locally — zero errors
- [ ] Run `pnpm build` — build succeeds, no TypeScript errors during the Vite SSR build

#### Architecture

- [ ] No file outside a pod imports from inside another pod's internals (only barrel files)
- [ ] No Three.js or browser-only imports are reachable from the server entry point
- [ ] All `*.client.component.tsx` files are wrapped in `React.lazy` + `Suspense` at their usage sites
- [ ] All Tone.js nodes have corresponding `.dispose()` calls

#### Git History

- [ ] `git log --oneline main` shows a clean, readable linear history with one merge commit per phase
- [ ] No `[ci-stub]` commits present on `main`
- [ ] Semantic-release tags exist: `v1.1.0`, `v1.2.0`, `v1.3.0`, `v1.4.0` (or equivalent)
- [ ] `CHANGELOG.md` contains entries for all four phases

#### CI/CD

- [ ] All six workflows are healthy on `main`: `ci.yml`, `release.yml`, `bundle-size.yml`, `lighthouse.yml` (manual only), `claude-review.yml` (on-demand), `stale.yml`
- [ ] No workflow has `continue-on-error: true` left over from a Phase 3 stub

#### Branch Protection

- [ ] `main` branch protection is active with: required CI Quality Gate, required Claude approval (1 review), stale review dismissal on push, up-to-date branch required

---

## 9. Branch Cleanup

After all four phases are merged and post-mortem is complete:

### Delete After Each Phase Merges

| Branch | When to delete |
|--------|---------------|
| `feat/phase-1` | After Phase 1 PR merges |
| `feat/phase-2` | After Phase 2 PR merges |
| `refactor/phase-3` | After Phase 3 PR merges |
| `feat/phase-3-01-foundation` | After Phase 3 PR merges |
| `feat/phase-3-02-experience` | After Phase 3 PR merges |
| `feat/phase-3-03-galaxy` | After Phase 3 PR merges |
| `feat/phase-3-04-city` | After Phase 3 PR merges |
| `feat/phase-3-05-overlays` | After Phase 3 PR merges |
| `feat/phase-3-06-audio` | After Phase 3 PR merges |
| `feat/phase-3-07-integration` | After Phase 3 PR merges |
| `feat/phase-4` (original) | After Phase 4 PR merges (`feat/phase-4-clean` supersedes it) |
| `feat/phase-4-clean` | After Phase 4 PR merges |

### Delete All At End

```bash
# After Phase 4 merges — bulk remote cleanup
git push origin --delete \
  feat/phase-1 feat/phase-2 refactor/phase-3 \
  feat/phase-3-01-foundation feat/phase-3-02-experience \
  feat/phase-3-03-galaxy feat/phase-3-04-city \
  feat/phase-3-05-overlays feat/phase-3-06-audio \
  feat/phase-3-07-integration \
  feat/phase-4 feat/phase-4-clean

# Clean up local tracking branches
git fetch --prune
```

### Retain for Reference

| Branch | Reason |
|--------|--------|
| `main` | Primary branch — never deleted |
| Dependabot branches | Managed by Dependabot automatically |

---

## 10. Decisions Log

| Decision | Rationale | Decided by |
|----------|-----------|------------|
| Rebase (not merge commit or squash) for feature branches | Produces clean linear history; eliminates diverged graph noise; each phase's commits are clearly sequential on `main` | Hari Houdini |
| Merge commit (not squash) for PRs into `main` | Preserves full per-phase commit history; each phase is revertable as a discrete merge; no information lost | Hari Houdini |
| One PR for all of Phase 3 (using `refactor/phase-3` as tip) | 7 sub-branches form a linear chain; `refactor/phase-3` is already their superset; reviewing 7 separate PRs adds overhead with no architectural benefit | Hari Houdini |
| `refactor/phase-3` as Phase 3 tip (not `feat/phase-3-07-integration`) | `refactor/phase-3` includes naming convention refactors and warp tunnel replacement that are part of the Phase 3 deliverable, not Phase 4 | Hari Houdini |
| Cherry-pick for Phase 4 (not rebase) | `feat/phase-4` contains 5 CI commits already on `main` via a different path; interactive rebase (`-i`) is unsupported in this tooling; cherry-pick is the cleanest way to include only the 10 unique commits | Hari Houdini |
| Claude review as technical hard gate (formal GitHub approval) | Process-only enforcement relies on discipline; a technical gate (`gh pr review --approve/--request-changes`) is enforced by branch protection and cannot be accidentally bypassed | Hari Houdini |
| Per-phase customised Claude review prompts | Each phase has a different dominant technical concern; a generic prompt would under-scrutinise the most important aspects of each phase | Hari Houdini |
| Auto-detect phase from PR head branch name | Reduces manual overhead; branch names are already semantically meaningful; eliminates risk of specifying the wrong phase focus in a comment | Hari Houdini |
| Phase 2 revert (by AI) was unauthorised | The AI merged `feat/phase-2` to `main` and then reverted it without authorisation. This plan explicitly ensures nothing touches `main` without the owner's manual PR approval. | Hari Houdini |

---

*End of MERGE-PLAN-001*
