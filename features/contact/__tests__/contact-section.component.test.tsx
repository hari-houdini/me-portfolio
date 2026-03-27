import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ContactData } from "../../cms/cms.schema";
import { mockContact } from "../../test/fixtures/cms.fixtures";
import { ContactSection } from "../contact-section.component";

describe("ContactSection", () => {
	it("renders section heading", () => {
		render(<ContactSection contact={mockContact} />);
		expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
			"Contact",
		);
	});

	it("renders custom section title", () => {
		render(
			<ContactSection contact={mockContact} sectionTitle="Get in Touch" />,
		);
		expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
			"Get in Touch",
		);
	});

	it("renders email as mailto link", () => {
		render(<ContactSection contact={mockContact} />);
		const link = screen.getByRole("link", { name: "hello@harihoudini.dev" });
		expect(link).toHaveAttribute("href", "mailto:hello@harihoudini.dev");
	});

	it("renders cta text when present", () => {
		render(<ContactSection contact={mockContact} />);
		expect(screen.getByText("Let's work together")).toBeInTheDocument();
	});

	it("does not render cta text when null", () => {
		const noCtaText: ContactData = { ...mockContact, ctaText: null };
		render(<ContactSection contact={noCtaText} />);
		expect(screen.queryByText("Let's work together")).not.toBeInTheDocument();
	});

	it("renders social links list", () => {
		render(<ContactSection contact={mockContact} />);
		expect(
			screen.getByRole("list", { name: "Social links" }),
		).toBeInTheDocument();
	});

	it("renders each social link", () => {
		render(<ContactSection contact={mockContact} />);
		expect(
			screen.getByRole("link", { name: "GitHub profile" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "LinkedIn profile" }),
		).toBeInTheDocument();
	});

	it("does not render social links list when socials is empty", () => {
		const noSocials: ContactData = { ...mockContact, socials: [] };
		render(<ContactSection contact={noSocials} />);
		expect(
			screen.queryByRole("list", { name: "Social links" }),
		).not.toBeInTheDocument();
	});

	it("does not render social links list when socials is null", () => {
		const noSocials: ContactData = { ...mockContact, socials: null };
		render(<ContactSection contact={noSocials} />);
		expect(
			screen.queryByRole("list", { name: "Social links" }),
		).not.toBeInTheDocument();
	});
});
