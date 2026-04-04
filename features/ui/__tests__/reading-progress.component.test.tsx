// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ReadingProgress } from "../reading-progress.client.component";

beforeAll(() => {
	// jsdom does not implement window.matchMedia
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

describe("ReadingProgress", () => {
	it("renders a progress track in the DOM", () => {
		const { container } = render(<ReadingProgress />);
		// The outer track div is aria-hidden
		const track = container.firstChild as HTMLElement;
		expect(track).toBeInTheDocument();
		expect(track).toHaveAttribute("aria-hidden", "true");
	});

	it("renders the progress bar as a child element", () => {
		const { container } = render(<ReadingProgress />);
		// Track contains the bar
		const bar = container.querySelector("div > div");
		expect(bar).toBeInTheDocument();
	});
});
