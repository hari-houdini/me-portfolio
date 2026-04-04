// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HaloSearch } from "../halo-search.client.component";

describe("HaloSearch", () => {
	it("renders a search input", () => {
		render(<HaloSearch aria-label="Search posts" />);
		expect(
			screen.getByRole("searchbox", { name: "Search posts" }),
		).toBeInTheDocument();
	});

	it("renders placeholder text", () => {
		render(<HaloSearch placeholder="Search…" aria-label="Search" />);
		expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument();
	});

	it("calls onChange when user types", async () => {
		const onChange = vi.fn();
		render(<HaloSearch aria-label="Search" onChange={onChange} />);
		await userEvent.type(screen.getByRole("searchbox"), "hello");
		expect(onChange).toHaveBeenCalled();
	});

	it("reflects controlled value prop", () => {
		render(
			<HaloSearch aria-label="Search" value="prefilled" onChange={() => {}} />,
		);
		expect(screen.getByRole("searchbox")).toHaveValue("prefilled");
	});

	it("forwards id prop to the input", () => {
		render(<HaloSearch id="blog-search" aria-label="Search" />);
		expect(screen.getByRole("searchbox")).toHaveAttribute("id", "blog-search");
	});
});
