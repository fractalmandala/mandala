import type { Component } from 'svelte';

export interface RenderedDocsPage {
	html: string;
	head: string;
}

export declare function renderDocsPageHtml(
	component: Component<never>,
	props?: Record<string, unknown>
): RenderedDocsPage;
