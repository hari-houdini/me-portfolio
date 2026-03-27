import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ProjectData } from "../../cms/cms.schema";
import { mockProject } from "../../test/fixtures/cms.fixtures";
import { ProjectCard } from "../project-card.component";

describe("ProjectCard", () => {
	it("renders project title as heading", () => {
		render(<ProjectCard project={mockProject} />);
		expect(
			screen.getByRole("heading", { level: 3, name: "Immersive Portfolio" }),
		).toBeInTheDocument();
	});

	it("renders project description", () => {
		render(<ProjectCard project={mockProject} />);
		expect(
			screen.getByText(
				"A real-time 3D portfolio built with Three.js and React.",
			),
		).toBeInTheDocument();
	});

	it("renders featured badge when featured is true", () => {
		render(<ProjectCard project={mockProject} />);
		expect(screen.getByText("Featured")).toBeInTheDocument();
	});

	it("does not render featured badge when featured is false", () => {
		const unfeatured: ProjectData = { ...mockProject, featured: false };
		render(<ProjectCard project={unfeatured} />);
		expect(screen.queryByText("Featured")).not.toBeInTheDocument();
	});

	it("renders year when present", () => {
		render(<ProjectCard project={mockProject} />);
		expect(screen.getByText("2026")).toBeInTheDocument();
	});

	it("does not render year when null", () => {
		const noYear: ProjectData = { ...mockProject, year: null };
		render(<ProjectCard project={noYear} />);
		expect(screen.queryByText("2026")).not.toBeInTheDocument();
	});

	it("renders technologies list", () => {
		render(<ProjectCard project={mockProject} />);
		expect(
			screen.getByRole("list", { name: "Technologies" }),
		).toBeInTheDocument();
	});

	it("renders each technology tag", () => {
		render(<ProjectCard project={mockProject} />);
		expect(screen.getByText("Three.js")).toBeInTheDocument();
		expect(screen.getByText("React")).toBeInTheDocument();
		expect(screen.getByText("TypeScript")).toBeInTheDocument();
	});

	it("does not render technologies list when tags is empty", () => {
		const noTags: ProjectData = { ...mockProject, tags: [] };
		render(<ProjectCard project={noTags} />);
		expect(
			screen.queryByRole("list", { name: "Technologies" }),
		).not.toBeInTheDocument();
	});

	it("renders live site link when url is present", () => {
		render(<ProjectCard project={mockProject} />);
		expect(
			screen.getByRole("link", { name: "Immersive Portfolio — live site" }),
		).toBeInTheDocument();
	});

	it("does not render live site link when url is null", () => {
		const noUrl: ProjectData = { ...mockProject, url: null };
		render(<ProjectCard project={noUrl} />);
		expect(
			screen.queryByRole("link", { name: /live site/i }),
		).not.toBeInTheDocument();
	});

	it("renders github link when github is present", () => {
		render(<ProjectCard project={mockProject} />);
		expect(
			screen.getByRole("link", {
				name: "Immersive Portfolio — GitHub repository",
			}),
		).toBeInTheDocument();
	});

	it("does not render github link when github is null", () => {
		const noGithub: ProjectData = { ...mockProject, github: null };
		render(<ProjectCard project={noGithub} />);
		expect(
			screen.queryByRole("link", { name: /github repository/i }),
		).not.toBeInTheDocument();
	});
});
