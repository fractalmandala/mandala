import type { Component, Snippet } from 'svelte';
import type {
	DocsLocaleSwitcherItem,
	DocsManifest,
	DocsVersionSwitcherItem,
	DocsHeading,
	DocsManifestPage,
	DocsNavigationNode,
	DocsNavigationSection,
	DocsPageReference
} from '@docs-kit/core';

import type { DocsPageData, DocsSiteInfo } from './types.js';

export type { DocsPageData, DocsSiteInfo } from './types.js';
export type { DocsTrailEntry } from './navigation-trail.js';
export type { DocsColorScheme } from './theme-script.js';
export { createDocsDimensionSwitchers } from './dimensions.js';
export type { DocsDimensionOptions, DocsDimensionSwitchers } from './dimensions.js';
export { findNavigationTrail } from './navigation-trail.js';
export { storageKey, themeScript } from './theme-script.js';

export declare const DocsPage: Component<{
	data: DocsPageData;
	shell?: boolean;
	head?: boolean;
	footer?: boolean;
	children: Snippet;
	footerContent?: Snippet;
	search?: Snippet;
	image?: string;
	manifest?: DocsManifest;
}>;
export declare const DocsLayout: Component<{
	data: DocsPageData;
	toc?: boolean;
	sidebar?: boolean;
	header?: boolean;
	breadcrumbs?: boolean;
	pagination?: boolean;
	children: Snippet;
	aside?: Snippet;
}>;
export declare const DocsHead: Component<{
	page: DocsManifestPage;
	site?: DocsSiteInfo;
	navigation?: DocsNavigationNode[];
	basePath?: string;
	canonical?: string;
	image?: string;
	alternates?: Array<{ hreflang: string; href: string }>;
}>;
export declare const DocsHeader: Component<{
	title: string;
	basePath?: string;
	navigation?: DocsNavigationNode[];
	pathname?: string;
	actions?: Snippet;
	search?: Snippet;
	versions?: DocsVersionSwitcherItem[];
	locales?: DocsLocaleSwitcherItem[];
}>;
export declare const DocsFooter: Component<{ children?: Snippet }>;
export declare const Sidebar: Component<{
	navigation: DocsNavigationNode[];
	pathname: string;
	label?: string;
}>;
export declare const MobileNav: Component<{
	navigation: DocsNavigationNode[];
	pathname: string;
	label?: string;
}>;
export declare const NavigationList: Component<{
	nodes: DocsNavigationNode[];
	pathname: string;
}>;
export declare const Toc: Component<{
	headings: DocsHeading[];
	label?: string;
	minDepth?: number;
	maxDepth?: number;
}>;
export declare const Breadcrumbs: Component<{
	navigation: DocsNavigationNode[];
	pathname: string;
	label?: string;
}>;
export declare const Pagination: Component<{
	previous?: DocsPageReference;
	next?: DocsPageReference;
	label?: string;
}>;
export declare const PageHeader: Component<{ title: string; description?: string }>;
export declare const PageActions: Component<{
	pathname: string;
	siteUrl?: string;
	markdownUrl?: string;
	title?: string;
}>;
export declare const SearchDialog: Component<{
	client: () => Promise<import('@docs-kit/search').DocsSearchClient>;
	label?: string;
	placeholder?: string;
	limit?: number;
	open?: boolean;
}>;
export declare const SearchTrigger: Component<{ onopen: () => void; label?: string }>;
export declare const VersionSwitcher: Component<{
	items: DocsVersionSwitcherItem[];
	label?: string;
	fallbackNote?: string;
}>;
export declare const LocaleSwitcher: Component<{
	items: DocsLocaleSwitcherItem[];
	label?: string;
	fallbackNote?: string;
}>;
export declare const ThemeToggle: Component<{ label?: string }>;
export declare const SkipLink: Component<{ target?: string; label?: string }>;
export declare const CopyCode: Component<Record<string, never>>;

/** Section metadata used by the sidebar. Re-exported for host-built navigation. */
export type { DocsNavigationSection };
