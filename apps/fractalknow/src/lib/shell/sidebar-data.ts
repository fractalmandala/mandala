import { derived } from 'svelte/store';
import { workspaceDocuments, type WorkspaceDocument } from './documents';
import type { SidebarNode } from './types';

/**
 * Project-backed sidebar sections derived from the live document workspace.
 * Replaces the old static seed tree so Files / Skills / Docs always track disk.
 */

export type SidebarSectionId = 'files' | 'skills' | 'docs';

export function isSkillPath(path: string): boolean {
	return /(?:^|\/)SKILL\.md$/i.test(path) || path.includes('/.ok/skills/');
}

export function isDocsPath(path: string): boolean {
	if (isSkillPath(path)) return false;
	return (
		path === '/docs' ||
		path.startsWith('/docs/') ||
		path === '/content' ||
		path.startsWith('/content/') ||
		/\.(md|mdx)$/i.test(path)
	);
}

export function documentsForSection(
	documents: WorkspaceDocument[],
	section: SidebarSectionId,
): WorkspaceDocument[] {
	if (section === 'skills') {
		return documents.filter(
			(document) =>
				document.kind === 'migration' ||
				isSkillPath(document.path) ||
				document.path.includes('/.ok/skills'),
		);
	}
	if (section === 'docs') {
		return documents.filter(
			(document) => document.kind === 'migration' || isDocsPath(document.path),
		);
	}
	return documents;
}

export function buildSidebarNodes(documents: WorkspaceDocument[]): SidebarNode[] {
	return documents
		.filter((document) => document.kind !== 'migration')
		.map((document) => ({
			id: document.path,
			title: document.title,
			kind: document.kind,
			path: document.path,
		}))
		.sort((left, right) => left.path.localeCompare(right.path));
}

import { isPathIgnored, okignorePatterns } from './okignore';

export function filterIgnoredDocuments(
	documents: WorkspaceDocument[],
	patterns: string[],
): WorkspaceDocument[] {
	if (patterns.length === 0) return documents;
	return documents.filter((doc) => !isPathIgnored(doc.path, patterns));
}

/** Live project-backed tree; no static seed placeholders. */
export const sidebarNodes = derived([workspaceDocuments, okignorePatterns], ([$documents, $patterns]) =>
	buildSidebarNodes(filterIgnoredDocuments($documents, $patterns)),
);

export const skillDocuments = derived([workspaceDocuments, okignorePatterns], ([$documents, $patterns]) =>
	documentsForSection(filterIgnoredDocuments($documents, $patterns), 'skills').filter(
		(document) => document.kind !== 'migration',
	),
);

export const docsDocuments = derived([workspaceDocuments, okignorePatterns], ([$documents, $patterns]) =>
	documentsForSection(filterIgnoredDocuments($documents, $patterns), 'docs').filter(
		(document) => document.kind !== 'migration',
	),
);
