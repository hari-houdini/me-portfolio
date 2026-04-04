// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LiquidGlass } from "../liquid-glass.client.component";

describe("LiquidGlass", () => {
	it("renders children", () => {
		render(<LiquidGlass>Glass content</LiquidGlass>);
		expect(screen.getByText("Glass content")).toBeInTheDocument();
	});

	it("renders a div wrapper", () => {
		const { container } = render(<LiquidGlass>Inner</LiquidGlass>);
		expect(container.querySelector("div")).toBeInTheDocument();
	});

	it("forwards className prop", () => {
		const { container } = render(
			<LiquidGlass className="custom">Content</LiquidGlass>,
		);
		const div = container.querySelector("div");
		expect(div?.className).toContain("custom");
	});
});
