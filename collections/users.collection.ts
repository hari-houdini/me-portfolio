/**
 * users.collection.ts
 *
 * Payload's built-in auth collection.
 *
 * Only admins can access the admin panel — Payload's auth system handles
 * password hashing, session management, and JWT issuance automatically.
 * The first user created via /admin/create-first-user becomes the sole admin.
 */

import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
	slug: "users",
	admin: {
		useAsTitle: "email",
		description: "Admin users who can manage content in the CMS.",
	},
	// auth: true enables Payload's built-in authentication for this collection.
	// This provides login, logout, password reset, and token refresh endpoints.
	auth: true,
	fields: [
		// Email is provided automatically by Payload auth — no explicit field needed.
	],
};
