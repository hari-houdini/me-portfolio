// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SectionHeading } from "../title-effects/section-heading.component";

// next/dynamic with ssr:false never resolves in jsdom — stub to passthrough
vi.mock("next/dynamic", () => ({
	default: (_loader: unknown, _opts?: unknown) =>
		function DynamicStub({ children }: { children?: string }) {
			return <>{children}</>;
		},
}));

describe("SectionHeading", () => {
	it("renders as h2 by default", () => {
		render(<SectionHeading>About</SectionHeading>);
		expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
	});

	it("renders as h1 when level=1", () => {
		render(<SectionHeading level={1}>Hello</SectionHeading>);
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
	});

	it("renders as h3 when level=3", () => {
		render(<SectionHeading level={3}>Work</SectionHeading>);
		expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
	});

	it("renders children text", () => {
		render(<SectionHeading>My Section</SectionHeading>);
		expect(screen.getByText("My Section")).toBeInTheDocument();
	});

	it("applies id prop to heading", () => {
		render(<SectionHeading id="test-id">Title</SectionHeading>);
		expect(screen.getByRole("heading")).toHaveAttribute("id", "test-id");
	});

	it("renders plain text for no variant (default)", () => {
		render(<SectionHeading>Plain</SectionHeading>);
		expect(screen.getByRole("heading", { name: "Plain" })).toBeInTheDocument();
	});

	it("renders gradient variant without error", () => {
		render(<SectionHeading variant="gradient">Gradient Title</SectionHeading>);
		expect(
			screen.getByRole("heading", { name: "Gradient Title" }),
		).toBeInTheDocument();
	});

	it("renders unknown variant as plain text fallback", () => {
		render(<SectionHeading variant="unknown-effect">Fallback</SectionHeading>);
		expect(
			screen.getByRole("heading", { name: "Fallback" }),
		).toBeInTheDocument();
	});
});
