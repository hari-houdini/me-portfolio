/**
 * msw/handlers.ts
 *
 * MSW request handlers for tests.
 *
 * CMS repository tests use vi.mock('payload') directly — no HTTP to intercept.
 * Add handlers here for any third-party HTTP calls made in future phases.
 */

import { HttpResponse, http } from "msw";

export const handlers = [
	// Placeholder — add REST handlers here for Phase 3+ integrations.
	// Example:
	//   http.get('https://api.example.com/data', () => HttpResponse.json({ ok: true })),
];

// Re-export HttpResponse so test files can construct typed responses.
export { HttpResponse, http };
