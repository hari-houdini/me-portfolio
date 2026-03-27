/**
 * glsl.d.ts
 *
 * Type declarations for GLSL shader file imports.
 * raw-loader (configured in next.config.ts) transforms .glsl/.vert/.frag
 * files into string constants at build time.
 */

declare module "*.glsl" {
	const value: string;
	export default value;
}

declare module "*.vert" {
	const value: string;
	export default value;
}

declare module "*.frag" {
	const value: string;
	export default value;
}
