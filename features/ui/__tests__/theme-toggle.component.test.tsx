// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "../theme-toggle.client.component";

// jsdom may not fully implement localStorage in all configurations — use a reliable stub
let store: Record<string, string> = {};
const localStorageMock = {
	getItem: (key: string) => store[key] ?? null,
	setItem: (key: string, value: string) => {
		store[key] = value;
	},
	removeItem: (key: string) => {
		delete store[key];
	},
	clear: () => {
		store = {};
	},
};

beforeEach(() => {
	store = {};
	vi.stubGlobal("localStorage", localStorageMock);
	document.documentElement.setAttribute("data-theme", "dark");
});

describe("ThemeToggle", () => {
	it("renders a button", () => {
		render(<ThemeToggle />);
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("reads initial light theme from data-theme attribute — isDark=false", () => {
		document.documentElement.setAttribute("data-theme", "light");
		render(<ThemeToggle />);
		const button = screen.getByRole("button");
		// aria-pressed reflects isDark; in light mode isDark=false
		expect(button).toHaveAttribute("aria-pressed", "false");
	});

	it("initial dark theme has aria-pressed true", () => {
		document.documentElement.setAttribute("data-theme", "dark");
		render(<ThemeToggle />);
		const button = screen.getByRole("button");
		// aria-pressed reflects isDark; in dark mode isDark=true
		expect(button).toHaveAttribute("aria-pressed", "true");
	});

	it("toggles data-theme to light on click", async () => {
		render(<ThemeToggle />);
		const button = screen.getByRole("button");
		await userEvent.click(button);
		expect(document.documentElement).toHaveAttribute("data-theme", "light");
	});

	it("persists theme to localStorage on toggle", async () => {
		render(<ThemeToggle />);
		await userEvent.click(screen.getByRole("button"));
		expect(localStorageMock.getItem("theme")).toBe("light");
	});

	it("toggles back to dark from light", async () => {
		document.documentElement.setAttribute("data-theme", "light");
		render(<ThemeToggle />);
		await userEvent.click(screen.getByRole("button"));
		expect(document.documentElement).toHaveAttribute("data-theme", "dark");
		expect(localStorageMock.getItem("theme")).toBe("dark");
	});
});
