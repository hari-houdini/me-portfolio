// @vitest-environment jsdom
/**
 * blog-list.component.test.tsx
 *
 * Component tests for BlogList.
 *
 * Strategy: pass typed BlogListData fixtures, assert on accessible output.
 * PostCard internals are not tested here — only the list-level behaviour.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BlogListData } from "../../cms/cms.schema";
import {
	mockPost,
	mockPost2,
	mockTag,
	mockTag2,
} from "../../test/fixtures/cms.fixtures";
import { BlogList } from "../blog-list.component";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("next/image", () => ({
	default: ({ src, alt }: { src: string; alt: string }) => (
		// biome-ignore lint/performance/noImgElement: test stub — next/image optimisation not available in jsdom
		<img src={src} alt={alt} />
	),
}));

vi.mock("../post-card.module.css", () => ({ default: {} }));
vi.mock("../blog-list.module.css", () => ({ default: {} }));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeData(overrides: Partial<BlogListData> = {}): BlogListData {
	return {
		posts: [mockPost, mockPost2],
		totalDocs: 2,
		totalPages: 1,
		page: 1,
		hasPrevPage: false,
		hasNextPage: false,
		tags: [mockTag, mockTag2],
		...overrides,
	};
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BlogList", () => {
	describe("post rendering", () => {
		it("renders all posts in the list", () => {
			render(<BlogList data={makeData()} />);
			// Count articles (one per post card) rather than list items, which may
			// include nested tag <li> elements inside each PostCard.
			const articles = screen.getAllByRole("article");
			expect(articles).toHaveLength(2);
		});

		it("renders each post's title", () => {
			render(<BlogList data={makeData()} />);
			expect(screen.getByText(/building a galaxy/i)).toBeInTheDocument();
			expect(
				screen.getByText(/effect-ts in a next\.js app/i),
			).toBeInTheDocument();
		});
	});

	describe("empty state", () => {
		it("renders an empty state message when no posts are found", () => {
			render(<BlogList data={makeData({ posts: [], totalDocs: 0 })} />);
			expect(screen.getByText(/no posts found/i)).toBeInTheDocument();
		});

		it("renders a 'Clear filters' link in the empty state when a filter is active", () => {
			render(
				<BlogList
					data={makeData({ posts: [], totalDocs: 0 })}
					search="nonexistent"
				/>,
			);
			const link = screen.getByRole("link", { name: /clear filters/i });
			expect(link).toHaveAttribute("href", "/blog");
		});

		it("does not render a 'Clear filters' link when no filter is active", () => {
			render(<BlogList data={makeData({ posts: [], totalDocs: 0 })} />);
			expect(
				screen.queryByRole("link", { name: /clear filters/i }),
			).not.toBeInTheDocument();
		});
	});

	describe("result count announcement", () => {
		it("announces the result count with aria-live for screen readers", () => {
			render(<BlogList data={makeData()} />);
			const status = screen.getByRole("status");
			expect(status).toHaveAttribute("aria-live", "polite");
			expect(status).toHaveTextContent("2 posts found");
		});

		it("uses singular 'post' when exactly 1 result", () => {
			render(<BlogList data={makeData({ posts: [mockPost], totalDocs: 1 })} />);
			const status = screen.getByRole("status");
			expect(status).toHaveTextContent("1 post found");
		});
	});

	describe("pagination", () => {
		it("does not render pagination when there is only 1 page", () => {
			render(<BlogList data={makeData({ totalPages: 1 })} />);
			expect(
				screen.queryByRole("navigation", { name: /blog pagination/i }),
			).not.toBeInTheDocument();
		});

		it("renders pagination navigation when totalPages > 1", () => {
			render(
				<BlogList
					data={makeData({
						totalPages: 3,
						page: 2,
						hasPrevPage: true,
						hasNextPage: true,
					})}
				/>,
			);
			expect(
				screen.getByRole("navigation", { name: /blog pagination/i }),
			).toBeInTheDocument();
		});

		it("renders a previous page link when hasPrevPage is true", () => {
			render(
				<BlogList
					data={makeData({
						totalPages: 3,
						page: 2,
						hasPrevPage: true,
						hasNextPage: true,
					})}
				/>,
			);
			const prevLink = screen.getByRole("link", { name: /previous page/i });
			expect(prevLink).toHaveAttribute("rel", "prev");
		});

		it("renders a next page link when hasNextPage is true", () => {
			render(
				<BlogList
					data={makeData({
						totalPages: 3,
						page: 2,
						hasPrevPage: true,
						hasNextPage: true,
					})}
				/>,
			);
			const nextLink = screen.getByRole("link", { name: /next page/i });
			expect(nextLink).toHaveAttribute("rel", "next");
		});

		it("marks the current page with aria-current='page'", () => {
			render(
				<BlogList
					data={makeData({
						totalPages: 3,
						page: 2,
						hasPrevPage: true,
						hasNextPage: true,
					})}
				/>,
			);
			const current = screen.getByText("2");
			expect(current).toHaveAttribute("aria-current", "page");
		});
	});
});
