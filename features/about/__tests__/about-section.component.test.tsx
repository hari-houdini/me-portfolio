import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AboutData } from "../../cms/cms.schema";
import { mockAbout } from "../../test/fixtures/cms.fixtures";
import { AboutSection } from "../about-section.component";

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

	it("renders bio paragraph text", () => {
		render(<AboutSection about={mockAbout} />);
		expect(
			screen.getByText("I build immersive digital experiences."),
		).toBeInTheDocument();
	});

	it("renders skills list", () => {
		render(<AboutSection about={mockAbout} />);
		const list = screen.getByRole("list", { name: "Skills" });
		expect(list).toBeInTheDocument();
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

	it("renders empty bio without crashing", () => {
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
	});
});
