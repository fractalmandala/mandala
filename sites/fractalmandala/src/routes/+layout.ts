import type { LayoutLoad } from './$types';
import routesConfig from '$lib/data/routes-config.json';
import { listPosts } from '$lib/utils/postlists';

// Define types for our structure
export interface PostItem {
	// Adjust these fields based on what your listPosts actually returns
	title: string;
	slug: string;
	[key: string]: any; 
}

export interface BankAccordionItem {
	bankName: string;
	route: string;
	posts: PostItem[];
}

export const load: LayoutLoad = async () => {
	const accordionData = await Promise.all(
		routesConfig.map(async (item) => {
			try {
				// Safely fetch posts
				const posts = await listPosts(item['bank name'], 'wiki', item.route);
				return {
					bankName: item['bank name'],
					route: item.route,
					posts: posts || [] 
				};
			} catch (error) {
				// Log the exact error to your terminal console so you can see which bank failed
				console.error(`Failed to load posts for bank: ${item['bank name']}`, error);
				
				// Return an empty list gracefully instead of crashing the site
				return {
					bankName: item['bank name'],
					route: item.route,
					posts: []
				};
			}
		})
	);

	return {
		accordionData
	};
};