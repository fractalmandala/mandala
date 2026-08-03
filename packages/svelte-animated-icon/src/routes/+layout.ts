import type { LayoutLoad } from './$types';
import { allDocs } from './utils/localpulls';

export const load: LayoutLoad = async () => {
	return {
		docsOne: await allDocs('getting started'),
		docsTwo: await allDocs('customization'),
		docsThree: await allDocs('api-reference'),
		docsFour: await allDocs('guides-and-advanced'),
		docsFive: await allDocs('others')
	};
};
