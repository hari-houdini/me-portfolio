/**
 * app/(payload)/api/[...slug]/route.ts
 *
 * Payload REST API + GraphQL catch-all route handler.
 *
 * REST_GET / REST_POST / etc. are curried: they take the config first and
 * return a Next.js route handler. This file is provided by the Payload
 * Next.js integration template and should not be modified.
 *
 * Endpoints exposed:
 *  GET    /api/globals/{slug}              — fetch a global
 *  PATCH  /api/globals/{slug}              — update a global (auth required)
 *  GET    /api/{collection}                — list collection documents
 *  GET    /api/{collection}/{id}           — fetch a single document
 *  POST   /api/{collection}                — create (auth required)
 *  PATCH  /api/{collection}/{id}           — update (auth required)
 *  DELETE /api/{collection}/{id}           — delete (auth required)
 *  POST   /api/{users-slug}/login          — authenticate
 *  POST   /api/{users-slug}/logout         — sign out
 *  POST   /api/{users-slug}/refresh-token  — refresh JWT
 */

import configPromise from "@payload-config";
import {
	REST_DELETE,
	REST_GET,
	REST_OPTIONS,
	REST_PATCH,
	REST_POST,
	REST_PUT,
} from "@payloadcms/next/routes";

export const GET = REST_GET(configPromise);
export const POST = REST_POST(configPromise);
export const PUT = REST_PUT(configPromise);
export const PATCH = REST_PATCH(configPromise);
export const DELETE = REST_DELETE(configPromise);
export const OPTIONS = REST_OPTIONS(configPromise);
