import type {
	DocsHeading,
	DocsManifestPage,
	DocsNavigationNode,
	DocsPageReference
} from '@docs-kit/core';

export interface DocsSiteInfo {
	title: string;
	description?: string;
	url?: string;
	repository?: string;
}

/** Everything the theme needs to render a documentation page. */
export interface DocsPageData {
	page: DocsManifestPage;
	navigation: DocsNavigationNode[];
	site?: DocsSiteInfo;
	/** Table-of-contents entries. Defaults to the page's own headings. */
	toc?: DocsHeading[];
	previous?: DocsPageReference;
	next?: DocsPageReference;
	/** Mount path, used for breadcrumbs and page actions. */
	basePath?: string;
}
