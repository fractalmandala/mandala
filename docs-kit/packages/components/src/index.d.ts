import type { Component, Snippet } from 'svelte';

import type { DocsDiffLine } from './diff.js';
import type { DocsFileTreeNode } from './file-tree.js';
import type { DocsTypeRow } from './type-table.js';

export type { DocsDiffKind, DocsDiffLine } from './diff.js';
export { diffLines } from './diff.js';
export type { DocsFileTreeNode } from './file-tree.js';
export type { DocsTypeRow } from './type-table.js';

export declare const Callout: Component<{
	kind?: 'note' | 'info' | 'tip' | 'warning' | 'danger';
	title?: string;
	children: Snippet;
}>;
export declare const Tabs: Component<{ labels?: string[]; children: Snippet }>;
export declare const Tab: Component<{ label: string; children: Snippet }>;
export declare const CodeGroup: Component<{ labels?: string[]; children: Snippet }>;
export declare const Steps: Component<{ children: Snippet }>;
export declare const Step: Component<{ title?: string; children: Snippet }>;
export declare const Cards: Component<{ children: Snippet }>;
export declare const Card: Component<{
	title: string;
	href?: string;
	icon?: string;
	children?: Snippet;
}>;
export declare const Badge: Component<{
	tone?: 'neutral' | 'accent' | 'warning' | 'danger';
	children: Snippet;
}>;
export declare const Accordion: Component<{ title: string; open?: boolean; children: Snippet }>;
export declare const FileTree: Component<{ tree: DocsFileTreeNode[]; label?: string }>;
export declare const TypeTable: Component<{ rows: DocsTypeRow[]; caption?: string }>;
export declare const Mermaid: Component<{
	chart: string;
	title?: string;
	caption?: string;
}>;
export declare const Columns: Component<{
	count?: number;
	minWidth?: string;
	children: Snippet;
}>;
export declare const Frame: Component<{ caption?: string; padded?: boolean; children: Snippet }>;
export declare const Diff: Component<{
	before: string;
	after: string;
	title?: string;
	lineNumbers?: boolean;
}>;
export declare const ImageZoom: Component<{
	src: string;
	alt: string;
	caption?: string;
	closeLabel?: string;
}>;
