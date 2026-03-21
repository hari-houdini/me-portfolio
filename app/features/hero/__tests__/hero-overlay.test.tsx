// @vitest-environment jsdom

/**
 * hero-overlay.test.tsx
 *
 * Tests for the HeroOverlay component.
 * Verifies that CMS data is correctly rendered with accessible markup.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	mockSiteConfig,
	mockSiteConfigMinimal,
} from "~/test/fixtures/cms.fixtures";
import { HeroOverlay } from "../hero-overlay";

describe("HeroOverlay: renders CMS data correctly", () => {
	it("renders the owner name as an h1 heading", () => {
		render(<HeroOverlay siteConfig={mockSiteConfig} introComplete />);
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).toHaveTextContent(mockSiteConfig.name);
	});

	it("renders the tagline", () => {
		render(<HeroOverlay siteConfig={mockSiteConfig} introComplete />);
		expect(screen.getByText(mockSiteConfig.tagline)).toBeInTheDocument();
	});

	it("renders the subtitle when present", () => {
		const config = {
			...mockSiteConfig,
			subtitle: "A subtitle line",
		};
		render(<HeroOverlay siteConfig={config} introComplete />);
		expect(screen.getByText("A subtitle line")).toBeInTheDocument();
	});

	it("does not render subtitle when null", () => {
		render(<HeroOverlay siteConfig={mockSiteConfigMinimal} introComplete />);
		// mockSiteConfigMinimal has subtitle: null
		// Confirm the literal string "null" is not rendered in the DOM
		expect(screen.queryByText("null")).not.toBeInTheDocument();
	});

	it("renders scroll prompt on desktop (non-mobile)", () => {
		render(
			<HeroOverlay
				siteConfig={mockSiteConfig}
				introComplete
				isMobile={false}
			/>,
		);
		expect(
			screen.getByRole("status", { name: /scroll to explore/i }),
		).toBeInTheDocument();
	});

	it("does not render scroll prompt on mobile", () => {
		render(<HeroOverlay siteConfig={mockSiteConfig} introComplete isMobile />);
		expect(
			screen.queryByRole("status", { name: /scroll to explore/i }),
		).not.toBeInTheDocument();
	});

	it("name heading is opacity-0 when introComplete is false", () => {
		render(<HeroOverlay siteConfig={mockSiteConfig} introComplete={false} />);
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading.className).toContain("opacity-0");
	});

	it("name heading is opacity-100 when introComplete is true", () => {
		render(<HeroOverlay siteConfig={mockSiteConfig} introComplete />);
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading.className).toContain("opacity-100");
	});

	it("section has accessible landmark label", () => {
		render(<HeroOverlay siteConfig={mockSiteConfig} introComplete />);
		expect(
			screen.getByRole("region", { name: /portfolio introduction/i }),
		).toBeInTheDocument();
	});
});
