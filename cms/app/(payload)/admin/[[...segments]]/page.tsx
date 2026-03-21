/**
 * app/(payload)/admin/[[...segments]]/page.tsx
 *
 * Payload admin panel catch-all route. Delegates all rendering to Payload's
 * RootPage component.
 *
 * importMap:
 *   Payload uses an import map to resolve custom React components registered
 *   in the config (custom admin views, cells, field components, etc.).
 *   This portfolio CMS has no custom components, so the import map is empty.
 *   If you add custom components, run `pnpm generate:importmap` to regenerate.
 */

import config from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";
import type { Metadata } from "next";

// No custom Payload components → empty import map.
const importMap = {};

type Args = {
	params: Promise<{ segments: string[] }>;
	searchParams: Promise<{ [key: string]: string | string[] }>;
};

export const generateMetadata = ({
	params,
	searchParams,
}: Args): Promise<Metadata> =>
	generatePageMetadata({ config, params, searchParams });

export default function AdminPage({ params, searchParams }: Args) {
	return RootPage({ config, importMap, params, searchParams });
}
