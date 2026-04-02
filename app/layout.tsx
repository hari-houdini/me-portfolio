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
	return <>{children}</>;
}
