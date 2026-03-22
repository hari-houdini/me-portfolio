// @vitest-environment jsdom

/**
 * section-nav.component.test.tsx
 *
 * Tests for the SectionNav component.
 * Verifies accessible markup, active section reflection, label visibility,
 * and programmatic scroll on click.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SectionNav } from "../section-nav.client.component";

const sectionTitles = {
	hero: "Hello",
	about: "About Me",
	work: "My Work",
};

// Minimal mock for the ScrollControls scroll element
function makeScrollEl(scrollHeight = 3000, clientHeight = 1000) {
	return {
		scrollHeight,
		clientHeight,
		scrollTo: vi.fn(),
	} as unknown as HTMLElement;
}

describe("SectionNav", () => {
	it("renders 3 navigation buttons", () => {
		render(
			<SectionNav section={0} sectionTitles={sectionTitles} scrollEl={null} />,
		);
		const buttons = screen.getAllByRole("button");
		expect(buttons).toHaveLength(3);
	});

	it("marks the active section button with aria-current", () => {
		render(
			<SectionNav section={1} sectionTitles={sectionTitles} scrollEl={null} />,
		);
		const buttons = screen.getAllByRole("button");
		expect(buttons[0]).not.toHaveAttribute("aria-current");
		expect(buttons[1]).toHaveAttribute("aria-current", "true");
		expect(buttons[2]).not.toHaveAttribute("aria-current");
	});

	it("renders aria-label for each dot referencing the section title", () => {
		render(
			<SectionNav section={0} sectionTitles={sectionTitles} scrollEl={null} />,
		);
		expect(
			screen.getByRole("button", { name: /navigate to hello section/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /navigate to about me section/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /navigate to my work section/i }),
		).toBeInTheDocument();
	});

	it("nav landmark has accessible label", () => {
		render(
			<SectionNav section={0} sectionTitles={sectionTitles} scrollEl={null} />,
		);
		expect(
			screen.getByRole("navigation", { name: /section navigation/i }),
		).toBeInTheDocument();
	});

	it("clicking a dot calls scrollEl.scrollTo with correct offset", () => {
		const scrollEl = makeScrollEl(3000, 1000);
		render(
			<SectionNav
				section={0}
				sectionTitles={sectionTitles}
				scrollEl={scrollEl}
			/>,
		);
		// Click the 'About Me' dot (index 1 → anchor 0.33 of 2000 scrollable = 660)
		const aboutButton = screen.getByRole("button", {
			name: /navigate to about me section/i,
		});
		fireEvent.click(aboutButton);
		expect(scrollEl.scrollTo).toHaveBeenCalledWith({
			top: expect.closeTo(660, 0),
			behavior: "smooth",
		});
	});

	it("clicking a dot does nothing when scrollEl is null", () => {
		// Should not throw
		render(
			<SectionNav section={0} sectionTitles={sectionTitles} scrollEl={null} />,
		);
		const workButton = screen.getByRole("button", {
			name: /navigate to my work section/i,
		});
		expect(() => fireEvent.click(workButton)).not.toThrow();
	});

	it("ArrowDown key moves to next section", () => {
		const scrollEl = makeScrollEl(3000, 1000);
		render(
			<SectionNav
				section={0}
				sectionTitles={sectionTitles}
				scrollEl={scrollEl}
			/>,
		);
		const nav = screen.getByRole("navigation");
		fireEvent.keyDown(nav, { key: "ArrowDown" });
		expect(scrollEl.scrollTo).toHaveBeenCalledWith({
			top: expect.closeTo(660, 0),
			behavior: "smooth",
		});
	});

	it("ArrowUp key does nothing when already at section 0", () => {
		const scrollEl = makeScrollEl(3000, 1000);
		render(
			<SectionNav
				section={0}
				sectionTitles={sectionTitles}
				scrollEl={scrollEl}
			/>,
		);
		const nav = screen.getByRole("navigation");
		fireEvent.keyDown(nav, { key: "ArrowUp" });
		expect(scrollEl.scrollTo).not.toHaveBeenCalled();
	});
});
