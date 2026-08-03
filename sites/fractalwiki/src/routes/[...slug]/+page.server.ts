import { error } from '@sveltejs/kit';
import { getDocBySlug, getNavGroups, resolveWikiLinks } from '$lib/server/vault';
import { renderMarkdownToHtml } from '$lib/server/markdown';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug;
	let doc = getDocBySlug(slug);

	// Fallback: If navigating to section root (e.g. "civilization-history/civilization"), try "index"
	if (!doc) {
		doc = getDocBySlug(`${slug}/index`);
	}

	if (!doc) {
		throw error(404, {
			message: `Document not found for path: /${slug}`
		});
	}

	// Resolve internal links
	const resolvedContent = resolveWikiLinks(doc.content, doc.groupId, doc.sectionId);

	// Render Markdown to HTML
	const htmlContent = renderMarkdownToHtml(resolvedContent);

	return {
		doc,
		htmlContent
	};
};
