/** Everything that appears on an Open Graph card. */
export interface DocsOgCardInput {
	title: string;
	description?: string;
	/** Small label above the title, usually the section or version. */
	section?: string;
	siteName?: string;
	locale?: string;
	version?: string;
	/** Logo as a data URI. Remote URLs are not embedded, so cards stay self-contained. */
	logo?: string;
}

export interface DocsOgCardTheme {
	width?: number;
	height?: number;
	background?: string;
	foreground?: string;
	muted?: string;
	accent?: string;
	fontFamily?: string;
	/** Extra CSS placed in the card, for an embedded `@font-face`. */
	css?: string;
}

/** A template renders card input as SVG. Replace it to design your own card. */
export type DocsOgTemplate = (input: DocsOgCardInput, theme: Required<DocsOgCardTheme>) => string;

export const defaultOgCardTheme: Required<DocsOgCardTheme> = {
	width: 1200,
	height: 630,
	background: '#0f1115',
	foreground: '#f5f7fa',
	muted: '#9aa2b1',
	accent: '#35d46a',
	fontFamily:
		"ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
	css: ''
};

/**
 * Card rendering version.
 *
 * It participates in the cache key, so changing how cards look regenerates every card
 * without anyone having to clear the cache by hand.
 */
export const ogTemplateVersion = 1;

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Estimates rendered width without a font engine.
 *
 * Wide, narrow, and default glyph classes are weighted separately, which is accurate
 * enough to wrap a headline predictably and keeps card generation dependency-free.
 */
export function estimateTextWidth(text: string, fontSize: number): number {
	let units = 0;
	for (const character of text) {
		if (/[ijltI.,:;'`!|]/.test(character)) {
			units += 0.3;
		} else if (/[A-Z@#%&WM]/.test(character)) {
			units += 0.72;
		} else if (character === ' ') {
			units += 0.28;
		} else {
			units += 0.55;
		}
	}

	return units * fontSize;
}

/** Wraps text to a pixel width, truncating with an ellipsis past `maxLines`. */
export function wrapText(
	text: string,
	options: { fontSize: number; maxWidth: number; maxLines: number }
): string[] {
	const words = text.split(/\s+/).filter(Boolean);
	const lines: string[] = [];
	let current = '';

	for (const word of words) {
		const candidate = current === '' ? word : `${current} ${word}`;
		if (estimateTextWidth(candidate, options.fontSize) <= options.maxWidth || current === '') {
			current = candidate;
			continue;
		}

		lines.push(current);
		current = word;

		if (lines.length === options.maxLines) {
			break;
		}
	}

	if (lines.length < options.maxLines && current !== '') {
		lines.push(current);
	}

	if (lines.length === options.maxLines && words.length > lines.join(' ').split(/\s+/).length) {
		const last = lines[lines.length - 1] as string;
		lines[lines.length - 1] = `${last.replace(/[.,;:]?$/, '')}…`;
	}

	return lines;
}

/** The built-in card: accent rule, eyebrow, headline, description, and site footer. */
export const defaultOgTemplate: DocsOgTemplate = (input, theme) => {
	const padding = 72;
	const contentWidth = theme.width - padding * 2;
	const titleSize = input.title.length > 48 ? 64 : 78;
	const titleLines = wrapText(input.title, {
		fontSize: titleSize,
		maxWidth: contentWidth,
		maxLines: 3
	});
	const descriptionLines = input.description
		? wrapText(input.description, { fontSize: 30, maxWidth: contentWidth, maxLines: 2 })
		: [];
	const eyebrow = [input.section, input.version].filter(Boolean).join(' · ');
	const titleTop = 250 - (titleLines.length - 1) * (titleSize * 0.55);

	return [
		`<svg xmlns="http://www.w3.org/2000/svg" width="${theme.width}" height="${theme.height}" viewBox="0 0 ${theme.width} ${theme.height}" role="img" aria-label="${escapeXml(input.title)}">`,
		`<style>text { font-family: ${theme.fontFamily}; }${theme.css}</style>`,
		`<rect width="${theme.width}" height="${theme.height}" fill="${theme.background}" />`,
		`<rect x="0" y="0" width="${theme.width}" height="10" fill="${theme.accent}" />`,
		eyebrow === ''
			? ''
			: `<text x="${padding}" y="150" fill="${theme.accent}" font-size="26" letter-spacing="3" font-weight="600">${escapeXml(eyebrow.toUpperCase())}</text>`,
		...titleLines.map(
			(line, index) =>
				`<text x="${padding}" y="${titleTop + index * (titleSize * 1.15)}" fill="${theme.foreground}" font-size="${titleSize}" font-weight="700">${escapeXml(line)}</text>`
		),
		...descriptionLines.map(
			(line, index) =>
				`<text x="${padding}" y="${theme.height - 170 + index * 42}" fill="${theme.muted}" font-size="30">${escapeXml(line)}</text>`
		),
		input.logo
			? `<image x="${padding}" y="${theme.height - 108}" height="44" href="${escapeXml(input.logo)}" />`
			: '',
		input.siteName
			? `<text x="${input.logo ? padding + 64 : padding}" y="${theme.height - 76}" fill="${theme.foreground}" font-size="28" font-weight="600">${escapeXml(input.siteName)}</text>`
			: '',
		input.locale
			? `<text x="${theme.width - padding}" y="${theme.height - 76}" fill="${theme.muted}" font-size="26" text-anchor="end">${escapeXml(input.locale)}</text>`
			: '',
		'</svg>',
		''
	]
		.filter((line) => line !== '')
		.join('\n');
};

export interface CreateDocsOgCardOptions {
	theme?: DocsOgCardTheme;
	template?: DocsOgTemplate;
}

/** Renders one card as SVG. */
export function createDocsOgCard(
	input: DocsOgCardInput,
	options: CreateDocsOgCardOptions = {}
): string {
	const theme = { ...defaultOgCardTheme, ...(options.theme ?? {}) };
	return (options.template ?? defaultOgTemplate)(input, theme);
}
