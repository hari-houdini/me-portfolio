"use client";

import type { BackgroundVariant } from "@cms/mod";
import { lazy, Suspense, useEffect, useRef, useState } from "react";

// Lazy-loaded variant components — only loaded when needed
const AuroraBackground = lazy(() =>
	import("./aurora/aurora.client.component").then((m) => ({
		default: m.AuroraBackground,
	})),
);
const ParticlesBackground = lazy(() =>
	import("./particles-background.client.component").then((m) => ({
		default: m.ParticlesBackground,
	})),
);
const WavesBackground = lazy(() =>
	import("./waves-background.client.component").then((m) => ({
		default: m.WavesBackground,
	})),
);
const MeteorsBackground = lazy(() =>
	import("./meteors-background.client.component").then((m) => ({
		default: m.MeteorsBackground,
	})),
);
const GridBackground = lazy(() =>
	import("./grid-background.component").then((m) => ({
		default: m.GridBackground,
	})),
);
const NoiseBackground = lazy(() =>
	import("./noise-background.client.component").then((m) => ({
		default: m.NoiseBackground,
	})),
);
const BeamsBackground = lazy(() =>
	import("./beams-background.client.component").then((m) => ({
		default: m.BeamsBackground,
	})),
);
const VortexBackground = lazy(() =>
	import("./vortex-background.client.component").then((m) => ({
		default: m.VortexBackground,
	})),
);
const OrbsBackground = lazy(() =>
	import("./orbs-background.client.component").then((m) => ({
		default: m.OrbsBackground,
	})),
);
const RippleBackground = lazy(() =>
	import("./ripple-background.client.component").then((m) => ({
		default: m.RippleBackground,
	})),
);

interface SectionBackgroundProps {
	variant: BackgroundVariant | string | null | undefined;
}

function hasWebGL2(): boolean {
	try {
		const canvas = document.createElement("canvas");
		return !!canvas.getContext("webgl2");
	} catch {
		return false;
	}
}

function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SectionBackground({ variant }: SectionBackgroundProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);
	const [canRender, setCanRender] = useState(false);

	// Check capability once — WebGL2 + motion preference
	useEffect(() => {
		if (variant === "grid") {
			// CSS-only — always can render
			setCanRender(true);
			return;
		}
		if (!hasWebGL2() || prefersReducedMotion()) {
			setCanRender(false);
			return;
		}
		setCanRender(true);
	}, [variant]);

	// IntersectionObserver — only mount Three.js canvas when in viewport
	useEffect(() => {
		if (!canRender || !containerRef.current) return;
		const el = containerRef.current;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.05 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [canRender]);

	if (!variant || variant === "none" || !canRender) return null;

	return (
		<div
			ref={containerRef}
			style={{
				position: "absolute",
				inset: 0,
				pointerEvents: "none",
				zIndex: 0,
			}}
			aria-hidden="true"
		>
			{visible && (
				<Suspense fallback={null}>
					{variant === "aurora" && <AuroraBackground />}
					{variant === "particles" && <ParticlesBackground />}
					{variant === "waves" && <WavesBackground />}
					{variant === "meteors" && <MeteorsBackground />}
					{variant === "grid" && <GridBackground />}
					{variant === "noise" && <NoiseBackground />}
					{variant === "beams" && <BeamsBackground />}
					{variant === "vortex" && <VortexBackground />}
					{variant === "orbs" && <OrbsBackground />}
					{variant === "ripple" && <RippleBackground />}
				</Suspense>
			)}
		</div>
	);
}
