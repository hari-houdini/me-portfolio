/**
 * sst-env.d.ts
 *
 * SST v4 Resource type augmentation.
 *
 * SST generates equivalent types in .sst/types.d.ts (excluded from tsconfig).
 * This file provides the same declarations so TypeScript understands `Resource.*`
 * in app code without requiring SST to have run first.
 *
 * The top-level `import "sst"` makes this file a module, enabling proper
 * module augmentation (merge with package exports) rather than replacement.
 *
 * Keep in sync with the resources declared in sst.config.ts.
 */

import "sst";

declare module "sst" {
	export interface Resource {
		/** S3 bucket for Payload CMS media uploads */
		MediaBucket: {
			name: string;
		};
		/** Supabase PostgreSQL connection string (with ?pgBouncer=true for Lambda) */
		DatabaseUrl: {
			value: string;
		};
		/** Payload CMS JWT signing secret */
		PayloadSecret: {
			value: string;
		};
		/** Public server URL (CloudFront domain in production) */
		ServerUrl: {
			value: string;
		};
	}
}
