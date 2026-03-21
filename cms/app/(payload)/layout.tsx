/**
 * app/(payload)/layout.tsx
 *
 * Payload's admin panel layout. This file must exist and re-export children
 * as-is — Payload renders its own full-page layout internally. Do not add
 * custom HTML structure here.
 *
 * This file is provided by the Payload Next.js integration template and
 * should not be modified.
 */

import type React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
