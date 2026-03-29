/**
 * msw/server.ts
 *
 * MSW server for Vitest (Node.js environment).
 *
 * The primary test strategy for the CMS layer is vi.mock('payload'), so MSW
 * handlers are kept for future REST endpoint testing (Phase 3+) or any
 * third-party HTTP calls that cannot be mocked at module level.
 */

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
