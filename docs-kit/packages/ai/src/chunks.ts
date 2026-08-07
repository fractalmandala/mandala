import { splitDocsSections } from '@docs-kit/core';

import type { DocsAiDocument } from './documents.js';

/** A retrievable slice of a documentation page with everything needed to cite it. */
export interface DocsAiChunk {
	id: string;
	documentId: string;
	pathname: string;
	title: string;
	/** Heading trail from the page title down to this chunk's heading. */
	headingPath: string[];
	/** Anchor of the heading this chunk belongs to, when it has one. */
	anchor?: string;
	/** Absolute URL including the anchor, when a site origin is configured. */
	url?: string;
	version?: string;
	locale?: string;
	text: string;
	index: number;
}

export interface ChunkDocumentOptions {
	/** Soft maximum characters per chunk. Defaults to 1500. */
	maxCharacters?: number;
	/** Characters of trailing context repeated at the start of a split chunk. Defaults to 100. */
	overlap?: number;
}

function splitLongText(text: string, maxCharacters: number, overlap: number): string[] {
	if (text.length <= maxCharacters) {
		return [text];
	}

	const paragraphs = text.split(/\n{2,}/);
	const parts: string[] = [];
	let current = '';

	const flush = (): void => {
		if (current.trim() !== '') {
			parts.push(current.trim());
		}
		current = overlap > 0 ? current.slice(-overlap) : '';
	};

	for (const paragraph of paragraphs) {
		if (current !== '' && current.length + paragraph.length > maxCharacters) {
			flush();
		}
		current = current === '' ? paragraph : `${current}\n\n${paragraph}`;
	}

	if (current.trim() !== '') {
		parts.push(current.trim());
	}

	return parts.length > 0 ? parts : [text];
}

/**
 * Splits a document into heading-scoped chunks.
 *
 * Chunks follow section boundaries so every answer can cite an exact heading anchor rather
 * than a whole page; oversized sections are split on paragraph boundaries with overlap.
 */
export function chunkDocsDocument(
	document: DocsAiDocument,
	options: ChunkDocumentOptions = {}
): DocsAiChunk[] {
	const maxCharacters = Math.max(options.maxCharacters ?? 1500, 200);
	const overlap = Math.max(options.overlap ?? 100, 0);
	const chunks: DocsAiChunk[] = [];

	for (const section of splitDocsSections(document.body)) {
		const headingPath = [document.title, ...section.path, ...(section.heading ? [section.heading.text] : [])];
		const anchor = section.heading?.id;

		for (const text of splitLongText(section.content, maxCharacters, overlap)) {
			if (text.trim() === '') {
				continue;
			}

			const index = chunks.length;
			const url =
				document.url === undefined ? undefined : anchor ? `${document.url}#${anchor}` : document.url;

			chunks.push({
				id: `${document.id}#${index}`,
				documentId: document.id,
				pathname: anchor ? `${document.pathname}#${anchor}` : document.pathname,
				title: document.title,
				headingPath: headingPath.filter((entry, position) => entry !== headingPath[position - 1]),
				...(anchor === undefined ? {} : { anchor }),
				...(url === undefined ? {} : { url }),
				...(document.version === undefined ? {} : { version: document.version }),
				...(document.locale === undefined ? {} : { locale: document.locale }),
				text,
				index
			});
		}
	}

	return chunks;
}

/** Chunks a whole documentation set in deterministic document order. */
export function chunkDocsDocuments(
	documents: readonly DocsAiDocument[],
	options: ChunkDocumentOptions = {}
): DocsAiChunk[] {
	return documents.flatMap((document) => chunkDocsDocument(document, options));
}
