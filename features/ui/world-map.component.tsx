/**
 * world-map.component.tsx
 *
 * Async RSC — generates a dotted SVG world map with glowing location pins.
 * Uses the `dotted-map` package (pure computation, no browser APIs — safe in RSC).
 *
 * Receives locations from the CMS UIConfig global. If no locations are provided,
 * renders the base map without any pins.
 */

import DottedMap from "dotted-map";
import styles from "./world-map.module.css";

interface Location {
	label: string;
	lat: number;
	lng: number;
}

interface WorldMapProps {
	locations?: Location[] | null;
}

export function WorldMap({ locations }: WorldMapProps) {
	const map = new DottedMap({ height: 60, grid: "diagonal" });

	const pins = locations ?? [];
	for (const loc of pins) {
		map.addPin({
			lat: loc.lat,
			lng: loc.lng,
			svgOptions: { color: "#00F7FF", radius: 0.6 },
		});
	}

	const svgString = map.getSVG({
		radius: 0.18,
		color: "rgba(255,255,255,0.15)",
		shape: "circle",
		backgroundColor: "transparent",
	});

	return (
		<figure className={styles.mapWrapper} aria-label="World map with locations">
			<div
				className={styles.map}
				// biome-ignore lint/security/noDangerouslySetInnerHtml: server-generated SVG from dotted-map — no user input
				dangerouslySetInnerHTML={{ __html: svgString }}
			/>
			{pins.length > 0 ? (
				<figcaption className={styles.srOnly}>
					Locations: {pins.map((l) => l.label).join(", ")}
				</figcaption>
			) : null}
		</figure>
	);
}
