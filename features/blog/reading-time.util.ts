/**
 * reading-time.util.ts
 *
 * Calculates estimated reading time from a Lexical rich-text AST.
 * Average reading speed: 200 words per minute.
 * Minimum: 1 minute.
 */

import type { z } from "zod";
import type { LexicalContentSchema } from "../cms/cms.schema";

type LexicalContent = z.infer<typeof LexicalContentSchema>;

/**
 * Recursively extracts all plain text from a Lexical node tree.
 * Works on the serialised AST returned by Payload Local API.
 */
export function extractTextFromLexical(node: Record<string, unknown>): string {
	const parts: string[] = [];

	// Text nodes have a `text` property
	if (typeof node.text === "string") {
		parts.push(node.text);
	}

	// Recurse into children
	const children = node.children;
	if (Array.isArray(children)) {
		for (const child of children) {
			if (child !== null && typeof child === "object") {
				parts.push(extractTextFromLexical(child as Record<string, unknown>));
			}
		}
	}

	return parts.join(" ");
}

/**
 * Returns the estimated reading time in minutes for a Lexical document.
 * Minimum 1 minute even for very short posts.
 */
export function calculateReadingTime(body: LexicalContent): number {
	const text = extractTextFromLexical(
		body.root as unknown as Record<string, unknown>,
	);
	const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Formats a reading time number as a human-readable string.
 * e.g. 5 → "5 min read"
 */
export function formatReadingTime(minutes: number): string {
	return `${minutes} min read`;
}
