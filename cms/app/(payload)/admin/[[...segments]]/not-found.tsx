/**
 * app/(payload)/admin/[[...segments]]/not-found.tsx
 *
 * Payload admin 404 handler. Delegates to Payload's NotFoundPage component.
 * The empty importMap is correct for a config with no custom React components.
 */

import config from "@payload-config";
import { NotFoundPage } from "@payloadcms/next/views";

const importMap = {};

type Args = {
	params: Promise<{ segments: string[] }>;
	searchParams: Promise<{ [key: string]: string | string[] }>;
};

export default async function NotFound({ params, searchParams }: Args) {
	return NotFoundPage({ config, importMap, params, searchParams });
}
