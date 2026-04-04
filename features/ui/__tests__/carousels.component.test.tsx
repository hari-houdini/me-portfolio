// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { CardStack } from "../carousels/card-stack.client.component";
import { InfiniteScrollList } from "../carousels/infinite-scroll-list.client.component";
import { ParallaxScroll } from "../carousels/parallax-scroll.client.component";

beforeAll(() => {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation((query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});
});

describe("CardStack", () => {
	it("renders nothing for empty cards array", () => {
		const { container } = render(<CardStack cards={[]} />);
		expect(container.firstChild).toBeNull();
	});

	it("renders a section with accessible label", () => {
		render(
			<CardStack
				cards={[<span key="1">Card 1</span>, <span key="2">Card 2</span>]}
			/>,
		);
		expect(
			screen.getByRole("region", { name: "Card stack, 2 cards" }),
		).toBeInTheDocument();
	});

	it("renders top card with a Next card button", () => {
		render(
			<CardStack
				cards={[<span key="1">Card 1</span>, <span key="2">Card 2</span>]}
			/>,
		);
		expect(
			screen.getByRole("button", { name: "Next card" }),
		).toBeInTheDocument();
	});

	it("cycles to next card on click", async () => {
		render(
			<CardStack
				cards={[
					<span key="1">First card</span>,
					<span key="2">Second card</span>,
				]}
			/>,
		);
		await userEvent.click(screen.getByRole("button", { name: "Next card" }));
		// After clicking, second card is now on top — still has the button
		expect(
			screen.getByRole("button", { name: "Next card" }),
		).toBeInTheDocument();
	});

	it("renders a single card without cycling issues", () => {
		render(<CardStack cards={[<span key="1">Only card</span>]} />);
		expect(screen.getByText("Only card")).toBeInTheDocument();
	});
});

describe("InfiniteScrollList", () => {
	it("renders nothing for empty items array", () => {
		const { container } = render(<InfiniteScrollList items={[]} />);
		expect(container.firstChild).toBeNull();
	});

	it("renders a section with accessible label", () => {
		render(<InfiniteScrollList items={[<span key="1">Item 1</span>]} />);
		expect(
			screen.getByRole("region", { name: "Scrolling list" }),
		).toBeInTheDocument();
	});

	it("renders items (duplicated for loop)", () => {
		render(
			<InfiniteScrollList
				items={[<span key="a">Alpha</span>, <span key="b">Beta</span>]}
			/>,
		);
		// Items are duplicated for seamless loop — both copies render
		const alphaItems = screen.getAllByText("Alpha");
		expect(alphaItems.length).toBe(2);
	});

	it("renders with direction=right without throwing", () => {
		render(
			<InfiniteScrollList
				items={[<span key="1">Right</span>]}
				direction="right"
			/>,
		);
		expect(screen.getAllByText("Right").length).toBeGreaterThan(0);
	});
});

describe("ParallaxScroll", () => {
	it("renders all layers", () => {
		render(
			<ParallaxScroll
				layers={[
					{ content: <span>Layer A</span>, speed: 0.5 },
					{ content: <span>Layer B</span>, speed: 1 },
				]}
			/>,
		);
		expect(screen.getByText("Layer A")).toBeInTheDocument();
		expect(screen.getByText("Layer B")).toBeInTheDocument();
	});

	it("renders empty layers without throwing", () => {
		const { container } = render(<ParallaxScroll layers={[]} />);
		expect(container.firstChild).toBeInTheDocument();
	});
});
