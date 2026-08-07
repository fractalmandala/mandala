/**
 * Barrel for docs content APIs.
 *
 * Prefer importing from specialized modules:
 * - `content-list` — server-only listing (eager vault)
 * - `content-page` — single-page lazy load (client-safe)
 * - `content-shared` — types/helpers (client-safe)
 *
 * Avoid importing this barrel from client components if you only need page load —
 * prefer `content-page` so Vite does not pull eager globs.
 */
export {
	CONTENT_ROOT,
	HREF_PREFIX,
	slugFromPath,
	toSourcePath,
	candidatePaths,
	parseFrontmatter,
	type DocMeta,
	type DocListItem
} from './content-shared.js';

export { getAllDocs, getDocsByDirectory, resolveContentPath } from './content-list.js';
export { getDoc, type DocLoadResult } from './content-page.js';
