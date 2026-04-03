/**
 * work-config.global.ts
 *
 * Singleton global — controls the visual style of the Work section.
 *
 * Access:
 *  - read:   public
 *  - update: admin only
 */

import type { GlobalConfig } from "payload";
import { isAdmin } from "../access/is-admin.access";
import { BACKGROUND_OPTIONS, TITLE_EFFECT_OPTIONS } from "./style-options";

export const WorkConfig: GlobalConfig = {
	slug: "work-config",
	label: "Work Section Style",
	admin: {
		description:
			"Controls the background, heading effect, and project card style for the Work section.",
	},
	access: {
		read: () => true,
		update: isAdmin,
	},
	fields: [
		{
			name: "workStyle",
			type: "group",
			label: "Work Style",
			fields: [
				{
					name: "background",
					type: "select",
					label: "Section Background",
					options: BACKGROUND_OPTIONS,
					defaultValue: "none",
					admin: {
						description:
							"Animated background rendered behind the Work section.",
					},
				},
				{
					name: "titleEffect",
					type: "select",
					label: "Heading Effect",
					options: TITLE_EFFECT_OPTIONS,
					defaultValue: "none",
					admin: {
						description: "Animation effect applied to the section heading.",
					},
				},
				{
					name: "projectCardStyle",
					type: "select",
					label: "Project Card Style",
					options: [
						{ label: "Glow", value: "glow" },
						{ label: "Spotlight", value: "spotlight" },
						{ label: "Tilt", value: "tilt" },
						{ label: "Flip", value: "flip" },
						{ label: "Glassmorphism", value: "glassmorphism" },
						{ label: "Border Beam", value: "border-beam" },
					],
					defaultValue: "glow",
					admin: {
						description: "Hover interaction style for project cards.",
					},
				},
			],
		},
	],
};
