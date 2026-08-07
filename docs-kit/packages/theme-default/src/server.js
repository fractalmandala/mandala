import { render } from 'svelte/server';

/**
 * Renders a compiled documentation page to HTML on the server.
 *
 * The same function backs the documentation route's server rendering and `@docs-kit/export`,
 * so a printed or packaged page contains exactly what the site shows.
 */
/**
 * @param {import('svelte').Component<any>} component
 * @param {Record<string, unknown>} [props]
 * @returns {{ html: string; head: string }}
 */
export function renderDocsPageHtml(component, props = {}) {
	const output = render(component, { props });

	return { html: output.body, head: output.head };
}
