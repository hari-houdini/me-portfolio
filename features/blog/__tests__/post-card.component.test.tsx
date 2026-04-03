// @vitest-environment jsdom
/**
 * post-card.component.test.tsx
 *
 * Component tests for PostCard.
 *
 * Strategy: render with typed fixtures, assert on accessible output.
 * Images are mocked (next/image renders a plain <img> in test).
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PostData } from "../../cms/cms.schema";
import { mockPost, mockTag } from "../../test/fixtures/cms.fixtures";
import { PostCard } from "../post-card.component";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// next/image renders as a plain <img> in jsdom
vi.mock("next/image", () => ({
	default: ({
		src,
		alt,
		...rest
	}: {
		src: string;
		alt: string;
		[k: string]: unknown;
	}) => (
		// biome-ignore lint/performance/noImgElement: test stub — next/image optimisation not available in jsdom
		<img src={src} alt={alt} {...rest} />
	),
}));

// CSS Modules return empty objects in jsdom
vi.mock("../post-card.module.css", () => ({ default: {} }));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePost(overrides: Partial<PostData> = {}): PostData {
	return { ...mockPost, ...overrides };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PostCard", () => {
	it("renders the post title as a link to the post slug", () => {
		render(<PostCard post={makePost()} />);
		const link = screen.getByRole("link", { name: /building a galaxy/i });
		expect(link).toHaveAttribute(
			"href",
			"/blog/building-a-galaxy-with-three-js",
		);
	});

	it("renders the formatted published date", () => {
		render(<PostCard post={makePost()} />);
		// "2026-02-01" → "1 Feb 2026" in en-GB locale
		expect(screen.getByText(/feb 2026/i)).toBeInTheDocument();
	});

	it("renders the reading time", () => {
		render(<PostCard post={makePost()} />);
		// The body has ~40 words → 1 min read
		expect(screen.getByText(/min read/i)).toBeInTheDocument();
	});

	it("renders expanded tag labels as links to tag archive pages", () => {
		render(<PostCard post={makePost({ tags: [mockTag] })} />);
		// Use the tag list scope to avoid matching the title link which also contains "Three.js"
		const tagList = screen.getByRole("list", { name: /post tags/i });
		const tagLink = tagList.querySelector('a[href="/blog/tag/three-js"]');
		expect(tagLink).not.toBeNull();
		expect(tagLink).toHaveAttribute("href", "/blog/tag/three-js");
	});

	it("does not render a tag list when tags is empty", () => {
		render(<PostCard post={makePost({ tags: [] })} />);
		expect(
			screen.queryByRole("list", { name: /post tags/i }),
		).not.toBeInTheDocument();
	});

	it("renders the excerpt in full (non-compact) mode", () => {
		const excerpt = "A deep dive into procedural generation.";
		render(<PostCard post={makePost({ excerpt })} />);
		expect(screen.getByText(excerpt)).toBeInTheDocument();
	});

	it("does not render the excerpt in compact mode", () => {
		const excerpt = "A deep dive into procedural generation.";
		render(<PostCard post={makePost({ excerpt })} compact />);
		expect(screen.queryByText(excerpt)).not.toBeInTheDocument();
	});

	it("does not render an <img> when coverImage is null (non-compact mode)", () => {
		render(<PostCard post={makePost({ coverImage: null })} />);
		expect(screen.queryByRole("img")).not.toBeInTheDocument();
	});

	it("renders a cover image when coverImage is an object with a url (non-compact mode)", () => {
		const coverImage = {
			id: 10,
			url: "https://example.com/cover.jpg",
			alt: "Cover image",
			width: 800,
			height: 450,
			filename: "cover.jpg",
			mimeType: "image/jpeg",
			filesize: 12345,
			updatedAt: "2026-01-01T00:00:00.000Z",
			createdAt: "2026-01-01T00:00:00.000Z",
		};
		render(<PostCard post={makePost({ coverImage })} />);
		const img = screen.getByRole("img");
		expect(img).toHaveAttribute("src", "https://example.com/cover.jpg");
	});

	it("does not render a cover image in compact mode even when coverImage is present", () => {
		const coverImage = {
			id: 10,
			url: "https://example.com/cover.jpg",
			alt: "Cover image",
			width: 800,
			height: 450,
			filename: "cover.jpg",
			mimeType: "image/jpeg",
			filesize: 12345,
			updatedAt: "2026-01-01T00:00:00.000Z",
			createdAt: "2026-01-01T00:00:00.000Z",
		};
		render(<PostCard post={makePost({ coverImage })} compact />);
		expect(screen.queryByRole("img")).not.toBeInTheDocument();
	});

	it("does not render a date when publishedAt is null", () => {
		render(<PostCard post={makePost({ publishedAt: null })} />);
		expect(screen.queryByRole("time")).not.toBeInTheDocument();
	});

	it("renders an article landmark with an accessible label", () => {
		render(<PostCard post={makePost()} />);
		expect(
			screen.getByRole("article", { name: /building a galaxy/i }),
		).toBeInTheDocument();
	});
});
