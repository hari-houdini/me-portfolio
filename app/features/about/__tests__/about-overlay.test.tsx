// @vitest-environment jsdom

/**
 * about-overlay.test.tsx
 *
 * Tests for the AboutOverlay component.
 * Verifies bio rendering, skills list, photo, and graceful fallbacks
 * for null/empty optional fields.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	mockAbout,
	mockAboutMinimal,
	mockSiteConfig,
} from "~/test/fixtures/cms.fixtures";
import { AboutOverlay } from "../about-overlay";

describe("AboutOverlay: renders CMS data correctly", () => {
	it("renders the about section title from siteConfig", () => {
		render(
			<AboutOverlay about={mockAbout} siteConfig={mockSiteConfig} visible />,
		);
		expect(
			screen.getByText(mockSiteConfig.sectionTitles.about),
		).toBeInTheDocument();
	});

	it("renders skills as a list when skills are present", () => {
		const about = { ...mockAbout, skills: ["React", "TypeScript", "Three.js"] };
		render(<AboutOverlay about={about} siteConfig={mockSiteConfig} visible />);
		const list = screen.getByRole("list", { name: /skills and technologies/i });
		expect(list).toBeInTheDocument();
		expect(screen.getByText("React")).toBeInTheDocument();
		expect(screen.getByText("TypeScript")).toBeInTheDocument();
		expect(screen.getByText("Three.js")).toBeInTheDocument();
	});

	it("does not render skills section when skills array is empty", () => {
		render(
			<AboutOverlay
				about={mockAboutMinimal}
				siteConfig={mockSiteConfig}
				visible
			/>,
		);
		expect(
			screen.queryByRole("list", { name: /skills/i }),
		).not.toBeInTheDocument();
	});

	it("renders 'Bio coming soon' when bio is null", () => {
		render(
			<AboutOverlay
				about={mockAboutMinimal}
				siteConfig={mockSiteConfig}
				visible
			/>,
		);
		expect(screen.getByText(/bio coming soon/i)).toBeInTheDocument();
	});

	it("does not render photo when photo is null", () => {
		render(
			<AboutOverlay
				about={mockAboutMinimal}
				siteConfig={mockSiteConfig}
				visible
			/>,
		);
		expect(screen.queryByRole("img")).not.toBeInTheDocument();
	});

	it("renders photo when present", () => {
		const aboutWithPhoto = {
			...mockAbout,
			photo: {
				url: "https://example.com/photo.jpg",
				width: 400,
				height: 400,
				alt: "Profile photo",
				sizes: { thumbnail: null, og: null },
			},
		};
		render(
			<AboutOverlay
				about={aboutWithPhoto}
				siteConfig={mockSiteConfig}
				visible
			/>,
		);
		const img = screen.getByRole("img");
		expect(img).toHaveAttribute("alt", "Profile photo");
	});

	it("section has accessible landmark label", () => {
		render(
			<AboutOverlay about={mockAbout} siteConfig={mockSiteConfig} visible />,
		);
		expect(
			screen.getByRole("region", { name: /about section/i }),
		).toBeInTheDocument();
	});

	it("applies opacity-0 class when not visible (desktop mode)", () => {
		const { container } = render(
			<AboutOverlay
				about={mockAbout}
				siteConfig={mockSiteConfig}
				visible={false}
				isMobile={false}
			/>,
		);
		// The section should have the opacity-0 class when not visible
		const section = container.querySelector("section");
		expect(section?.className).toContain("opacity-0");
	});
});
