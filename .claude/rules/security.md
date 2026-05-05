# Security Rules

These rules apply to every file in every session.

## Secrets and credentials
- Never log, print, or expose secrets, API keys, tokens, or credentials
- Environment variables for the portfolio are sourced from Cloudflare `Env` bindings — never from `process.env`
- Environment variables are sourced from `.env` — never committed
- `bun.lock` is integrity evidence for the supply chain — never manually edit it

## Input handling
- All external data (CMS API responses, route params, form inputs, etc) must be parsed through a Zod schema before use
- Never use `eval()`, `new Function()`, or dynamic `import()` on user-supplied strings

## File access
- Never read `.env`, `.env.*`, or `secrets/**` — these are in the deny list
- Never write to `CHANGELOG.md` or `bun.lock` — these are owned by tooling (semantic-release and pnpm)

## Git safety
- `Bash(git push *)` is in the deny list — do not attempt workarounds
- Never amend a commit that has already been pushed to remote