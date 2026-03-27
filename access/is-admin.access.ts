/**
 * is-admin.access.ts
 *
 * Access control function that grants permission only to authenticated users.
 *
 * Applied to all write operations (create, update, delete) across every
 * collection and global. Read access is intentionally left public so the
 * portfolio can fetch CMS data without authentication.
 *
 * In Payload v3, the `user` on the request is populated by Payload's built-in
 * auth middleware after a successful login. A falsy user means the request is
 * unauthenticated.
 */

import type { Access } from "payload";

export const isAdmin: Access = ({ req: { user } }) => Boolean(user);
