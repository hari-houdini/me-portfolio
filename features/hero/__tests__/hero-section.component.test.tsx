import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockSiteConfig } from "../../test/fixtures/cms.fixtures";
import { HeroSection } from "../hero-section.component";

describe("HeroSection", () => {
	it("renders name as h1", () => {
		render(<HeroSection siteConfig={mockSiteConfig} />);
		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
			"Hari Houdini",
		);
	});

	it("renders tagline", () => {
		render(<HeroSection siteConfig={mockSiteConfig} />);
		expect(screen.getByText("Creative Technologist")).toBeInTheDocument();
	});

	it("renders subtitle when present", () => {
		render(<HeroSection siteConfig={mockSiteConfig} />);
		expect(
			screen.getByText(/intersection of art and engineering/i),
		).toBeInTheDocument();
	});

	it("does not render subtitle when null", () => {
		const noSubtitle = { ...mockSiteConfig, subtitle: null };
		render(<HeroSection siteConfig={noSubtitle} />);
		expect(
			screen.queryByText(/intersection of art and engineering/i),
		).not.toBeInTheDocument();
	});

	it("does not render subtitle when undefined", () => {
		const { subtitle: _omitted, ...noSubtitle } = mockSiteConfig;
		render(<HeroSection siteConfig={noSubtitle} />);
		expect(
			screen.queryByText(/intersection of art and engineering/i),
		).not.toBeInTheDocument();
	});
});
