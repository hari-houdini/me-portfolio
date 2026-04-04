"use client";

/**
 * blog-client-shell.client.tsx
 *
 * Client wrapper for blog post page client-only components.
 * Must be "use client" so that next/dynamic with ssr: false is valid.
 *
 * BlogPost (async RSC) is NOT imported here. It is rendered by the RSC page
 * and passed as `children` — this is the correct Next.js 15 pattern for
 * composing async Server Components inside a Client Component boundary.
 *
 * Pattern:
 *   RSC page.tsx       → renders <BlogPost>, passes as children
 *   BlogClientShell    → wraps ReadingProgress + TracingBeam around children
 */

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { Suspense } from "react";

const ReadingProgress = dynamic(
	() =>
		import("@features/ui/mod").then((m) => ({ default: m.ReadingProgress })),
	{ ssr: false },
);

const TracingBeam = dynamic(
	() => import("@features/ui/mod").then((m) => ({ default: m.TracingBeam })),
	{ ssr: false },
);

interface BlogClientShellProps {
	tracingBeam: boolean;
	children: ReactNode;
}

export function BlogClientShell({
	tracingBeam,
	children,
}: BlogClientShellProps) {
	return (
		<>
			<Suspense fallback={null}>
				<ReadingProgress />
			</Suspense>
			<Suspense fallback={null}>
				<TracingBeam enabled={tracingBeam}>{children}</TracingBeam>
			</Suspense>
		</>
	);
}
