import { createDocsAiDocument, type DocsAiDocument } from '@docs-kit/ai';
import { manifest } from 'virtual:docs-kit/manifest';
import { rawSources } from 'virtual:docs-kit/raw';

export const site = {
	title: 'Acme Documentation',
	description: 'The docs-kit playground documentation.',
	url: 'https://example.com'
};

/**
 * The documentation set the AI endpoints serve.
 * It is built from the same manifest the site renders, so both always agree.
 */
export function aiDocuments(): DocsAiDocument[] {
	return manifest.pages.map((page) =>
		createDocsAiDocument({
			id: page.id,
			pathname: page.pathname,
			source: rawSources[page.id] ?? '',
			title: page.title,
			siteUrl: site.url,
			...(page.description === undefined ? {} : { description: page.description }),
			...(page.version === undefined ? {} : { version: page.version }),
			...(page.locale === undefined ? {} : { locale: page.locale }),
			...(page.hidden || page.draft ? { hidden: true } : {})
		})
	);
}
