import type { PageLoad } from './$types';
import { listSkills, toSummaries } from '$lib/content/catalog';

export const prerender = true;

export const load: PageLoad = () => ({ entries: toSummaries(listSkills()) });
