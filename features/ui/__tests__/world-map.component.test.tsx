// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorldMap } from "../world-map.component";

describe("WorldMap", () => {
	it("renders a figure element with accessible label", () => {
		const { container } = render(<WorldMap />);
		const figure = container.querySelector("figure");
		expect(figure).toBeInTheDocument();
		expect(figure).toHaveAttribute("aria-label", "World map with locations");
	});

	it("renders an SVG inside the map div", () => {
		const { container } = render(<WorldMap />);
		const svg = container.querySelector("svg");
		expect(svg).toBeInTheDocument();
	});

	it("renders without locations (empty)", () => {
		const { container } = render(<WorldMap locations={[]} />);
		expect(container.querySelector("figure")).toBeInTheDocument();
		// No figcaption when no locations
		expect(container.querySelector("figcaption")).not.toBeInTheDocument();
	});

	it("renders figcaption when locations are provided", () => {
		const locations = [
			{ label: "London", lat: 51.5, lng: -0.1 },
			{ label: "Tokyo", lat: 35.6, lng: 139.7 },
		];
		const { container } = render(<WorldMap locations={locations} />);
		const caption = container.querySelector("figcaption");
		expect(caption).toBeInTheDocument();
		expect(caption?.textContent).toContain("London");
		expect(caption?.textContent).toContain("Tokyo");
	});

	it("renders figcaption when null locations are provided", () => {
		const { container } = render(<WorldMap locations={null} />);
		expect(container.querySelector("figcaption")).not.toBeInTheDocument();
	});
});
