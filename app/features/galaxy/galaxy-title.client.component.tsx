/**
 * galaxy-title.tsx — 3D section title rendered inside the Three.js scene
 *
 * Uses @react-three/drei's <Text> component which is backed by troika-three-text.
 * The font is loaded from Google Fonts (Outfit TTF) — compatible with troika.
 *
 * The title appears to float within the galaxy scene at a specified world-space
 * position. It faces the camera at all times via the default behaviour of
 * drei's Text component.
 */

"use client";

import { Text } from "@react-three/drei";

export interface GalaxyTitleProps {
	/** The text to display */
	text: string;
	/** World-space position [x, y, z] */
	position?: [number, number, number];
	/** Font size in world units */
	fontSize?: number;
	/** Hex colour string */
	color?: string;
	/** Text opacity 0→1 */
	opacity?: number;
}

const FONT_URL =
	"https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4G-EiAou6Y.woff";

export function GalaxyTitle({
	text,
	position = [0, 8, 0],
	fontSize = 4,
	color = "#f0f0f5",
	opacity = 1,
}: GalaxyTitleProps) {
	return (
		<Text
			position={position}
			fontSize={fontSize}
			color={color}
			font={FONT_URL}
			anchorX="center"
			anchorY="middle"
			fillOpacity={opacity}
			outlineWidth={0.05}
			outlineColor="#000005"
			outlineOpacity={opacity * 0.5}
			letterSpacing={0.02}
		>
			{text}
		</Text>
	);
}
