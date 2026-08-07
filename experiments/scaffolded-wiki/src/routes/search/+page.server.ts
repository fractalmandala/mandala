import type { PageServerLoad } from './$types';
import { wiki, docMetaView } from '$lib/server/wiki';

export const load: PageServerLoad = () => ({ index: wiki.docs.map(docMetaView) });
