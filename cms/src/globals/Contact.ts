/**
 * Contact.ts
 *
 * Singleton global — email, call-to-action text, and social links.
 *
 * REST API endpoint: GET /api/globals/contact
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
		description: "Email address, CTA text, and social media links.",
	},
	access: {
		read: () => true,
		update: isAdmin,
	},
	fields: [
		{
			name: "email",
			type: "email",
			required: true,
			defaultValue: "hello@harihoudini.dev",
		},
		{
			name: "ctaText",
			type: "text",
			label: "Call-to-Action Text",
			defaultValue: "Let's work together",
			admin: {
				description:
					'The label on the contact button, e.g. "Let\'s work together".',
			},
		},
		{
			name: "socials",
			type: "array",
			label: "Social Links",
			admin: {
				description: "Social media profiles shown in the contact section.",
			},
			fields: [
				{
					name: "platform",
					type: "select",
					required: true,
					options: [
						{ label: "GitHub", value: "github" },
						{ label: "Twitter / X", value: "twitter" },
						{ label: "LinkedIn", value: "linkedin" },
						{ label: "Instagram", value: "instagram" },
						{ label: "YouTube", value: "youtube" },
						{ label: "Dribbble", value: "dribbble" },
					],
				},
				{
					name: "url",
					type: "text",
					required: true,
					admin: {
						description: "Full URL including https://",
					},
				},
				{
					name: "label",
					type: "text",
					required: true,
					admin: {
						description: 'Display label, e.g. "GitHub" or "@hari_houdini".',
					},
				},
			],
		},
	],
};
