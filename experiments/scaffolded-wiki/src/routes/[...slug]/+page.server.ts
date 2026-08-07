import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { wiki, docMetaView, stripMeta, sectionTagView, sectionLandingView } from '$lib/server/wiki';
	export const load: PageServerLoad = async ({ params }) => {
	const path = '/' + (params.slug ?? '').split('/').filter(Boolean).join('/');
	const page = wiki.find(path);

	// Folder without INDEX.md → auto-generated section landing (so sidebar
	// and breadcrumb links resolve instead of 404ing during prerender).
	if (!page) {
		const landing = sectionLandingView(path);
		if (landing) {
			return {
				path,
				page: undefined,
				meta: {},
				isLanding: true,
				section: path,
				breadcrumbs: wiki.breadcrumbs(path),
				landing,
				sectionTags: []
			};
		}
		throw error(404, `No wiki page at ${path}`);
	}

	const isLanding = page.slug === '';
	const section = wiki.activeSection(path);
	const prevNext = wiki.prevNext(path);

	return {
		path,
		page: docMetaView(page),
		meta: stripMeta(page.meta),
		isLanding,
		section,
		breadcrumbs: wiki.breadcrumbs(path),
		prev: prevNext.prev ? docMetaView(prevNext.prev) : undefined,
		next: prevNext.next ? docMetaView(prevNext.next) : undefined,
		sectionTags: isLanding ? sectionTagView(path) : []
	};
};
