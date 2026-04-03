/**
 * ui-config.global.ts
 *
 * Singleton global — controls shared UI configuration for the portfolio.
 * Currently holds the world map location dots shown in the Contact section.
 *
 * Access:
 *  - read:   public
 *  - update: admin only
 */

import type { GlobalConfig } from "payload";
import { isAdmin } from "../access/is-admin.access";

export const UIConfig: GlobalConfig = {
	slug: "ui-config",
	label: "UI Configuration",
	admin: {
		description:
			"Shared UI settings — world map locations and other portfolio-wide visual config.",
	},
	access: {
		read: () => true,
		update: isAdmin,
	},
	fields: [
		{
			name: "worldMapLocations",
			type: "array",
			label: "World Map Locations",
			admin: {
				description:
					"Client / collaboration locations shown as dots on the world map in the Contact section. Enter a label, latitude, and longitude for each location.",
			},
			fields: [
				{
					name: "label",
					type: "text",
					required: true,
					admin: {
						description: 'Display name for this location e.g. "London, UK".',
					},
				},
				{
					name: "lat",
					type: "number",
					required: true,
					admin: {
						description: "Latitude in decimal degrees (e.g. 51.5074).",
					},
				},
				{
					name: "lng",
					type: "number",
					required: true,
					admin: {
						description: "Longitude in decimal degrees (e.g. -0.1278).",
					},
				},
			],
		},
	],
};
