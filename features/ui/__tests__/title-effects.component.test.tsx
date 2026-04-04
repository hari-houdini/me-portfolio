// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { GlitchText } from "../title-effects/glitch-text.client.component";
import { GradientText } from "../title-effects/gradient-text.component";
import { ShimmerText } from "../title-effects/shimmer-text.client.component";
import { TypewriterText } from "../title-effects/typewriter-text.client.component";

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

describe("GlitchText", () => {
	it("renders children text", () => {
		render(<GlitchText>Hello Glitch</GlitchText>);
		expect(screen.getByText("Hello Glitch")).toBeInTheDocument();
	});

	it("sets data-text attribute for pseudo-element replication", () => {
		const { container } = render(<GlitchText>Glitch me</GlitchText>);
		const span = container.querySelector("[data-text]");
		expect(span).toHaveAttribute("data-text", "Glitch me");
	});

	it("renders non-string children without data-text", () => {
		render(
			<GlitchText>
				<em>rich</em>
			</GlitchText>,
		);
		const { container } = render(
			<GlitchText>
				<em>rich</em>
			</GlitchText>,
		);
		const span = container.querySelector("[data-text]");
		expect(span).toHaveAttribute("data-text", "");
	});
});

describe("GradientText", () => {
	it("renders children text", () => {
		render(<GradientText>Gradient</GradientText>);
		expect(screen.getByText("Gradient")).toBeInTheDocument();
	});

	it("renders as a span by default", () => {
		const { container } = render(<GradientText>Text</GradientText>);
		expect(container.querySelector("span")).toBeInTheDocument();
	});
});

describe("ShimmerText", () => {
	it("renders children text", () => {
		render(<ShimmerText>Shimmer</ShimmerText>);
		expect(screen.getByText("Shimmer")).toBeInTheDocument();
	});

	it("renders as a span", () => {
		const { container } = render(<ShimmerText>Shine</ShimmerText>);
		expect(container.querySelector("span")).toBeInTheDocument();
	});
});

describe("TypewriterText", () => {
	it("renders children text (textContent survives GSAP split)", () => {
		const { container } = render(<TypewriterText>Typing</TypewriterText>);
		// GSAP may split into character spans — use textContent rather than getByText
		expect(container.textContent).toContain("Typing");
	});

	it("renders a container span", () => {
		const { container } = render(<TypewriterText>Hello</TypewriterText>);
		expect(container.querySelector("span")).toBeInTheDocument();
	});

	it("renders with custom charDelay without throwing", () => {
		const { container } = render(
			<TypewriterText charDelay={0.1}>Fast</TypewriterText>,
		);
		expect(container.textContent).toContain("Fast");
	});
});
