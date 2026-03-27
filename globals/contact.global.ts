/**
 * contact.global.ts
 *
 * Singleton global — holds the Contact section content.
 *
 * Access:
 *  - read:   public
 *  - update: admin only
 */

import type { GlobalConfig } from "payload";
import { isAdmin } from "../access/is-admin.access";

export const Contact: GlobalConfig = {
	slug: "contact",
	label: "Contact",
	admin: {
		description: "Contact email, call-to-action text, and social links.",
	},
	access: {
		read: () => true,
		update: isAdmin,
	},
	fields: [
		{
			name: "email",
			type: "email",
			label: "Email",
			required: true,
			admin: {
				description: "Primary contact email — rendered as selectable text.",
			},
		},
		{
			name: "ctaText",
			type: "text",
			label: "Call-to-Action Text",
			defaultValue: "Let's work together",
			admin: {
				description: 'Label above the email link e.g. "Let\'s work together".',
			},
		},
		{
			name: "socials",
			type: "array",
			label: "Social Links",
			admin: {
				description:
					"Links to social profiles. Each entry has a platform, URL, and display label.",
			},
			fields: [
				{
					name: "platform",
					type: "select",
					required: true,
					options: [
						{ label: "GitHub", value: "github" },
						{ label: "LinkedIn", value: "linkedin" },
						{ label: "Twitter / X", value: "twitter" },
						{ label: "Instagram", value: "instagram" },
						{ label: "Dribbble", value: "dribbble" },
						{ label: "Behance", value: "behance" },
						{ label: "Other", value: "other" },
					],
				},
				{
					name: "url",
					type: "text",
					label: "URL",
					required: true,
				},
				{
					name: "label",
					type: "text",
					label: "Display Label",
					required: true,
					admin: {
						description: 'Accessible text for the link e.g. "GitHub profile".',
					},
				},
			],
		},
	],
};
