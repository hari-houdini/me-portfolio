// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BorderBeamCard } from "../cards/border-beam-card.client.component";
import { FlipCard } from "../cards/flip-card.component";
import { GlassmorphismCard } from "../cards/glassmorphism-card.component";
import { GlowCard } from "../cards/glow-card.client.component";
import { SpotlightCard } from "../cards/spotlight-card.client.component";
import { TiltCard } from "../cards/tilt-card.client.component";

describe("GlowCard", () => {
	it("renders children", () => {
		render(<GlowCard>Card content</GlowCard>);
		expect(screen.getByText("Card content")).toBeInTheDocument();
	});
});

describe("BorderBeamCard", () => {
	it("renders children", () => {
		render(<BorderBeamCard>Beam card</BorderBeamCard>);
		expect(screen.getByText("Beam card")).toBeInTheDocument();
	});
});

describe("GlassmorphismCard", () => {
	it("renders children", () => {
		render(<GlassmorphismCard>Glass content</GlassmorphismCard>);
		expect(screen.getByText("Glass content")).toBeInTheDocument();
	});
});

describe("FlipCard", () => {
	it("renders front content", () => {
		render(
			<FlipCard
				front={<span>Front side</span>}
				back={<span>Back side</span>}
			/>,
		);
		expect(screen.getByText("Front side")).toBeInTheDocument();
	});

	it("renders back content", () => {
		render(
			<FlipCard front={<span>Front</span>} back={<span>Back side</span>} />,
		);
		expect(screen.getByText("Back side")).toBeInTheDocument();
	});
});

describe("SpotlightCard", () => {
	it("renders children", () => {
		render(<SpotlightCard>Spotlight content</SpotlightCard>);
		expect(screen.getByText("Spotlight content")).toBeInTheDocument();
	});

	it("handles mouse move without throwing", async () => {
		render(<SpotlightCard>Hover target</SpotlightCard>);
		const el = screen.getByText("Hover target").parentElement as HTMLElement;
		await userEvent.hover(el);
		expect(screen.getByText("Hover target")).toBeInTheDocument();
	});
});

describe("TiltCard", () => {
	it("renders children", () => {
		render(<TiltCard>Tilt content</TiltCard>);
		expect(screen.getByText("Tilt content")).toBeInTheDocument();
	});

	it("handles mouse leave without throwing", async () => {
		render(<TiltCard>Tilt target</TiltCard>);
		const el = screen.getByText("Tilt target").parentElement as HTMLElement;
		await userEvent.hover(el);
		await userEvent.unhover(el);
		expect(screen.getByText("Tilt target")).toBeInTheDocument();
	});
});
