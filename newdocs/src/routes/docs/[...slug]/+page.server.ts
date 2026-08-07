import { getAllDocs } from '$lib/docs/content-list';
import { getPrevNext } from '$lib/docs/navigation';
import type { EntryGenerator, PageServerLoad } from './$types';

export const prerender = true;

/**
 * Prerender every known slug so Pagefind has full HTML coverage.
 * For `[...slug]`, Kit expects the rest param as a string path (may include `/`).
 */
export const entries: EntryGenerator = () => {
	const docs = getAllDocs();
	return docs
		.filter((doc) => doc.slug.length > 0)
		.map((doc) => ({ slug: doc.slug }));
};

/** Server-only prev/next so eager vault never enters the client graph. */
export const load: PageServerLoad = ({ params }) => {
	const slug = params.slug ?? '';
	const { prev, next } = getPrevNext(slug);
	return {
		prev: prev ?? null,
		next: next ?? null
	};
};
