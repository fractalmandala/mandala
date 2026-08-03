import { categories, getSupportedCatalog } from '$lib/catalog/index.js';

export function GET() {
	const lines = [
		'# Fractal Svelte',
		'',
		'Svelte 5 components for motion, agent interfaces, and product workflows.',
		'',
		'Install: `pnpm add @fractaldesign/fractal-svelte`',
		'',
		'## Catalog'
	];
	for (const category of categories) {
		lines.push('', `### ${category.name}`, category.description);
		for (const entry of getSupportedCatalog().filter((item) => item.category === category.slug))
			lines.push(
				`- [${entry.name}](/components/${entry.category}/${entry.slug}) — ${entry.status}: ${entry.description}`
			);
	}
	return new Response(lines.join('\n'), {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
}
