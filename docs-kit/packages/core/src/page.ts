import {
	parseDocsFrontmatter,
	type DocsFrontmatterValue
} from '@docs-kit/core/frontmatter';
import { extractDocsHeadings, type DocsHeading } from '@docs-kit/core/markdown';

/** Page metadata derived from frontmatter and the Markdown body. */
export interface DocsPageMeta {
	title: string;
	description?: string;
	/** Short navigation label. Falls back to the title. */
	label: string;
	icon?: string;
	badge?: string;
	/** Normalized alias slugs. Route adapters turn these into redirects. */
	aliases: string[];
	/** Explicit sort weight; lower sorts first. */
	order?: number;
	hidden: boolean;
	draft: boolean;
	frontmatter: Record<string, DocsFrontmatterValue>;
	headings: DocsHeading[];
	/** Frontmatter lines the conservative parser did not understand. */
	unparsedFrontmatter: Array<{ line: number; text: string }>;
}

export interface CreateDocsPageMetaOptions {
	/** Slug used to derive a title when the document supplies none. */
	slug: string;
}

function readString(
	data: Record<string, DocsFrontmatterValue>,
	key: string
): string | undefined {
	const value = data[key];
	if (typeof value === 'string') {
		return value.trim() === '' ? undefined : value;
	}
	return typeof value === 'number' || typeof value === 'boolean' ? String(value) : undefined;
}

function readNumber(
	data: Record<string, DocsFrontmatterValue>,
	key: string
): number | undefined {
	const value = data[key];
	if (typeof value === 'number') {
		return value;
	}
	if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
		return Number(value);
	}
	return undefined;
}

function readBoolean(data: Record<string, DocsFrontmatterValue>, key: string): boolean {
	return data[key] === true || data[key] === 'true';
}

function readStringList(data: Record<string, DocsFrontmatterValue>, key: string): string[] {
	const value = data[key];
	const values = Array.isArray(value) ? value : value === undefined ? [] : [value];
	return [...new Set(values.filter((entry): entry is string => typeof entry === 'string').map((entry) => entry.trim()).filter(Boolean))]
		.sort((left, right) => left.localeCompare(right));
}

/** Turns the final slug segment into a readable fallback title. */
export function titleFromSlug(slug: string): string {
	const segment = slug.split('/').filter(Boolean).at(-1);
	if (segment === undefined) {
		return 'Introduction';
	}

	return segment
		.replace(/[-_]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/^\p{Letter}/u, (character) => character.toUpperCase());
}

/**
 * Derives everything the manifest, navigation, search, and SEO layers need from one
 * document. Frontmatter wins, then the first level-one heading, then the slug.
 */
export function createDocsPageMeta(
	source: string,
	options: CreateDocsPageMetaOptions
): DocsPageMeta {
	const { data, unparsed } = parseDocsFrontmatter(source);
	const headings = extractDocsHeadings(source);
	const title =
		readString(data, 'title') ??
		headings.find((heading) => heading.depth === 1)?.text ??
		titleFromSlug(options.slug);
	const description = readString(data, 'description');
	const label = readString(data, 'label') ?? readString(data, 'sidebarLabel') ?? title;
	const icon = readString(data, 'icon');
	const badge = readString(data, 'badge');
	const order = readNumber(data, 'order');
	const aliases = [...readStringList(data, 'aliases'), ...readStringList(data, 'alias')]
		.filter((alias, index, all) => all.indexOf(alias) === index)
		.sort((left, right) => left.localeCompare(right));

	return {
		title,
		...(description === undefined ? {} : { description }),
		label,
		...(icon === undefined ? {} : { icon }),
		...(badge === undefined ? {} : { badge }),
		...(order === undefined ? {} : { order }),
		aliases,
		hidden: readBoolean(data, 'hidden'),
		draft: readBoolean(data, 'draft'),
		frontmatter: data,
		headings,
		unparsedFrontmatter: unparsed
	};
}
