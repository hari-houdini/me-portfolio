/// <reference path="./.sst/platform/config.d.ts" />

/**
 * sst.config.ts
 *
 * SST v4 (OpenNext) — AWS Lambda@Edge + CloudFront + S3.
 *
 * Resources provisioned:
 *  - sst.aws.Bucket  (MediaBucket) — Payload CMS media uploads
 *  - sst.Secret      (DatabaseUrl) — Supabase PostgreSQL connection string
 *  - sst.Secret      (PayloadSecret) — Payload JWT signing secret
 *  - sst.Secret      (ServerUrl) — public server URL (CloudFront domain)
 *  - sst.aws.Nextjs  (Portfolio) — Next.js app via OpenNext
 *
 * Resource access pattern (SST v4):
 *  - `link` grants Lambda IAM access and makes resources available via
 *    `import { Resource } from "sst"` in server-side code.
 *  - App code uses: `process.env.VAR ?? Resource.Name.value`
 *    → local dev: process.env wins (from .env.local), Resource never evaluated
 *    → Lambda:    process.env is unset, Resource.* provides the value
 *  - NEXT_PUBLIC_* vars must stay in `environment` (exposed to the browser).
 *
 * Secrets workflow:
 *  - Set once:  pnpm sst secret set DatabaseUrl "postgresql://..."
 *  - Dev:       varlock pull --env development > .env.local
 *  - Deploy:    pnpm deploy  (Varlock injects secrets via deploy.yml)
 *
 * Cost: within AWS free tier for a personal portfolio at moderate traffic.
 */

export default $config({
	app(input) {
		return {
			name: "me-portfolio",
			// Retain resources in production on removal to prevent data loss.
			// Non-production stages (preview, dev) are fully destroyed on removal.
			removal: input?.stage === "production" ? "retain" : "remove",
			home: "aws",
			providers: {
				aws: { region: "us-east-1" },
			},
		};
	},

	async run() {
		// S3 bucket for Payload CMS media uploads
		const mediaBucket = new sst.aws.Bucket("MediaBucket");

		// Secrets — set via: pnpm sst secret set <Name> "<value>"
		const dbUrl = new sst.Secret("DatabaseUrl");
		const payloadSecret = new sst.Secret("PayloadSecret");
		const serverUrl = new sst.Secret("ServerUrl");

		new sst.aws.Nextjs("Portfolio", {
			// `link` grants Lambda IAM access to each resource and makes them
			// available via `import { Resource } from "sst"` in server code.
			// See sst-env.d.ts for TypeScript types. See payload.config.ts for usage.
			link: [mediaBucket, dbUrl, payloadSecret, serverUrl],
			environment: {
				// Static values and NEXT_PUBLIC_* vars that cannot use Resource.*:
				// NEXT_PUBLIC_* must be process.env (exposed to browser by Next.js).
				// S3_REGION is a static string — not a linked resource.
				NEXT_PUBLIC_SERVER_URL: serverUrl.value,
				S3_REGION: "us-east-1",
			},
		});
	},
});
