import { parseSharedMarkdown } from '$lib/editor/serialization';

export type MarkdownRenderResult = {
	html: string;
	error: string | null;
	features: {
		mdxFallback: boolean;
		mermaid: boolean;
		images: boolean;
	};
	mermaidBlocks: string[];
};

export function renderMarkdown(source: string): string {
	return renderMarkdownResult(source).html;
}

export function renderMarkdownResult(source: string): MarkdownRenderResult {
	const mermaidBlocks = extractMermaidBlocks(source);
	const features = {
		mdxFallback: hasMdxSyntax(source),
		mermaid: mermaidBlocks.length > 0,
		images: /!\[[^\]]*]\([^)]+\)/.test(source),
	};

	try {
		const rendered = parseSharedMarkdown(source);
		return {
			html: enhanceRenderedHtml(rendered),
			error: null,
			features,
			mermaidBlocks,
		};
	} catch (error) {
		return {
			html: '',
			error: error instanceof Error ? error.message : 'Markdown preview failed.',
			features,
			mermaidBlocks,
		};
	}
}

function enhanceRenderedHtml(html: string): string {
	return enhanceMermaidFigures(enhanceLinks(html));
}

function enhanceLinks(html: string): string {
	return html.replace(/<a\s+href="([^"]*)"([^>]*)>/g, (_match, href: string, attributes: string) => {
		const safeHref = sanitizeHref(href);
		const target = isExternalHref(safeHref) ? ' target="_blank" rel="noreferrer noopener"' : '';
		return `<a href="${safeHref}"${target}${attributes}>`;
	});
}

function enhanceMermaidFigures(html: string): string {
	let index = 0;
	return html.replace(
		/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
		(_match, source: string) => {
			const id = `mermaid-block-${index}`;
			index += 1;
			return `<figure class="mermaid-figure" data-mermaid-id="${id}" data-mermaid-source="${escapeAttribute(decodeHtml(source))}" aria-label="Mermaid diagram"><div class="mermaid-mount" data-mermaid-target="${id}"></div><figcaption>Mermaid diagram</figcaption><details><summary>Source</summary><pre><code>${source}</code></pre></details></figure>`;
		},
	);
}

function extractMermaidBlocks(source: string): string[] {
	const blocks: string[] = [];
	const pattern = /```mermaid\s*([\s\S]*?)```/gi;
	let match: RegExpExecArray | null;
	while ((match = pattern.exec(source))) {
		blocks.push(match[1]?.trim() ?? '');
	}
	return blocks;
}

function sanitizeHref(href: string): string {
	const trimmed = href.trim();
	if (/^(https?:|mailto:|#|\/(?!\/)|\.\.?\/)/i.test(trimmed)) return escapeAttribute(trimmed);
	return '#';
}

function isExternalHref(href: string): boolean {
	return /^https?:\/\//i.test(href);
}

function hasMdxSyntax(source: string): boolean {
	return /^\s*(import|export)\s.+from\s+['"][^'"]+['"]/m.test(source) || /<[A-Z][\w.:]*(\s|>|\/>)/.test(source);
}

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function escapeAttribute(value: string): string {
	return escapeHtml(value).replaceAll('`', '&#96;');
}

function decodeHtml(value: string): string {
	return value
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
		.replaceAll('&amp;', '&')
		.replaceAll('&quot;', '"')
		.replaceAll('&#39;', "'");
}
