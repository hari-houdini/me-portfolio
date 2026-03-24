/**
 * mod.ts — public interface of the `nav` pod
 *
 * Exports:
 *  - SectionNav component — fixed right-side section indicator with liquid glass
 *  - LiquidGlass component — SVG feDisplacementMap glass effect (composable)
 *  - SectionNavProps type
 */

export type { LiquidGlassProps } from "./liquid-glass.client.component";
export { LiquidGlass } from "./liquid-glass.client.component";
export type { SectionNavProps } from "./section-nav.client.component";
export { SectionNav } from "./section-nav.client.component";
