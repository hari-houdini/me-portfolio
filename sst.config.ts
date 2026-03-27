/// <reference path="./.sst/platform/config.d.ts" />

/**
 * sst.config.ts
 *
 * SST v3 Ion configuration — OpenNext + AWS Lambda@Edge + CloudFront.
 *
 * Resources provisioned:
 *  - S3 Bucket (MediaBucket) — stores Payload CMS media uploads
 *  - Secrets — DATABASE_URL, PAYLOAD_SECRET, NEXT_PUBLIC_SERVER_URL (managed via SST / Varlock)
 *  - Next.js app — deployed via OpenNext to Lambda@Edge + CloudFront (us-east-1)
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
			// Link grants the Lambda function read access to these resources
			link: [mediaBucket, dbUrl, payloadSecret, serverUrl],
			environment: {
				S3_BUCKET: mediaBucket.name,
				S3_REGION: "us-east-1",
				DATABASE_URL: dbUrl.value,
				PAYLOAD_SECRET: payloadSecret.value,
				NEXT_PUBLIC_SERVER_URL: serverUrl.value,
			},
		});
	},
});
