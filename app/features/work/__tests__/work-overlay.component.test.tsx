// @vitest-environment jsdom

/**
 * work-overlay.test.tsx
 *
 * Tests for the WorkOverlay component.
 * Verifies project sorting, section title rendering, and empty state.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Project } from "~/services/cms/mod";
import {
	mockProjectFeatured,
	mockProjectRegular,
	mockSiteConfig,
} from "~/test/fixtures/cms.fixtures";
import { WorkOverlay } from "../work-overlay.iso.component";

// Use a simple siteConfig for tests that assert on section title text
// — zocker generates long multiline strings that getByText can't reliably match.
const simpleSiteConfig = {
	...mockSiteConfig,
	sectionTitles: {
		hero: "Hello, Universe",
		about: "About",
		work: "Work",
		contact: "Contact",
	},
};

describe("WorkOverlay: renders project list correctly", () => {
	it("renders the work section title from siteConfig", () => {
		render(
			<WorkOverlay
				projects={[mockProjectFeatured]}
				siteConfig={simpleSiteConfig}
				visible
			/>,
		);
		expect(screen.getByText("Work")).toBeInTheDocument();
	});

	it("renders all provided projects", () => {
		render(
			<WorkOverlay
				projects={[mockProjectFeatured, mockProjectRegular]}
				siteConfig={simpleSiteConfig}
				visible
			/>,
		);
		expect(
			screen.getByRole("heading", { name: mockProjectFeatured.title }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: mockProjectRegular.title }),
		).toBeInTheDocument();
	});

	it("renders 'Projects coming soon' when projects array is empty", () => {
		render(<WorkOverlay projects={[]} siteConfig={simpleSiteConfig} visible />);
		expect(screen.getByText(/projects coming soon/i)).toBeInTheDocument();
	});

	it("renders featured projects before non-featured", () => {
		// Provide them in reverse order — featured should come first after sort
		const projects: Project[] = [
			{
				...mockProjectRegular,
				title: "Regular Project",
				order: 1,
				featured: false,
			},
			{
				...mockProjectFeatured,
				title: "Featured Project",
				order: 2,
				featured: true,
			},
		];
		render(
			<WorkOverlay projects={projects} siteConfig={simpleSiteConfig} visible />,
		);
		const headings = screen.getAllByRole("heading", { level: 3 });
		expect(headings[0]).toHaveTextContent("Featured Project");
		expect(headings[1]).toHaveTextContent("Regular Project");
	});

	it("section has accessible landmark label", () => {
		render(
			<WorkOverlay
				projects={[mockProjectFeatured]}
				siteConfig={simpleSiteConfig}
				visible
			/>,
		);
		expect(
			screen.getByRole("region", { name: /work section/i }),
		).toBeInTheDocument();
	});
});
