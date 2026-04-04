// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { SectionNav } from "../section-nav.client.component";

beforeAll(() => {
	// jsdom does not implement IntersectionObserver
	vi.stubGlobal(
		"IntersectionObserver",
		class {
			observe = vi.fn();
			disconnect = vi.fn();
			unobserve = vi.fn();
			constructor(public callback: IntersectionObserverCallback) {}
		},
	);
});

describe("SectionNav", () => {
	it("renders a nav with accessible label", () => {
		render(<SectionNav />);
		expect(
			screen.getByRole("navigation", { name: "Page sections" }),
		).toBeInTheDocument();
	});

	it("renders all four section links", () => {
		render(<SectionNav />);
		expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Work" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
	});

	it("links point to the correct section anchors", () => {
		render(<SectionNav />);
		expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
			"href",
			"#hero",
		);
		expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
			"href",
			"#about",
		);
	});

	it("handles link hover without throwing", async () => {
		render(<SectionNav />);
		const homeLink = screen.getByRole("link", { name: "Home" });
		await userEvent.hover(homeLink);
		await userEvent.unhover(homeLink);
		expect(homeLink).toBeInTheDocument();
	});
});
