import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	mockFeaturedProject,
	mockProject,
} from "../../test/fixtures/cms.fixtures";
import { WorkSection } from "../work-section.component";

vi.mock("../work-section.module.css", () => ({ default: {} }));
function MockImage({
	src,
	alt,
	...rest
}: {
	src: string;
	alt: string;
	[k: string]: unknown;
}) {
	// biome-ignore lint/performance/noImgElement: test-only stub replacing next/image
	return <img src={src} alt={alt} {...(rest as object)} />;
}

vi.mock("next/image", () => ({ default: MockImage }));

describe("WorkSection", () => {
	it("renders section heading", () => {
		render(<WorkSection projects={[]} />);
		expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Work");
	});

	it("renders custom section title", () => {
		render(<WorkSection projects={[]} sectionTitle="Selected Projects" />);
		expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
			"Selected Projects",
		);
	});

	it("renders empty state when no projects", () => {
		render(<WorkSection projects={[]} />);
		expect(screen.getByText("No projects to display.")).toBeInTheDocument();
	});

	it("does not render projects list when empty", () => {
		render(<WorkSection projects={[]} />);
		expect(
			screen.queryByRole("list", { name: "Projects" }),
		).not.toBeInTheDocument();
	});

	it("renders projects list when projects exist", () => {
		render(<WorkSection projects={[mockProject]} />);
		expect(screen.getByRole("list", { name: "Projects" })).toBeInTheDocument();
	});

	it("renders each project card", () => {
		render(<WorkSection projects={[mockProject, mockFeaturedProject]} />);
		expect(screen.getByText("Immersive Portfolio")).toBeInTheDocument();
		expect(screen.getByText("Galaxy Renderer")).toBeInTheDocument();
	});

	it("does not render empty state when projects exist", () => {
		render(<WorkSection projects={[mockProject]} />);
		expect(
			screen.queryByText("No projects to display."),
		).not.toBeInTheDocument();
	});
});
