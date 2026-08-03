import { categories, getSupportedCatalog } from '$lib/catalog/index.js';
import { guides } from '$site/content.js';

export function GET() {
	const paths = [
		'/',
		...categories.map((category) => `/components/${category.slug}`),
		...getSupportedCatalog().map((entry) => `/components/${entry.category}/${entry.slug}`),
		...guides.map((guide) => `/docs/${guide.slug}`)
	];
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `\n\t<url><loc>${path}</loc></url>`).join('')}\n</urlset>`;
	return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
