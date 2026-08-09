import type { PageLoad } from './$types';
import { getHooksProfiles, getHooksReadme } from '$lib/content/catalog';
import { renderMarkdown } from '$lib/content/parse';

export const prerender = true;

export const load: PageLoad = async () => ({
	profiles: getHooksProfiles(),
	readmeHtml: await renderMarkdown(getHooksReadme(), 'hooks')
});
