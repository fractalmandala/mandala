export { docsConfig } from './config.js';

/** Client-safe helpers/types (no globs). */
export {
	CONTENT_ROOT,
	HREF_PREFIX,
	slugFromPath,
	toSourcePath,
	candidatePaths,
	type DocListItem,
	type DocMeta as ContentDocMeta
} from './content-shared.js';

/**
 * Listing / navigation — prefer importing from `content-list` / `navigation`
 * only inside `*.server.ts` files.
 */
export { getAllDocs, getDocsByDirectory, resolveContentPath } from './content-list.js';
export { getDoc, type DocLoadResult } from './content-page.js';
export { getNavigation, getPrevNext } from './navigation.js';
export { buildNavTree, flattenNav } from './nav-tree.js';
export { rewriteMdHref, remarkRewriteMdLinks } from './md-links.js';

export type {
	DocMeta,
	DocFile,
	DocPage,
	NavItem,
	SiteConfig,
	DocsConfig,
	SidebarSection,
	TableOfContentsItem,
	VersionConfig,
	LocaleConfig
} from './types.js';
