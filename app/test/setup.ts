/**
 * setup.ts
 *
 * Vitest global setup file — runs once before the test suite.
 *
 * Responsibilities:
 *  1. Start the MSW Node intercept server before all tests
 *  2. Reset per-test handler overrides after each test so they don't leak
 *  3. Stop the MSW server after all tests complete
 *
 * Any unhandled request (i.e. a URL with no matching handler) causes the test
 * to throw with `onUnhandledRequest: "error"`. This prevents silent passes
 * caused by un-intercepted network calls falling through to the real network.
 */

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./msw/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
	// Remove any per-test handler overrides added via server.use(...)
	server.resetHandlers();
	// Unmount any React trees rendered during the test
	cleanup();
});

afterAll(() => server.close());
