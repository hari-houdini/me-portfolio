/**
 * workers/app.ts
 *
 * Cloudflare Workers entry point.
 *
 * Flow:
 *  1. `pnpm build`   — React Router v7 compiles the server bundle to build/server/index.js
 *  2. `pnpm deploy`  — wrangler bundles this file (+ the built server module) and deploys
 *
 * Hono sits in front of the React Router request handler to provide:
 *  - Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
 *  - CORS policy for any future public API routes
 *  - An extensible middleware surface for Phase 5+ concerns
 *
 * NOTE: The createRequestHandler from @react-router/cloudflare wraps the built
 * server module and expects a Cloudflare Pages EventContext. We construct that
 * context manually from Hono's ExecutionContext + Env bindings.
 * Cloudflare Worker compatibility will be validated end-to-end in Phase 5.
 */

/// <reference types="@cloudflare/workers-types" />

import { createRequestHandler } from "@react-router/cloudflare";
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";

// Fetcher is a Cloudflare Workers global type provided by @cloudflare/workers-types.
// It is available at runtime in the Workers environment; the type is referenced
// here to satisfy the TypeScript compiler.
type Fetcher = import("@cloudflare/workers-types").Fetcher;

export interface CloudflareEnv {
	PAYLOAD_API_URL: string;
	ASSETS: Fetcher;
}

// The build is resolved by wrangler at bundle time, not at TypeScript compile
// time. The path points to the output of `pnpm build` (react-router build).
// @ts-expect-error — resolved at wrangler bundle time, not tsc compile time
import * as build from "../build/server/index.js";

const app = new Hono<{ Bindings: CloudflareEnv }>();

app.use("*", secureHeaders());

const handleRequest = createRequestHandler({ build });

app.all("*", (c) => {
	// Adapt Hono's Cloudflare Workers context to the EventContext shape expected
	// by @react-router/cloudflare's createRequestHandler. The Workers and Pages
	// Request generics differ only in CF-property typing; at runtime they are
	// identical objects. This adapter is intentionally loosely typed — it will be
	// validated end-to-end in Phase 5 (deploy).
	const ctx = {
		request: c.req.raw as unknown as Request,
		functionPath: "",
		waitUntil: (p: Promise<unknown>) => c.executionCtx.waitUntil(p),
		passThroughOnException: () => c.executionCtx.passThroughOnException(),
		next: () => Promise.resolve(new Response("Not Found", { status: 404 })),
		env: c.env as unknown as CloudflareEnv & { ASSETS: Fetcher },
		params: {},
		data: {} as Record<string, unknown>,
	};
	// biome-ignore lint/suspicious/noExplicitAny: EventContext adapter shim — reconciled in Phase 5
	return handleRequest(ctx as any);
});

export default app;
