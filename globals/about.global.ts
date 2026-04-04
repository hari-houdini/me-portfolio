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
import { RichTextLabel } from "../collections/components/rich-text-label";
import { BACKGROUND_OPTIONS, TITLE_EFFECT_OPTIONS } from "./style-options";

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
				components: {
					// Render as <span> — avoids invalid htmlFor on Lexical's div[contenteditable].
					// biome-ignore lint/suspicious/noExplicitAny: Payload component type is loose
					Label: RichTextLabel as any,
				},
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
		// ---- About style ------------------------------------------------
		{
			name: "aboutStyle",
			type: "group",
			label: "About Style",
			fields: [
				{
					name: "background",
					type: "select",
					label: "Section Background",
					options: BACKGROUND_OPTIONS,
					defaultValue: "none",
					admin: {
						description:
							"Animated background rendered behind the About section.",
					},
				},
				{
					name: "titleEffect",
					type: "select",
					label: "Heading Effect",
					options: TITLE_EFFECT_OPTIONS,
					defaultValue: "none",
					admin: {
						description: "Animation effect applied to the About heading.",
					},
				},
			],
		},
	],
};
