"use client";

/**
 * fluid-cursor.client.component.tsx
 *
 * Canvas-based custom cursor with neon color trails.
 * - Disabled on touch devices and prefers-reduced-motion
 * - Renders a small glowing dot that follows the mouse with spring physics
 * - Trail points cycle through the 5 neon accents
 */

import { useEffect, useRef } from "react";
import styles from "./fluid-cursor.module.css";

const NEON = ["#00f7ff", "#00ff85", "#ff0099", "#ff8f00", "#7c00fe"];
const TRAIL_LENGTH = 20;
const DOT_RADIUS = 6;

interface Point {
	x: number;
	y: number;
}

export function FluidCursor() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		// Skip on touch devices
		if (window.matchMedia("(pointer: coarse)").matches) return;
		// Skip on reduced motion
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let rafId: number;
		let mouse: Point = { x: -100, y: -100 };
		// Spring follower
		const follower: Point = { x: -100, y: -100 };
		const trail: Point[] = Array.from({ length: TRAIL_LENGTH }, () => ({
			x: -100,
			y: -100,
		}));

		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		resize();
		window.addEventListener("resize", resize);

		const onMove = (e: MouseEvent) => {
			mouse = { x: e.clientX, y: e.clientY };
		};
		window.addEventListener("mousemove", onMove);

		const draw = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Spring physics — follower chases mouse
			follower.x += (mouse.x - follower.x) * 0.18;
			follower.y += (mouse.y - follower.y) * 0.18;

			// Shift trail
			trail.unshift({ ...follower });
			trail.pop();

			// Draw trail segments
			trail.forEach((pt, i) => {
				const alpha = 1 - i / TRAIL_LENGTH;
				const radius = DOT_RADIUS * (1 - i / TRAIL_LENGTH);
				const color = NEON[Math.floor((i / TRAIL_LENGTH) * NEON.length)];
				ctx.beginPath();
				ctx.arc(pt.x, pt.y, Math.max(radius, 1), 0, Math.PI * 2);
				ctx.fillStyle =
					color +
					Math.floor(alpha * 255)
						.toString(16)
						.padStart(2, "0");
				ctx.fill();
			});

			rafId = requestAnimationFrame(draw);
		};
		rafId = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("resize", resize);
		};
	}, []);

	return <canvas ref={canvasRef} className={styles.canvas} />;
}
