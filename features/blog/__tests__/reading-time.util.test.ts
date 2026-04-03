/**
 * reading-time.util.test.ts
 *
 * Unit tests for the reading time utilities.
 * No DOM, no React — pure function tests.
 */

import { describe, expect, it } from "vitest";
import {
	calculateReadingTime,
	extractTextFromLexical,
	formatReadingTime,
} from "../reading-time.util";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal Lexical AST with a single paragraph of the given text. */
function makeLexical(text: string) {
	return {
		root: {
			type: "root" as const,
			direction: "ltr" as const,
			format: "left" as const,
			indent: 0,
			version: 1,
			children: [
				{
					type: "paragraph",
					version: 1,
					children: [{ type: "text", text, version: 1 }],
				},
			],
		},
	};
}

/** Generates a string of N words ("word1 word2 …"). */
function words(n: number): string {
	return Array.from({ length: n }, (_, i) => `word${i + 1}`).join(" ");
}

// ---------------------------------------------------------------------------
// extractTextFromLexical
// ---------------------------------------------------------------------------

describe("extractTextFromLexical", () => {
	it("extracts text from a single paragraph node", () => {
		const node = {
			type: "paragraph",
			children: [{ type: "text", text: "Hello world" }],
		};
		const result = extractTextFromLexical(node);
		expect(result).toContain("Hello world");
	});

	it("extracts text from deeply nested nodes", () => {
		const node = {
			type: "root",
			children: [
				{
					type: "paragraph",
					children: [
						{
							type: "link",
							children: [{ type: "text", text: "Click here" }],
						},
					],
				},
			],
		};
		const result = extractTextFromLexical(node);
		expect(result).toContain("Click here");
	});

	it("returns empty string for a node with no text or children", () => {
		const node = { type: "horizontalrule" };
		const result = extractTextFromLexical(node);
		expect(result.trim()).toBe("");
	});

	it("concatenates text from multiple sibling nodes", () => {
		const node = {
			type: "root",
			children: [
				{ type: "text", text: "First" },
				{ type: "text", text: "Second" },
			],
		};
		const result = extractTextFromLexical(node);
		expect(result).toContain("First");
		expect(result).toContain("Second");
	});
});

// ---------------------------------------------------------------------------
// calculateReadingTime
// ---------------------------------------------------------------------------

describe("calculateReadingTime", () => {
	it("returns 1 minute for an empty document", () => {
		const body = makeLexical("");
		expect(calculateReadingTime(body)).toBe(1);
	});

	it("returns 1 minute for a very short post (< 200 words)", () => {
		const body = makeLexical(words(50));
		expect(calculateReadingTime(body)).toBe(1);
	});

	it("returns 1 minute for exactly 200 words", () => {
		const body = makeLexical(words(200));
		expect(calculateReadingTime(body)).toBe(1);
	});

	it("returns 2 minutes for 201 words", () => {
		const body = makeLexical(words(201));
		expect(calculateReadingTime(body)).toBe(2);
	});

	it("returns 5 minutes for 1000 words", () => {
		const body = makeLexical(words(1000));
		expect(calculateReadingTime(body)).toBe(5);
	});

	it("rounds up fractional minutes (e.g. 400 words → 2 min, 401 → 3 min)", () => {
		expect(calculateReadingTime(makeLexical(words(400)))).toBe(2);
		expect(calculateReadingTime(makeLexical(words(401)))).toBe(3);
	});

	it("never returns less than 1 minute", () => {
		const body = makeLexical("");
		expect(calculateReadingTime(body)).toBeGreaterThanOrEqual(1);
	});
});

// ---------------------------------------------------------------------------
// formatReadingTime
// ---------------------------------------------------------------------------

describe("formatReadingTime", () => {
	it("formats 1 minute as '1 min read'", () => {
		expect(formatReadingTime(1)).toBe("1 min read");
	});

	it("formats 5 minutes as '5 min read'", () => {
		expect(formatReadingTime(5)).toBe("5 min read");
	});
});
