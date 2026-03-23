// @vitest-environment jsdom

/**
 * section-nav.component.test.tsx
 *
 * Tests for the SectionNav component after the React Aria Components refactor.
 *
 * ARIA changes from the RAC migration:
 *  - Dots are now role="radio" (were role="button")
 *  - Active dot has aria-checked="true" (was aria-current="true")
 *  - The group is role="radiogroup" (provided by RAC RadioGroup)
 *  - Keyboard navigation is handled internally by RAC — firing ArrowDown on
 *    a focused radio triggers RadioGroup's onChange, which calls scrollToSection
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
	it("renders 3 radio buttons", () => {
		render(
			<SectionNav section={0} sectionTitles={sectionTitles} scrollEl={null} />,
		);
		expect(screen.getAllByRole("radio")).toHaveLength(3);
	});

	it("marks the active section radio as checked", () => {
		render(
			<SectionNav section={1} sectionTitles={sectionTitles} scrollEl={null} />,
		);
		const radios = screen.getAllByRole("radio");
		// RAC sets aria-checked="true" on the selected radio and omits the
		// attribute on others. Use toBeChecked() which handles both cases.
		expect(radios[0]).not.toBeChecked();
		expect(radios[1]).toBeChecked();
		expect(radios[2]).not.toBeChecked();
	});

	it("renders aria-label for each dot referencing the section title", () => {
		render(
			<SectionNav section={0} sectionTitles={sectionTitles} scrollEl={null} />,
		);
		expect(
			screen.getByRole("radio", { name: /navigate to hello section/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("radio", { name: /navigate to about me section/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("radio", { name: /navigate to my work section/i }),
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

	it("radiogroup is present inside the nav", () => {
		render(
			<SectionNav section={0} sectionTitles={sectionTitles} scrollEl={null} />,
		);
		expect(
			screen.getByRole("radiogroup", { name: /section navigation/i }),
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
		// Click the 'About Me' radio (index 1 → anchor 0.33 of 2000 scrollable = 660)
		const aboutRadio = screen.getByRole("radio", {
			name: /navigate to about me section/i,
		});
		fireEvent.click(aboutRadio);
		expect(scrollEl.scrollTo).toHaveBeenCalledWith({
			top: expect.closeTo(660, 0),
			behavior: "smooth",
		});
	});

	it("clicking a dot does nothing when scrollEl is null", () => {
		render(
			<SectionNav section={0} sectionTitles={sectionTitles} scrollEl={null} />,
		);
		const workRadio = screen.getByRole("radio", {
			name: /navigate to my work section/i,
		});
		expect(() => fireEvent.click(workRadio)).not.toThrow();
	});

	it("ArrowDown key on focused radio moves to next section", () => {
		const scrollEl = makeScrollEl(3000, 1000);
		render(
			<SectionNav
				section={0}
				sectionTitles={sectionTitles}
				scrollEl={scrollEl}
			/>,
		);
		// RAC RadioGroup handles ArrowDown on the focused radio element
		const heroRadio = screen.getByRole("radio", {
			name: /navigate to hello section/i,
		});
		heroRadio.focus();
		fireEvent.keyDown(heroRadio, { key: "ArrowDown" });
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
		const heroRadio = screen.getByRole("radio", {
			name: /navigate to hello section/i,
		});
		heroRadio.focus();
		fireEvent.keyDown(heroRadio, { key: "ArrowUp" });
		expect(scrollEl.scrollTo).not.toHaveBeenCalled();
	});
});
