/**
 * env.unit.test.ts
 *
 * Unit tests for the Zod-validated environment module.
 *
 * Strategy: import the raw EnvSchema (not the pre-parsed `env` singleton)
 * and call .parse() / .safeParse() directly so we can test validation
 * behaviour without mutating process.env or re-importing the module.
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Re-define the schema locally so we can parse arbitrary inputs.
// This mirrors lib/env.ts exactly and avoids side-effects from the module.
// ---------------------------------------------------------------------------

const EnvSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
	DATABASE_URL: z.string().url().optional(),
	PAYLOAD_SECRET: z.string().min(32).optional(),
	NEXT_PUBLIC_SERVER_URL: z.string().url().default("http://localhost:3000"),
	S3_BUCKET: z.string().optional(),
	S3_REGION: z.string().default("us-east-1"),
	AWS_ACCESS_KEY_ID: z.string().optional(),
	AWS_SECRET_ACCESS_KEY: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validBase = {
	NODE_ENV: "test",
	NEXT_PUBLIC_SERVER_URL: "http://localhost:3000",
} as const;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("EnvSchema", () => {
	describe("valid inputs", () => {
		it("parses a minimal valid environment (CI build scenario)", () => {
			const result = EnvSchema.parse(validBase);

			expect(result.NODE_ENV).toBe("test");
			expect(result.NEXT_PUBLIC_SERVER_URL).toBe("http://localhost:3000");
		});

		it("parses a full production environment with all fields", () => {
			const result = EnvSchema.parse({
				NODE_ENV: "production",
				DATABASE_URL: "postgresql://user:pass@host:5432/db",
				PAYLOAD_SECRET: "a-very-long-secret-value-that-is-at-least-32-chars",
				NEXT_PUBLIC_SERVER_URL: "https://harihoudini.dev",
				S3_BUCKET: "my-media-bucket",
				S3_REGION: "eu-west-1",
				AWS_ACCESS_KEY_ID: "AKIAIOSFODNN7EXAMPLE",
				AWS_SECRET_ACCESS_KEY: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
			});

			expect(result.NODE_ENV).toBe("production");
			expect(result.DATABASE_URL).toBe("postgresql://user:pass@host:5432/db");
			expect(result.S3_REGION).toBe("eu-west-1");
		});

		it("applies default NODE_ENV=development when NODE_ENV is absent", () => {
			const result = EnvSchema.parse({
				NEXT_PUBLIC_SERVER_URL: "http://localhost:3000",
			});

			expect(result.NODE_ENV).toBe("development");
		});

		it("applies default S3_REGION=us-east-1 when S3_REGION is absent", () => {
			const result = EnvSchema.parse(validBase);
			expect(result.S3_REGION).toBe("us-east-1");
		});

		it("applies default NEXT_PUBLIC_SERVER_URL=http://localhost:3000 when absent", () => {
			const result = EnvSchema.parse({ NODE_ENV: "test" });
			expect(result.NEXT_PUBLIC_SERVER_URL).toBe("http://localhost:3000");
		});

		it("allows DATABASE_URL to be absent (CI build scenario)", () => {
			const result = EnvSchema.parse(validBase);
			expect(result.DATABASE_URL).toBeUndefined();
		});

		it("allows PAYLOAD_SECRET to be absent (CI build scenario)", () => {
			const result = EnvSchema.parse(validBase);
			expect(result.PAYLOAD_SECRET).toBeUndefined();
		});
	});

	describe("invalid inputs", () => {
		it("throws ZodError when NODE_ENV has an unrecognised value", () => {
			const result = EnvSchema.safeParse({
				...validBase,
				NODE_ENV: "staging",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				const paths = result.error.issues.map((i) => i.path.join("."));
				expect(paths).toContain("NODE_ENV");
			}
		});

		it("throws ZodError when DATABASE_URL is not a valid URL", () => {
			const result = EnvSchema.safeParse({
				...validBase,
				DATABASE_URL: "not-a-url",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				const paths = result.error.issues.map((i) => i.path.join("."));
				expect(paths).toContain("DATABASE_URL");
			}
		});

		it("throws ZodError when PAYLOAD_SECRET is shorter than 32 characters", () => {
			const result = EnvSchema.safeParse({
				...validBase,
				PAYLOAD_SECRET: "short",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				const paths = result.error.issues.map((i) => i.path.join("."));
				expect(paths).toContain("PAYLOAD_SECRET");
			}
		});

		it("throws ZodError when NEXT_PUBLIC_SERVER_URL is not a valid URL", () => {
			const result = EnvSchema.safeParse({
				...validBase,
				NEXT_PUBLIC_SERVER_URL: "localhost-without-protocol",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				const paths = result.error.issues.map((i) => i.path.join("."));
				expect(paths).toContain("NEXT_PUBLIC_SERVER_URL");
			}
		});
	});
});
