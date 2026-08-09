import type { PageLoad } from './$types';
import { listWorkflows } from '$lib/content/catalog';

export const prerender = true;

export const load: PageLoad = () => ({ workflows: listWorkflows() });
