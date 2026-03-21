/**
 * server.ts
 *
 * MSW Node.js intercept server used by the Vitest test suite.
 *
 * The server is started once before all tests (beforeAll), reset after each
 * test to remove per-test overrides (afterEach), and closed after all tests
 * (afterAll). This lifecycle is managed in app/test/setup.ts.
 *
 * Individual tests can add temporary overrides with:
 *   server.use(http.get(...))
 * These overrides are automatically removed after the test by resetHandlers().
 */

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
