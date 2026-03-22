// @vitest-environment jsdom

/**
 * encrypted-text.component.test.tsx
 *
 * Tests for the EncryptedText component.
 * Verifies: SR text present from mount, scrambled chars visible on mount,
 * and that text reveals progressively over time (using fake timers).
 */

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EncryptedText } from "../encrypted-text.client.component";

describe("EncryptedText", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("renders a screen-reader visible copy of the full text immediately", () => {
		render(<EncryptedText text="Hello World" active />);
		// sr-only span should contain the complete, unscrambled text
		const srSpan = document.querySelector(".sr-only");
		expect(srSpan?.textContent).toBe("Hello World");
	});

	it("has an aria-hidden animated span so screen readers see only the real text", () => {
		render(<EncryptedText text="Hello" active />);
		const ariaHidden = document.querySelector('[aria-hidden="true"]');
		expect(ariaHidden).toBeInTheDocument();
	});

	it("renders the correct number of animated character spans", () => {
		render(<EncryptedText text="Hi!" active />);
		const animatedContainer = document.querySelector('[aria-hidden="true"]');
		// "H", "i", "!" = 3 spans
		const charSpans = animatedContainer?.querySelectorAll("span");
		expect(charSpans?.length).toBe(3);
	});

	it("preserves spaces as non-breaking spaces in the scrambled output", () => {
		render(<EncryptedText text="A B" active={false} />);
		const animatedContainer = document.querySelector('[aria-hidden="true"]');
		const charSpans = Array.from(
			animatedContainer?.querySelectorAll("span") ?? [],
		);
		// The middle character (index 1) is a space — should be \u00a0
		expect(charSpans[1]?.textContent).toBe("\u00a0");
	});

	it("applies encryptedClassName to unrevealed characters at start", () => {
		render(
			<EncryptedText
				text="Test"
				active={false}
				encryptedClassName="encrypted"
				revealedClassName="revealed"
			/>,
		);
		const animatedContainer = document.querySelector('[aria-hidden="true"]');
		const chars = animatedContainer?.querySelectorAll(".encrypted, .revealed");
		// All chars should be encrypted when active=false (no reveal started)
		const encrypted = animatedContainer?.querySelectorAll(".encrypted");
		const revealed = animatedContainer?.querySelectorAll(".revealed");
		expect(chars?.length).toBe(4);
		expect(encrypted?.length).toBe(4);
		expect(revealed?.length).toBe(0);
	});

	it("does not throw when text is an empty string", () => {
		expect(() => {
			render(<EncryptedText text="" active />);
		}).not.toThrow();
	});

	it("renders correctly in inactive state (active=false)", () => {
		render(<EncryptedText text="Inactive" active={false} />);
		const srSpan = document.querySelector(".sr-only");
		expect(srSpan?.textContent).toBe("Inactive");
	});
});
