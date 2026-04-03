"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import styles from "./backgrounds.module.css";

const PARTICLE_COUNT = 2000;

function Stars() {
	const pointsRef = useRef<THREE.Points>(null);

	const geometry = useMemo(() => {
		const geo = new THREE.BufferGeometry();
		const positions = new Float32Array(PARTICLE_COUNT * 3);
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			positions[i * 3] = (Math.random() - 0.5) * 4;
			positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
			positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
		}
		geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
		return geo;
	}, []);

	const material = useMemo(
		() =>
			new THREE.PointsMaterial({
				color: "#00f7ff",
				size: 1.5,
				sizeAttenuation: false,
				transparent: true,
				opacity: 0.7,
			}),
		[],
	);

	useFrame(({ clock }) => {
		if (!pointsRef.current) return;
		pointsRef.current.rotation.y = clock.getElapsedTime() * 0.04;
		pointsRef.current.rotation.x = clock.getElapsedTime() * 0.02;
	});

	useEffect(
		() => () => {
			geometry.dispose();
			material.dispose();
		},
		[geometry, material],
	);

	return <points ref={pointsRef} geometry={geometry} material={material} />;
}

export function ParticlesBackground() {
	return (
		<div className={styles.canvas} aria-hidden="true">
			<Canvas
				camera={{ position: [0, 0, 2], fov: 75 }}
				gl={{ alpha: true }}
				style={{ width: "100%", height: "100%" }}
			>
				<Stars />
			</Canvas>
		</div>
	);
}
