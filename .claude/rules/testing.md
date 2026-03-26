---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "app/test/**"
---

# Testing Patterns

## Vitest
- Constructor mocks use `function(this: any) { this.x = ... }` — **never arrow functions**
  (esbuild transpiles `function() { return obj }` → `() => obj`, which breaks `new MyClass()`)
- Use `vi.mock('module', () => ({ default: ... }))` for module-level mocks
- Use `vi.fn()` for function mocks — never manually stub with plain objects unless testing the stub shape

## Testing Library
- Query elements by accessible role/label only: `getByRole`, `getByLabelText`, `getByText`
- **Never** query by CSS class (`querySelector('.foo')`) or React component display name
- Prefer `userEvent` over `fireEvent` for interaction tests

## MSW
- Every HTTP endpoint the repository calls must have a handler in `app/test/msw/handlers.ts`
- Handlers must use the exact Payload REST API URL patterns from PRD-001 §4.6
- Use `http.get`, `http.post` etc. — never the deprecated `rest.*` API

## Coverage thresholds (vitest.config.ts)
- lines ≥ 60%, functions ≥ 60%, branches ≥ 55%, statements ≥ 60%
- Do not lower these thresholds. Do not add files to `exclude` to game coverage.

## File naming
- Unit tests: `<name>.unit.test.ts` — Vitest node environment (default)
- Component tests: `<name>.component.test.tsx` — must include `// @vitest-environment jsdom` at top
