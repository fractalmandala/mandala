/// <reference types="vite/client" />

declare module 'virtual:docs-kit/manifest' {
	/**
	 * A compiled Markdown or mdsvex module.
	 *
	 * `default` is typed as a Svelte component so a route can render it directly. The
	 * import is deliberately loose (`any` props) because every document declares its own.
	 */
	export interface DocsVirtualContentModule {
		default: import('svelte').Component<Record<string, never>>;
		metadata?: {
			title?: string;
			description?: string;
			[key: string]: unknown;
		};
	}

	export const manifest: import('@docs-kit/core/manifest').DocsManifest;
	export const pageImporters: Readonly<
		Record<string, () => Promise<DocsVirtualContentModule>>
	>;
}

declare module 'virtual:docs-kit/search' {
	/** Records for every indexable page and section, ready for any search provider. */
	export const searchRecords: import('@docs-kit/core/search').DocsSearchRecord[];
}

declare module 'virtual:docs-kit/raw' {
	/** Raw Markdown for every page, keyed by page id. Import from server code only. */
	export const rawSources: Record<string, string>;
}
