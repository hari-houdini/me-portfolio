/**
 * canvas-placeholder.iso.component.tsx
 *
 * Isomorphic wrapper — Server Component that lazy-loads the Three.js canvas
 * (Client Component) via React.lazy + Suspense.
 *
 * Benefits:
 *  - Three.js bundle is off the critical rendering path (loads after hydration)
 *  - SSR renders `null` via Suspense fallback — no layout shift
 *  - Canvas initialises only in the browser, never on the server
 */

import { lazy, Suspense } from "react";

const ThreeCanvas = lazy(() =>
	import("./three-canvas.client.component").then((m) => ({
		default: m.ThreeCanvas,
	})),
);

export function CanvasPlaceholder() {
	return (
		<Suspense fallback={null}>
			<ThreeCanvas />
		</Suspense>
	);
}
