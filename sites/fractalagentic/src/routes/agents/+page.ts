import type { PageLoad } from './$types';
import { listAgents, toSummaries } from '$lib/content/catalog';

export const prerender = true;

export const load: PageLoad = () => ({ entries: toSummaries(listAgents()) });
