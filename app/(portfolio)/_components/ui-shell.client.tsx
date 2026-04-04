"use client";

/**
 * ui-shell.client.tsx
 *
 * Thin client wrapper that lazy-loads client-only global UI components.
 * Must be "use client" so that next/dynamic with ssr: false is valid.
 * Rendered by the RSC layout.tsx.
 */

import dynamic from "next/dynamic";
import { Suspense } from "react";

const ThemeToggle = dynamic(
	() => import("@features/ui/mod").then((m) => ({ default: m.ThemeToggle })),
	{ ssr: false },
);

const SectionNav = dynamic(
	() => import("@features/ui/mod").then((m) => ({ default: m.SectionNav })),
	{ ssr: false },
);

const FluidCursor = dynamic(
	() => import("@features/ui/mod").then((m) => ({ default: m.FluidCursor })),
	{ ssr: false },
);

export function UIShell() {
	return (
		<>
			<Suspense fallback={null}>
				<ThemeToggle />
			</Suspense>
			<Suspense fallback={null}>
				<SectionNav />
			</Suspense>
			<Suspense fallback={null}>
				<FluidCursor />
			</Suspense>
		</>
	);
}
