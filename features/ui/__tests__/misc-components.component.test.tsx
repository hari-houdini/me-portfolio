// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { AnimatedTooltip } from "../animated-tooltip.client.component";
import { LampEffect } from "../lamp-effect.client.component";
import { TracingBeam } from "../tracing-beam.client.component";

beforeAll(() => {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation((query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});
});

describe("AnimatedTooltip", () => {
	it("renders children", () => {
		render(
			<AnimatedTooltip label="Tooltip text">
				<button type="button">Hover me</button>
			</AnimatedTooltip>,
		);
		expect(
			screen.getByRole("button", { name: "Hover me" }),
		).toBeInTheDocument();
	});

	it("renders tooltip with role=tooltip", () => {
		render(
			<AnimatedTooltip label="Description">
				<span>Target</span>
			</AnimatedTooltip>,
		);
		expect(screen.getByRole("tooltip")).toBeInTheDocument();
		expect(screen.getByRole("tooltip")).toHaveTextContent("Description");
	});
});

describe("LampEffect", () => {
	it("renders children", () => {
		render(
			<LampEffect>
				<a href="#section">Nav link</a>
			</LampEffect>,
		);
		expect(screen.getByRole("link", { name: "Nav link" })).toBeInTheDocument();
	});

	it("applies custom color via CSS custom property", () => {
		const { container } = render(
			<LampEffect color="#ff0000">
				<span>Colored lamp</span>
			</LampEffect>,
		);
		const lamp = container.querySelector("[style]");
		expect(lamp).toHaveAttribute("style", expect.stringContaining("ff0000"));
	});

	it("renders without color prop without throwing", () => {
		render(
			<LampEffect>
				<span>No color</span>
			</LampEffect>,
		);
		expect(screen.getByText("No color")).toBeInTheDocument();
	});
});

describe("TracingBeam", () => {
	it("renders children when enabled=true (default)", () => {
		render(
			<TracingBeam>
				<article>Article content</article>
			</TracingBeam>,
		);
		expect(screen.getByRole("article")).toBeInTheDocument();
	});

	it("renders children directly when enabled=false", () => {
		render(
			<TracingBeam enabled={false}>
				<article>No beam</article>
			</TracingBeam>,
		);
		expect(screen.getByRole("article")).toBeInTheDocument();
	});

	it("renders beam track when enabled", () => {
		const { container } = render(
			<TracingBeam>
				<p>Content</p>
			</TracingBeam>,
		);
		// The track is aria-hidden
		const track = container.querySelector("[aria-hidden='true']");
		expect(track).toBeInTheDocument();
	});

	it("does not render beam track when disabled", () => {
		const { container } = render(
			<TracingBeam enabled={false}>
				<p>No beam</p>
			</TracingBeam>,
		);
		expect(
			container.querySelector("[aria-hidden='true']"),
		).not.toBeInTheDocument();
	});
});
