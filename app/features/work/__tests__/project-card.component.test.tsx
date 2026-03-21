// @vitest-environment jsdom

/**
 * project-card.test.tsx
 *
 * Tests for the ProjectCard component.
 * Verifies that all project fields are rendered correctly and that
 * optional fields degrade gracefully when absent.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	mockProjectFeatured,
	mockProjectRegular,
} from "~/test/fixtures/cms.fixtures";
import { ProjectCard } from "../project-card.iso.component";

describe("ProjectCard: renders project data correctly", () => {
	it("renders the project title as a heading", () => {
		render(<ProjectCard project={mockProjectFeatured} />);
		expect(
			screen.getByRole("heading", { name: mockProjectFeatured.title }),
		).toBeInTheDocument();
	});

	it("renders the project description", () => {
		render(<ProjectCard project={mockProjectFeatured} />);
		expect(
			screen.getByText(mockProjectFeatured.description),
		).toBeInTheDocument();
	});

	it("renders the year when present", () => {
		const project = { ...mockProjectRegular, year: 2024 };
		render(<ProjectCard project={project} />);
		expect(screen.getByText("2024")).toBeInTheDocument();
	});

	it("does not render a year element when year is null", () => {
		const project = { ...mockProjectRegular, year: null };
		render(<ProjectCard project={project} />);
		// Year should not appear
		expect(screen.queryByText(/^\d{4}$/)).not.toBeInTheDocument();
	});

	it("renders technology tags as a list", () => {
		const project = { ...mockProjectRegular, tags: ["React", "Three.js"] };
		render(<ProjectCard project={project} />);
		const tagList = screen.getByRole("list", { name: /technologies used/i });
		expect(tagList).toBeInTheDocument();
		expect(screen.getByText("React")).toBeInTheDocument();
		expect(screen.getByText("Three.js")).toBeInTheDocument();
	});

	it("does not render tags section when tags array is empty", () => {
		const project = { ...mockProjectRegular, tags: [] };
		render(<ProjectCard project={project} />);
		expect(
			screen.queryByRole("list", { name: /technologies/i }),
		).not.toBeInTheDocument();
	});

	it("renders live URL link when present", () => {
		const project = {
			...mockProjectRegular,
			url: "https://example.com",
		};
		render(<ProjectCard project={project} />);
		const link = screen.getByRole("link", {
			name: new RegExp(`visit ${project.title} live site`, "i"),
		});
		expect(link).toHaveAttribute("href", "https://example.com");
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noopener noreferrer");
	});

	it("does not render live link when url is null", () => {
		const project = { ...mockProjectRegular, url: null };
		render(<ProjectCard project={project} />);
		expect(
			screen.queryByRole("link", { name: /live site/i }),
		).not.toBeInTheDocument();
	});

	it("renders GitHub link when present", () => {
		const project = {
			...mockProjectRegular,
			github: "https://github.com/user/repo",
		};
		render(<ProjectCard project={project} />);
		const link = screen.getByRole("link", {
			name: new RegExp(`view ${project.title} on github`, "i"),
		});
		expect(link).toHaveAttribute("href", "https://github.com/user/repo");
	});

	it("renders featured badge when project.featured is true", () => {
		render(<ProjectCard project={mockProjectFeatured} />);
		// The mark element contains "Featured"
		expect(screen.getByText("Featured")).toBeInTheDocument();
	});

	it("does not render featured badge when project.featured is false", () => {
		render(<ProjectCard project={mockProjectRegular} />);
		expect(screen.queryByText("Featured")).not.toBeInTheDocument();
	});

	it("renders thumbnail with correct alt text when present", () => {
		const project = {
			...mockProjectRegular,
			thumbnail: {
				url: "https://example.com/thumb.jpg",
				width: 400,
				height: 225,
				alt: "Project screenshot",
				sizes: { thumbnail: null, og: null },
			},
		};
		render(<ProjectCard project={project} />);
		expect(screen.getByRole("img")).toHaveAttribute(
			"alt",
			"Project screenshot",
		);
	});

	it("does not render thumbnail when thumbnail is null", () => {
		const project = { ...mockProjectRegular, thumbnail: null };
		render(<ProjectCard project={project} />);
		expect(screen.queryByRole("img")).not.toBeInTheDocument();
	});
});
