/**
 * About.ts
 *
 * Singleton global — bio rich text, skills list, and portrait photo.
 *
 * REST API endpoint: GET /api/globals/about
 *
 * Note on skills field:
 *   Payload wraps each array item in an object: [{id, skill: "React"}].
 *   The portfolio Zod schema handles this via a union transform.
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
		description: "Biography, skills, and portrait photo for the About section.",
	},
	access: {
		read: () => true,
		update: isAdmin,
	},
	fields: [
		{
			name: "bio",
			type: "richText",
			label: "Biography",
			admin: {
				description: "Your bio shown in the About section. Supports rich text.",
			},
		},
		{
			name: "skills",
			type: "array",
			label: "Skills / Technologies",
			admin: {
				description:
					'List of technologies you work with, e.g. "React", "TypeScript".',
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
				description: "Optional headshot displayed in the About section.",
			},
		},
	],
};
