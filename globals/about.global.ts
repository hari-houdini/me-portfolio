/**
 * about.global.ts
 *
 * Singleton global — holds the About section content.
 *
 * Access:
 *  - read:   public
 *  - update: admin only
 */

import type { GlobalConfig } from "payload";
import { isAdmin } from "../access/is-admin.access";

export const About: GlobalConfig = {
	slug: "about",
	label: "About",
	admin: {
		description: "Bio, skills list, and optional portrait photo.",
	},
	access: {
		read: () => true,
		update: isAdmin,
	},
	fields: [
		{
			name: "bio",
			type: "richText",
			label: "Bio",
			required: true,
			admin: {
				description:
					"Main biography — supports bold, italic, links, and lists.",
			},
		},
		{
			name: "skills",
			type: "array",
			label: "Skills",
			admin: {
				description: 'Technology / skill tags e.g. "TypeScript", "Three.js".',
			},
			fields: [
				{
					name: "skill",
					type: "text",
					required: true,
				},
			],
		},
		{
			name: "photo",
			type: "upload",
			relationTo: "media",
			label: "Portrait Photo",
			admin: {
				description: "Optional portrait displayed in the About section.",
			},
		},
	],
};
