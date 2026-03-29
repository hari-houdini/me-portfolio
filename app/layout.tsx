import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Hari Houdini — Creative Technologist",
	description:
		"Portfolio of Hari Houdini — immersive 3D experiences built at the intersection of art and engineering.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		// suppressHydrationWarning: Payload admin panel runs JS before hydration to
		// determine theme / user state, producing attribute mismatches on <html> and
		// <body> between the server render and the first client paint. This prop tells
		// React to ignore one level of attribute differences on these two elements only
		// — it does NOT suppress child component mismatches.
		<html lang="en" suppressHydrationWarning>
			<body suppressHydrationWarning>{children}</body>
		</html>
	);
}
