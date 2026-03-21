/**
 * car-lights.tsx — animated car light trails
 *
 * Renders cars as pairs of bright points (head/tail lights) moving along
 * the city grid roads. Each car is a simple animated object — position
 * is updated each frame by lerping along the route.
 *
 * Performance: cars are rendered as a single Points geometry with per-point
 * colour attributes. The CPU updates positions every frame via BufferAttribute
 * needsUpdate. With <200 cars this is acceptable; for larger counts,
 * instancing or a vertex shader approach would be preferable.
 */

"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { CarRoute } from "./city-generator";

const CAR_COUNT = 120;
const CAR_SPEED_MIN = 5; // world units per second
const CAR_SPEED_MAX = 20;

interface Car {
	routeIndex: number;
	progress: number; // 0→1 along route
	speed: number;
	direction: 1 | -1;
}

interface CarLightsProps {
	routes: CarRoute[];
	opacity?: number;
}

export function CarLights({ routes, opacity = 1 }: CarLightsProps) {
	// Two points per car (head + tail lights) × 2 (front pair + rear pair)
	const POINT_COUNT = CAR_COUNT * 2;

	const positionsRef = useRef<Float32Array>(new Float32Array(POINT_COUNT * 3));
	const colorsRef = useRef<Float32Array>(new Float32Array(POINT_COUNT * 3));
	const pointsRef = useRef<THREE.Points>(null);

	// Initialise car state
	const cars = useMemo<Car[]>(() => {
		if (routes.length === 0) return [];
		return Array.from({ length: CAR_COUNT }, (_, i) => ({
			routeIndex: i % routes.length,
			progress: Math.random(),
			speed: CAR_SPEED_MIN + Math.random() * (CAR_SPEED_MAX - CAR_SPEED_MIN),
			direction: Math.random() > 0.5 ? 1 : -1,
		}));
	}, [routes]);

	const geometry = useMemo(() => {
		const geo = new THREE.BufferGeometry();
		geo.setAttribute(
			"position",
			new THREE.BufferAttribute(positionsRef.current, 3),
		);
		geo.setAttribute("color", new THREE.BufferAttribute(colorsRef.current, 3));
		return geo;
	}, []);

	useFrame((_, delta) => {
		if (routes.length === 0) return;

		const pos = positionsRef.current;
		const col = colorsRef.current;

		for (let i = 0; i < cars.length; i++) {
			const car = cars[i];
			car.progress += (car.speed * delta * car.direction) / 100;
			if (car.progress > 1) car.progress = 0;
			if (car.progress < 0) car.progress = 1;

			const route = routes[car.routeIndex];
			const x = route.start[0] + (route.end[0] - route.start[0]) * car.progress;
			const z = route.start[1] + (route.end[1] - route.start[1]) * car.progress;

			// Head lights — white (index i*2)
			const hi = i * 2 * 3;
			pos[hi] = x;
			pos[hi + 1] = 0.5;
			pos[hi + 2] = z;
			col[hi] = 1;
			col[hi + 1] = 0.95;
			col[hi + 2] = 0.8;

			// Tail lights — red (index i*2+1)
			const ti = (i * 2 + 1) * 3;
			const offset = car.direction * -0.5;
			const dx = route.end[0] - route.start[0];
			const dz = route.end[1] - route.start[1];
			const len = Math.sqrt(dx * dx + dz * dz) || 1;
			pos[ti] = x + (dx / len) * offset;
			pos[ti + 1] = 0.5;
			pos[ti + 2] = z + (dz / len) * offset;
			col[ti] = 1;
			col[ti + 1] = 0.05;
			col[ti + 2] = 0.05;
		}

		const geo = pointsRef.current?.geometry;
		if (geo) {
			(geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
			(geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
		}
	});

	return (
		<points ref={pointsRef} geometry={geometry}>
			<pointsMaterial
				vertexColors
				size={1.5}
				sizeAttenuation
				transparent
				opacity={opacity}
				depthWrite={false}
				blending={THREE.AdditiveBlending}
			/>
		</points>
	);
}
