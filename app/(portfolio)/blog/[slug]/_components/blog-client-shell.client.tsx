"use client";

/**
 * blog-client-shell.client.tsx
 *
 * Client wrapper for blog post page client-only components.
 * Must be "use client" so that next/dynamic with ssr: false is valid.
 */

import type { BlogPostProps } from "@features/blog/mod";
import { BlogPost } from "@features/blog/mod";
import dynamic from "next/dynamic";
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
	data: BlogPostProps["data"];
	filterContext?: BlogPostProps["filterContext"];
	tracingBeam: boolean;
}

export function BlogClientShell({
	data,
	filterContext,
	tracingBeam,
}: BlogClientShellProps) {
	return (
		<>
			<Suspense fallback={null}>
				<ReadingProgress />
			</Suspense>
			<Suspense fallback={null}>
				<TracingBeam enabled={tracingBeam}>
					<BlogPost data={data} filterContext={filterContext} />
				</TracingBeam>
			</Suspense>
		</>
	);
}
