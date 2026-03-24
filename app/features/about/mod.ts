/**
 * mod.ts — public interface of the `about` pod
 *
 * Exports:
 *  - AboutOverlay component
 *  - AboutOverlayProps type
 *  - extractText utility — Lexical AST → plain string (used by home.tsx sr-only block)
 */

export type { AboutOverlayProps } from "./about-overlay.iso.component";
export { AboutOverlay, extractText } from "./about-overlay.iso.component";
