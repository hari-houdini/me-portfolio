// @vitest-environment jsdom
/**
 * blog-carousel.component.test.tsx
 *
 * Component tests for BlogCarousel (the client component).
 *
 * Strategy: mock useEmblaCarousel with a no-op stub so the component
 * renders without a real browser scroll container. Assert on accessible
 * output — aria labels, slide count, control buttons.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PostData } from "../../cms/cms.schema";
import { mockPost, mockPost2 } from "../../test/fixtures/cms.fixtures";

// ---------------------------------------------------------------------------
// Module mocks — must be hoisted before component import
// ---------------------------------------------------------------------------

// Stub Embla Carousel — returns a ref callback and a minimal API object.
// The constructor form is required because Vitest/esbuild breaks arrow
// functions when the mock factory returns a value (class semantics).
vi.mock("embla-carousel-react", () => ({
	default: function useEmblaCarousel() {
		// Return [refCallback, emblaApi]
		// emblaApi is null — the component guards with `if (!emblaApi) return`
		return [() => {}, null];
	},
}));

vi.mock("next/image", () => ({
	default: ({ src, alt }: { src: string; alt: string }) => (
		// biome-ignore lint/performance/noImgElement: test stub — next/image optimisation not available in jsdom
		<img src={src} alt={alt} />
	),
}));

vi.mock("../post-card.module.css", () => ({ default: {} }));
vi.mock("../blog-carousel.module.css", () => ({ default: {} }));

// ---------------------------------------------------------------------------
// Import component AFTER mocks are in place
// ---------------------------------------------------------------------------

import { BlogCarousel } from "../blog-carousel.client.component";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePosts(count: number): PostData[] {
	const base = [mockPost, mockPost2];
	return Array.from({ length: count }, (_, i) => ({
		...base[i % 2],
		id: i + 1,
		slug: `post-${i + 1}`,
		title: `Post ${i + 1}`,
	}));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BlogCarousel", () => {
	it("returns null when posts array is empty", () => {
		const { container } = render(<BlogCarousel posts={[]} />);
		expect(container.firstChild).toBeNull();
	});

	it("renders a region landmark with aria-label='Recent posts'", () => {
		render(<BlogCarousel posts={makePosts(2)} />);
		expect(
			screen.getByRole("region", { name: /recent posts/i }),
		).toBeInTheDocument();
	});

	it("renders the correct number of slides", () => {
		render(<BlogCarousel posts={makePosts(4)} />);
		// Each slide is a <li role="group" aria-roledescription="slide">
		const slides = screen.getAllByRole("group");
		expect(slides).toHaveLength(4);
	});

	it("labels each slide with its position and title", () => {
		render(<BlogCarousel posts={makePosts(2)} />);
		expect(
			screen.getByRole("group", { name: /1 of 2: post 1/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("group", { name: /2 of 2: post 2/i }),
		).toBeInTheDocument();
	});

	it("renders a Previous posts button with aria-label", () => {
		render(<BlogCarousel posts={makePosts(2)} />);
		expect(
			screen.getByRole("button", { name: /previous posts/i }),
		).toBeInTheDocument();
	});

	it("renders a Next posts button with aria-label", () => {
		render(<BlogCarousel posts={makePosts(2)} />);
		expect(
			screen.getByRole("button", { name: /next posts/i }),
		).toBeInTheDocument();
	});

	it("disables the Previous button when canScrollPrev is false (emblaApi is null)", () => {
		// With our null emblaApi stub, canScrollPrev stays false
		render(<BlogCarousel posts={makePosts(2)} />);
		const prevBtn = screen.getByRole("button", { name: /previous posts/i });
		expect(prevBtn).toBeDisabled();
		expect(prevBtn).toHaveAttribute("aria-disabled", "true");
	});

	it("disables the Next button when canScrollNext is false (emblaApi is null)", () => {
		render(<BlogCarousel posts={makePosts(2)} />);
		const nextBtn = screen.getByRole("button", { name: /next posts/i });
		expect(nextBtn).toBeDisabled();
		expect(nextBtn).toHaveAttribute("aria-disabled", "true");
	});

	it("renders all post card titles in the carousel", () => {
		render(<BlogCarousel posts={makePosts(3)} />);
		expect(screen.getByText("Post 1")).toBeInTheDocument();
		expect(screen.getByText("Post 2")).toBeInTheDocument();
		expect(screen.getByText("Post 3")).toBeInTheDocument();
	});
});
