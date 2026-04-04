// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BorderBeamButton } from "../buttons/border-beam-button.client.component";
import { GlowButton } from "../buttons/glow-button.client.component";
import { MagneticButton } from "../buttons/magnetic-button.client.component";

describe("GlowButton", () => {
	it("renders a button element", () => {
		render(<GlowButton>Click me</GlowButton>);
		expect(
			screen.getByRole("button", { name: "Click me" }),
		).toBeInTheDocument();
	});

	it("renders children", () => {
		render(<GlowButton>Submit</GlowButton>);
		expect(screen.getByText("Submit")).toBeInTheDocument();
	});

	it("forwards onClick prop", async () => {
		let clicked = false;
		render(
			<GlowButton
				onClick={() => {
					clicked = true;
				}}
			>
				Go
			</GlowButton>,
		);
		await userEvent.click(screen.getByRole("button"));
		expect(clicked).toBe(true);
	});

	it("forwards aria-label prop", () => {
		render(<GlowButton aria-label="Send form">Send</GlowButton>);
		expect(
			screen.getByRole("button", { name: "Send form" }),
		).toBeInTheDocument();
	});
});

describe("BorderBeamButton", () => {
	it("renders a button element", () => {
		render(<BorderBeamButton>Beam</BorderBeamButton>);
		expect(screen.getByRole("button", { name: "Beam" })).toBeInTheDocument();
	});

	it("renders children", () => {
		render(<BorderBeamButton>Learn more</BorderBeamButton>);
		expect(screen.getByText("Learn more")).toBeInTheDocument();
	});

	it("forwards disabled prop", () => {
		render(<BorderBeamButton disabled>Disabled</BorderBeamButton>);
		expect(screen.getByRole("button")).toBeDisabled();
	});
});

describe("MagneticButton", () => {
	it("renders a button element", () => {
		render(<MagneticButton>Magnetic</MagneticButton>);
		expect(
			screen.getByRole("button", { name: "Magnetic" }),
		).toBeInTheDocument();
	});

	it("renders children", () => {
		render(<MagneticButton>Hover me</MagneticButton>);
		expect(screen.getByText("Hover me")).toBeInTheDocument();
	});

	it("handles mouse events without throwing", async () => {
		render(<MagneticButton>Move</MagneticButton>);
		const btn = screen.getByRole("button");
		await userEvent.hover(btn);
		await userEvent.unhover(btn);
		expect(btn).toBeInTheDocument();
	});

	it("forwards onClick prop", async () => {
		let clicked = false;
		render(
			<MagneticButton
				onClick={() => {
					clicked = true;
				}}
			>
				Click
			</MagneticButton>,
		);
		await userEvent.click(screen.getByRole("button"));
		expect(clicked).toBe(true);
	});
});
