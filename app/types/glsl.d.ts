/**
 * glsl.d.ts — type declarations for GLSL shader imports
 *
 * vite-plugin-glsl transforms .glsl/.vert/.frag files into typed string
 * constants at build time. This declaration file tells TypeScript about
 * those module types so imports don't produce "Cannot find module" errors.
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
