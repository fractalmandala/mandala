import type { DocsExportMetadata, DocsExportPage } from './document.js';
import { exportAnchorId } from './document.js';

export interface RewriteExportLinksOptions {
	/** Every page included in the export, used to turn internal links into anchors. */
	pages: readonly DocsExportPage[];
	/** Absolute origin used for links and assets that leave the export. */
	siteUrl?: string;
	/** Resolves an asset URL, for example to an embedded data URI. */
	resolveAsset?: (url: string) => string | undefined;
	/** Prefix applied to heading ids so anchors stay unique across a combined document. */
	anchorPrefix?: string;
}

const attributePattern = /\b(href|src|srcset|poster)\s*=\s*("([^"]*)"|'([^']*)')/gi;
const idPattern = /\bid\s*=\s*("([^"]*)"|'([^']*)')/gi;

function normalizePathname(pathname: string): string {
	const path = pathname.split(/[?#]/, 1)[0] ?? '';
	const trimmed = path.replace(/\/+$/, '');
	return trimmed === '' ? '/' : trimmed;
}

function absolute(url: string, siteUrl: string | undefined): string {
	if (siteUrl === undefined) {
		return url;
	}

	try {
		return new URL(url, siteUrl).toString();
	} catch {
		return url;
	}
}

/**
 * Rewrites one page's HTML so it works inside a combined export.
 *
 * Links to other exported pages become in-document anchors; every other internal link and
 * asset becomes absolute against the site origin, so an exported file stays usable offline.
 */
export function rewriteExportHtml(
	page: DocsExportPage,
	options: RewriteExportLinksOptions
): string {
	const anchorPrefix = options.anchorPrefix ?? `${exportAnchorId(page.id)}--`;
	const byPathname = new Map(
		options.pages.map((entry) => [normalizePathname(entry.pathname), entry])
	);

	const withRewrittenIds = page.html.replace(idPattern, (match, _quoted, doubleQuoted, singleQuoted) => {
		const value = (doubleQuoted ?? singleQuoted ?? '') as string;
		return value === '' ? match : `id="${anchorPrefix}${value}"`;
	});

	return withRewrittenIds.replace(
		attributePattern,
		(match, attribute: string, _quoted, doubleQuoted, singleQuoted) => {
			const value = (doubleQuoted ?? singleQuoted ?? '') as string;
			if (value === '' || value.startsWith('data:') || value.startsWith('mailto:')) {
				return match;
			}

			if (attribute.toLowerCase() === 'href') {
				if (value.startsWith('#')) {
					return `href="#${anchorPrefix}${value.slice(1)}"`;
				}
				if (!value.startsWith('/')) {
					return match;
				}

				const [pathPart = '', hash] = value.split('#');
				const target = byPathname.get(normalizePathname(pathPart));
				if (target) {
					const targetAnchor = exportAnchorId(target.id);
					return `href="#${hash ? `${targetAnchor}--${hash}` : targetAnchor}"`;
				}

				return `href="${absolute(value, options.siteUrl)}"`;
			}

			const resolved = options.resolveAsset?.(value);
			if (resolved !== undefined) {
				return `${attribute}="${resolved}"`;
			}

			return value.startsWith('/') ? `${attribute}="${absolute(value, options.siteUrl)}"` : match;
		}
	);
}

/** Rewrites every page in an export in one pass. */
export function rewriteExportPages(
	pages: readonly DocsExportPage[],
	metadata: DocsExportMetadata = { title: '' },
	options: Omit<RewriteExportLinksOptions, 'pages' | 'siteUrl'> = {}
): DocsExportPage[] {
	return pages.map((page) => ({
		...page,
		html: rewriteExportHtml(page, {
			...options,
			pages,
			...(metadata.siteUrl === undefined ? {} : { siteUrl: metadata.siteUrl })
		})
	}));
}
