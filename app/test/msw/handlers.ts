/**
 * handlers.ts
 *
 * Default MSW request handlers for the Payload CMS REST API.
 *
 * These handlers represent the "happy path" — all resources return 200 with
 * fixture data. Individual tests override specific handlers via server.use()
 * to simulate error conditions (404, 500, network failure, parse error).
 *
 * The base URL matches the PAYLOAD_API_URL used by CmsServiceLive when
 * process.env.PAYLOAD_API_URL is not set (i.e. the fallback default).
 */

import { HttpResponse, http } from "msw";
import {
	mockAbout,
	mockContact,
	mockProjects,
	mockSiteConfig,
} from "../fixtures/cms.fixtures";

const BASE_URL = "http://localhost:3001";

export const handlers = [
	// site-config global
	http.get(`${BASE_URL}/api/globals/site-config`, () =>
		HttpResponse.json(mockSiteConfig),
	),

	// about global
	http.get(`${BASE_URL}/api/globals/about`, () => HttpResponse.json(mockAbout)),

	// contact global
	http.get(`${BASE_URL}/api/globals/contact`, () =>
		HttpResponse.json(mockContact),
	),

	// projects collection (matches regardless of query string)
	http.get(`${BASE_URL}/api/projects`, () =>
		HttpResponse.json({
			docs: mockProjects,
			totalDocs: mockProjects.length,
		}),
	),
];
