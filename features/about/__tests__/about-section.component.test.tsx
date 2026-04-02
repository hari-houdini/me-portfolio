import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AboutData } from "../../cms/cms.schema";
import { mockAbout } from "../../test/fixtures/cms.fixtures";
import { AboutSection } from "../about-section.component";

// @payloadcms/richtext-lexical/react requires a full Payload + browser environment.
// Replace with a minimal stub so unit tests focus on component logic, not the
// serialiser internals.
vi.mock("@payloadcms/richtext-lexical/react", () => ({
	RichText: ({ data }: { data: unknown }) => (
		<div data-testid="rich-text" data-lexical={JSON.stringify(data)} />
	),
}));

// CSS Modules are identity-mapped in the jsdom test environment (className === key).
vi.mock("../about-section.module.css", () => ({ default: {} }));

describe("AboutSection", () => {
	it("renders section heading", () => {
		render(<AboutSection about={mockAbout} />);
		expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
			"About",
		);
	});

	it("renders custom section title", () => {
		render(<AboutSection about={mockAbout} sectionTitle="Who I Am" />);
		expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
			"Who I Am",
		);
	});

	it("renders RichText component with bio data", () => {
		render(<AboutSection about={mockAbout} />);
		expect(screen.getByTestId("rich-text")).toBeInTheDocument();
	});

	it("renders skills list", () => {
		render(<AboutSection about={mockAbout} />);
		expect(screen.getByRole("list", { name: "Skills" })).toBeInTheDocument();
	});

	it("renders each skill", () => {
		render(<AboutSection about={mockAbout} />);
		expect(screen.getByText("TypeScript")).toBeInTheDocument();
		expect(screen.getByText("Three.js")).toBeInTheDocument();
		expect(screen.getByText("React")).toBeInTheDocument();
	});

	it("does not render skills list when skills is empty", () => {
		const noSkills: AboutData = { ...mockAbout, skills: [] };
		render(<AboutSection about={noSkills} />);
		expect(
			screen.queryByRole("list", { name: "Skills" }),
		).not.toBeInTheDocument();
	});

	it("does not render skills list when skills is null", () => {
		const noSkills: AboutData = { ...mockAbout, skills: null };
		render(<AboutSection about={noSkills} />);
		expect(
			screen.queryByRole("list", { name: "Skills" }),
		).not.toBeInTheDocument();
	});

	it("renders without crashing when bio has no children", () => {
		const emptyBio: AboutData = {
			...mockAbout,
			bio: {
				root: {
					type: "root",
					children: [],
					direction: "ltr",
					format: "left",
					indent: 0,
					version: 1,
				},
			},
		};
		render(<AboutSection about={emptyBio} />);
		expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
		expect(screen.getByTestId("rich-text")).toBeInTheDocument();
	});
});
