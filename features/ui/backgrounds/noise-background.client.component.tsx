"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import styles from "./backgrounds.module.css";
import noiseFrag from "./shaders/noise.frag.glsl";

function NoisePlane() {
	const meshRef = useRef<THREE.Mesh>(null);
	const { size } = useThree();

	const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
	// biome-ignore lint/correctness/useExhaustiveDependencies: material created once; uResolution updated via separate useEffect
	const material = useMemo(
		() =>
			new THREE.ShaderMaterial({
				fragmentShader: noiseFrag,
				vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
				uniforms: {
					uTime: { value: 0 },
					uResolution: { value: new THREE.Vector2(size.width, size.height) },
				},
				transparent: true,
				depthWrite: false,
			}),
		[],
	);

	useEffect(() => {
		material.uniforms.uResolution.value.set(size.width, size.height);
	}, [size, material]);

	useFrame(({ clock }) => {
		material.uniforms.uTime.value = clock.getElapsedTime();
	});

	useEffect(
		() => () => {
			geometry.dispose();
			material.dispose();
		},
		[geometry, material],
	);

	return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

export function NoiseBackground() {
	return (
		<div className={styles.canvas} aria-hidden="true">
			<Canvas
				camera={{ position: [0, 0, 1] }}
				gl={{ alpha: true }}
				style={{ width: "100%", height: "100%" }}
			>
				<NoisePlane />
			</Canvas>
		</div>
	);
}
