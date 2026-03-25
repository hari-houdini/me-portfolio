/**
 * app/layout.tsx — root Next.js layout
 *
 * This is the minimal root layout required by Next.js 16 App Router.
 * Payload's admin panel is rendered inside the (payload) route group,
 * which has its own layout (app/(payload)/layout.tsx).
 */

import type React from "react";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
