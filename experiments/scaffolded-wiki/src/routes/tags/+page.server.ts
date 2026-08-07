import type { PageServerLoad } from './$types';
import { tagView } from '$lib/server/wiki';

export const load: PageServerLoad = () => ({ tags: tagView() });
