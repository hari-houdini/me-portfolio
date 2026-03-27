/**
 * liquid-glass.client.component.tsx — SVG displacement-map glass effect
 *
 * React port of Inspira UI's LiquidGlass.vue (Vue/Nuxt, MIT licence).
 * Original: https://github.com/unovue/inspira-ui — adapted for React.
 *
 * Technique:
 *  An inline SVG <filter> splits the element's backdrop into R, G, B channels,
 *  displaces each by a slightly different amount using a generated SVG
 *  displacement map (red/blue gradient corners), then blends them back via
 *  feBlend mode="screen". This creates chromatic aberration that reads as
 *  refractive glass.
 *
 *  The displacement SVG is regenerated whenever the element resizes
 *  (ResizeObserver), keeping the effect correctly shaped at any size.
 *
 * Browser compatibility:
 *  backdrop-filter: url(#filter) has limited support — falls back to a plain
 *  frosted glass appearance on browsers / GPUs that can't sample WebGL canvas
 *  content. This is an accepted degradation (user confirmed).
 */

"use client";

import { useEffect, useRef, useState } from "react";

export interface LiquidGlassProps {
	radius?: number;
	border?: number;
	lightness?: number;
	blur?: number;
	scale?: number;
	rOffset?: number;
	gOffset?: number;
	bOffset?: number;
	frost?: number;
	xChannel?: "R" | "G" | "B";
	yChannel?: "R" | "G" | "B";
	blend?: string;
	alpha?: number;
	className?: string;
	children?: React.ReactNode;
}

// Unique ID counter — prevents filter ID collisions when multiple glass
// elements are on the page simultaneously.
let idCounter = 0;

export function LiquidGlass({
	radius = 16,
	border = 0.07,
	lightness = 50,
	blur = 11,
	scale = -180,
	rOffset = 0,
	gOffset = 10,
	bOffset = 20,
	frost = 0.05,
	xChannel = "R",
	yChannel = "B",
	blend = "difference",
	alpha = 0.93,
	className,
	children,
}: LiquidGlassProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	// Stable unique ID for the SVG filter — allocated once per mount.
	const filterId = useRef(`lg-${++idCounter}`).current;

	// Track element size so the displacement SVG matches the element exactly.
	useEffect(() => {
		const el = rootRef.current;
		if (!el) return;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;
			const { inlineSize: w, blockSize: h } = entry.borderBoxSize?.[0] ?? {
				inlineSize: entry.contentRect.width,
				blockSize: entry.contentRect.height,
			};
			setDimensions({ width: w, height: h });
		});

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const { width: w, height: h } = dimensions;
	const bx = Math.min(w, h) * border * 0.5;
	const by = Math.min(w, h) * border * 0.5;

	// Inline SVG displacement map — red gradient (horizontal) + blue gradient
	// (vertical) create the anisotropic refraction. The inner rounded rect
	// provides the frosted glass body.
	const displacementSvg =
		w > 0 && h > 0
			? `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="red-${filterId}" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="#0000"/>
              <stop offset="100%" stop-color="red"/>
            </linearGradient>
            <linearGradient id="blue-${filterId}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#0000"/>
              <stop offset="100%" stop-color="blue"/>
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="${w}" height="${h}" fill="black"/>
          <rect x="0" y="0" width="${w}" height="${h}" rx="${radius}" fill="url(#red-${filterId})"/>
          <rect x="0" y="0" width="${w}" height="${h}" rx="${radius}" fill="url(#blue-${filterId})" style="mix-blend-mode:${blend}"/>
          <rect x="${bx}" y="${by}" width="${w - bx * 2}" height="${h - by * 2}" rx="${radius}" fill="hsl(0 0% ${lightness}% / ${alpha})" style="filter:blur(${blur}px)"/>
        </svg>`
			: "";

	const displacementUri = displacementSvg
		? `data:image/svg+xml,${encodeURIComponent(displacementSvg)}`
		: "";

	return (
		<div
			ref={rootRef}
			className={className}
			style={{
				position: "relative",
				borderRadius: `${radius}px`,
				// Chromatic aberration glass effect via SVG displacement filter
				backdropFilter: displacementUri ? `url(#${filterId})` : "blur(12px)",
				// Fallback: frosted glass when backdrop-filter can't sample canvas
				background: `hsl(0 0% 0% / ${frost})`,
				boxShadow: `
          0 0 2px 1px color-mix(in oklch, white, #0000 90%) inset,
          0 0 10px 4px color-mix(in oklch, white, #0000 95%) inset,
          0px 4px 16px rgba(17,17,26,0.08),
          0px 8px 32px rgba(17,17,26,0.06)
        `,
			}}
		>
			{/* Slot content */}
			<div
				style={{
					width: "100%",
					height: "100%",
					overflow: "hidden",
					borderRadius: "inherit",
				}}
			>
				{children}
			</div>

			{/* SVG filter — inlined in the DOM so backdrop-filter can reference it */}
			{displacementUri && (
				<svg
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						pointerEvents: "none",
					}}
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
				>
					<defs>
						<filter id={filterId} colorInterpolationFilters="sRGB">
							<feImage
								x="0"
								y="0"
								width="100%"
								height="100%"
								href={displacementUri}
								result="map"
							/>
							<feDisplacementMap
								in="SourceGraphic"
								in2="map"
								xChannelSelector={xChannel}
								yChannelSelector={yChannel}
								scale={scale + rOffset}
								result="dispRed"
							/>
							<feColorMatrix
								in="dispRed"
								type="matrix"
								values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
								result="red"
							/>
							<feDisplacementMap
								in="SourceGraphic"
								in2="map"
								xChannelSelector={xChannel}
								yChannelSelector={yChannel}
								scale={scale + gOffset}
								result="dispGreen"
							/>
							<feColorMatrix
								in="dispGreen"
								type="matrix"
								values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
								result="green"
							/>
							<feDisplacementMap
								in="SourceGraphic"
								in2="map"
								xChannelSelector={xChannel}
								yChannelSelector={yChannel}
								scale={scale + bOffset}
								result="dispBlue"
							/>
							<feColorMatrix
								in="dispBlue"
								type="matrix"
								values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
								result="blue"
							/>
							<feBlend in="red" in2="green" mode="screen" result="rg" />
							<feBlend in="rg" in2="blue" mode="screen" result="output" />
						</filter>
					</defs>
				</svg>
			)}
		</div>
	);
}
