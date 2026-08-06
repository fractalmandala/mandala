import { listBosses, listDocsInSequence, toSummaries } from '$lib/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const docs = listDocsInSequence();
	const start = docs
		.filter((d) =>
			['guide', '00-overview', '01-getting-started', '02-install', '03-auto-use'].includes(d.slug)
		)
		.map((d) => ({ title: d.title, description: d.description, href: d.href, slug: d.slug }));

	return {
		bosses: listBosses(),
		startGuides: start,
		featuredDocs: toSummaries(
			docs.filter((d) =>
				['orchestration', 'wiki', 'armory', 'progression', 'troubleshooting'].includes(d.slug)
			)
		)
	};
};
