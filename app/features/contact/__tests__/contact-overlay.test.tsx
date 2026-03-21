// @vitest-environment jsdom

/**
 * contact-overlay.test.tsx
 *
 * Tests for the ContactOverlay component.
 * Verifies email link, social links, CTA text, and fallbacks.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	mockContact,
	mockContactMinimal,
	mockSiteConfig,
} from "~/test/fixtures/cms.fixtures";
import { ContactOverlay } from "../contact-overlay.iso.component";

// Use a simple siteConfig and contact for tests that assert on text content
// — zocker generates long multiline strings that getByText can't reliably match.
const simpleSiteConfig = {
	...mockSiteConfig,
	sectionTitles: {
		hero: "Hello, Universe",
		about: "About",
		work: "Work",
		contact: "Contact",
	},
};

const simpleContact = {
	...mockContact,
	email: "hello@harihoudini.dev",
	ctaText: "Let's work together",
	socials: [],
};

describe("ContactOverlay: renders contact data correctly", () => {
	it("renders the contact section title from siteConfig", () => {
		render(
			<ContactOverlay
				contact={simpleContact}
				siteConfig={simpleSiteConfig}
				visible
			/>,
		);
		expect(screen.getByText("Contact")).toBeInTheDocument();
	});

	it("renders the CTA text", () => {
		render(
			<ContactOverlay
				contact={simpleContact}
				siteConfig={simpleSiteConfig}
				visible
			/>,
		);
		expect(screen.getByText("Let's work together")).toBeInTheDocument();
	});

	it("renders the email as a selectable mailto link", () => {
		render(
			<ContactOverlay
				contact={simpleContact}
				siteConfig={simpleSiteConfig}
				visible
			/>,
		);
		const emailLink = screen.getByRole("link", {
			name: /send email to hello@harihoudini\.dev/i,
		});
		expect(emailLink).toHaveAttribute("href", "mailto:hello@harihoudini.dev");
		// Email should be visible text — not obfuscated
		expect(emailLink).toHaveTextContent("hello@harihoudini.dev");
	});

	it("renders social links as a nav when socials are present", () => {
		const contact = {
			...simpleContact,
			socials: [
				{ platform: "github", url: "https://github.com/user", label: "GitHub" },
				{
					platform: "linkedin",
					url: "https://linkedin.com/in/user",
					label: "LinkedIn",
				},
			],
		};
		render(
			<ContactOverlay
				contact={contact}
				siteConfig={simpleSiteConfig}
				visible
			/>,
		);
		const nav = screen.getByRole("navigation", { name: /social media links/i });
		expect(nav).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /github profile/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /linkedin profile/i }),
		).toBeInTheDocument();
	});

	it("does not render social nav when socials array is empty", () => {
		render(
			<ContactOverlay
				contact={mockContactMinimal}
				siteConfig={simpleSiteConfig}
				visible
			/>,
		);
		expect(
			screen.queryByRole("navigation", { name: /social/i }),
		).not.toBeInTheDocument();
	});

	it("social links open in new tab with noopener noreferrer", () => {
		const contact = {
			...simpleContact,
			socials: [
				{ platform: "github", url: "https://github.com/user", label: "GitHub" },
			],
		};
		render(
			<ContactOverlay
				contact={contact}
				siteConfig={simpleSiteConfig}
				visible
			/>,
		);
		const link = screen.getByRole("link", { name: /github profile/i });
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noopener noreferrer");
	});

	it("section has accessible landmark label", () => {
		render(
			<ContactOverlay
				contact={simpleContact}
				siteConfig={simpleSiteConfig}
				visible
			/>,
		);
		expect(
			screen.getByRole("region", { name: /contact section/i }),
		).toBeInTheDocument();
	});
});
