import type { Metadata } from "next";

// Baseline metadata — overridden per-page via generateMetadata in each route.
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
	return <>{children}</>;
}
