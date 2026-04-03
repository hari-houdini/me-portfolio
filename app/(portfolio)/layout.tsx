/**
 * layout.tsx — Portfolio route group layout
 *
 * Responsibilities:
 *  - Self-host Inter (headings/UI) and Lora (body/prose) via next/font/google.
 *    Next.js downloads and serves font files from its own domain at build time —
 *    no Google CDN dependency at runtime.
 *  - Prevent FOUC: inline synchronous <script> reads localStorage and applies
 *    data-theme="dark"|"light" before the first paint.
 *  - suppressHydrationWarning on <html> and <body> to silence React mismatch
 *    caused by the theme attribute being set before hydration.
 *  - ThemeToggle and SectionNav are client components, lazy-loaded with Suspense.
 */

import dynamic from "next/dynamic";
import { Inter, Lora } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
	preload: true,
});

const lora = Lora({
	subsets: ["latin"],
	variable: "--font-lora",
	display: "swap",
	preload: true,
});

// Lazy-load client components to keep the RSC bundle clean
const ThemeToggle = dynamic(
	() => import("@features/ui/mod").then((m) => ({ default: m.ThemeToggle })),
	{ ssr: false },
);

const SectionNav = dynamic(
	() => import("@features/ui/mod").then((m) => ({ default: m.SectionNav })),
	{ ssr: false },
);

// Inline script — runs before paint to prevent FOUC.
// Must NOT use any module-level APIs. Keep it tiny.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){}})();`;

export default function PortfolioLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: FOUC prevention — synchronous, no user input, no external data */}
				<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
			</head>
			<body
				className={`${inter.variable} ${lora.variable}`}
				suppressHydrationWarning
			>
				<Suspense fallback={null}>
					<ThemeToggle />
				</Suspense>
				<Suspense fallback={null}>
					<SectionNav />
				</Suspense>
				{children}
			</body>
		</html>
	);
}
