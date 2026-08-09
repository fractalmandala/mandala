import type { PageLoad } from './$types';
import { getCliSections, getPackageVersion } from '$lib/content/catalog';
import { renderMarkdown } from '$lib/content/parse';

export const prerender = true;

export const load: PageLoad = async () => {
	const sections = await Promise.all(
		getCliSections().map(async (section) => ({
			heading: section.heading,
			html: await renderMarkdown(section.body, 'cli')
		}))
	);
	return { sections, version: getPackageVersion() };
};
