import { extractDocsLinks, slugifyHeading } from '@docs-kit/core/markdown';
import type { DocsManifest, DocsManifestPage } from '@docs-kit/core/manifest';

export type DocsDiagnosticSeverity = 'error' | 'warning' | 'info';

export type DocsDiagnosticCode =
	| 'DUPLICATE_SLUG'
	| 'MISSING_TITLE'
	| 'EMPTY_DOCUMENT'
	| 'BROKEN_INTERNAL_LINK'
	| 'BROKEN_ANCHOR'
	| 'MISSING_ASSET'
	| 'DUPLICATE_HEADING_ID'
	| 'INVALID_FRONTMATTER'
	| 'ORPHAN_PAGE';

export interface DocsDiagnostic {
	severity: DocsDiagnosticSeverity;
	code: DocsDiagnosticCode;
	/** Page id the finding belongs to. */
	pageId?: string;
	/** Source file, relative to the content root. */
	file?: string;
	line?: number;
	message: string;
	/** Closest valid alternatives, for a broken link or anchor. */
	suggestions?: string[];
}

export interface ValidateDocsOptions {
	manifest: DocsManifest;
	/** Raw Markdown keyed by page id. Pages without a source get structural checks only. */
	sources?: ReadonlyMap<string, string>;
	/** Resolves whether an asset path exists. Skipped when not supplied. */
	assetExists?: (path: string) => boolean;
	/** Non-documentation routes that internal links may target. */
	knownRoutes?: readonly string[];
	/** Report pages absent from every navigation tree. Defaults to false. */
	reportOrphans?: boolean;
	/** Check hidden and draft pages too. Defaults to true. */
	includeHidden?: boolean;
}

export interface DocsValidationResult {
	diagnostics: DocsDiagnostic[];
	errors: DocsDiagnostic[];
	warnings: DocsDiagnostic[];
	/** Pages that were checked. */
	checked: number;
}

function normalizePath(pathname: string): string {
	const path = pathname.split(/[?#]/, 1)[0] ?? '';
	const trimmed = path.replace(/\/+$/, '');
	return trimmed === '' ? '/' : trimmed;
}

/** Ranks candidates by edit distance so a broken link can suggest the intended page. */
function closest(target: string, candidates: readonly string[], limit = 3): string[] {
	const distance = (left: string, right: string): number => {
		const rows = Array.from({ length: left.length + 1 }, (_value, index) => [index]);
		for (let column = 0; column <= right.length; column += 1) {
			(rows[0] as number[])[column] = column;
		}

		for (let row = 1; row <= left.length; row += 1) {
			for (let column = 1; column <= right.length; column += 1) {
				const cost = left[row - 1] === right[column - 1] ? 0 : 1;
				(rows[row] as number[])[column] = Math.min(
					((rows[row - 1] as number[])[column] as number) + 1,
					((rows[row] as number[])[column - 1] as number) + 1,
					((rows[row - 1] as number[])[column - 1] as number) + cost
				);
			}
		}

		return (rows[left.length] as number[])[right.length] as number;
	};

	return candidates
		.map((candidate) => ({ candidate, score: distance(target, candidate) }))
		.filter((entry) => entry.score <= Math.max(3, Math.round(target.length * 0.4)))
		.sort((left, right) => left.score - right.score || left.candidate.localeCompare(right.candidate))
		.slice(0, limit)
		.map((entry) => entry.candidate);
}

function anchorsOf(source: string | undefined, page: DocsManifestPage): Set<string> {
	const anchors = new Set(page.headings.map((heading) => heading.id));

	if (source !== undefined) {
		for (const match of source.matchAll(/\bid\s*=\s*"([^"]+)"/g)) {
			anchors.add(match[1] as string);
		}
	}

	return anchors;
}

/**
 * Validates a documentation set.
 *
 * Every check works from the manifest plus the raw sources, so `docs validate` reports the
 * same structure the site renders. External links are deliberately not fetched: validation
 * stays offline and deterministic.
 */
export function validateDocs(options: ValidateDocsOptions): DocsValidationResult {
	const { manifest } = options;
	const includeHidden = options.includeHidden ?? true;
	const pages = manifest.pages.filter(
		(page) => includeHidden || (!page.hidden && !page.draft)
	);
	const diagnostics: DocsDiagnostic[] = [];
	const byPathname = new Map(pages.map((page) => [normalizePath(page.pathname), page]));
	const knownRoutes = new Set((options.knownRoutes ?? []).map(normalizePath));

	const seen = new Map<string, DocsManifestPage>();
	for (const page of pages) {
		const identity = [page.collection, page.version ?? '', page.locale ?? '', page.slug].join('|');
		const existing = seen.get(identity);

		if (existing) {
			diagnostics.push({
				severity: 'error',
				code: 'DUPLICATE_SLUG',
				pageId: page.id,
				file: page.source.relativePath,
				message: `Duplicate slug "${page.slug || 'index'}": also produced by ${existing.source.relativePath}.`
			});
		} else {
			seen.set(identity, page);
		}
	}

	const navigated = new Set<string>();
	const walk = (nodes: readonly { type: string; id?: string; children?: unknown }[]): void => {
		for (const node of nodes) {
			if (node.type === 'page' && node.id) {
				navigated.add(node.id);
			}
			if (Array.isArray(node.children)) {
				walk(node.children as { type: string; id?: string; children?: unknown }[]);
			}
		}
	};
	for (const tree of Object.values(manifest.navigation ?? {})) {
		walk(tree as unknown as { type: string; id?: string }[]);
	}

	for (const page of pages) {
		const source = options.sources?.get(page.id);
		const file = page.source.relativePath;

		if (page.title.trim() === '') {
			diagnostics.push({
				severity: 'error',
				code: 'MISSING_TITLE',
				pageId: page.id,
				file,
				message: 'Page has no title. Add a `title` to the frontmatter or a level-one heading.'
			});
		}

		const headingIds = page.headings.map((heading) => slugifyHeading(heading.text));
		const duplicates = headingIds.filter((id, index) => headingIds.indexOf(id) !== index);
		for (const duplicate of new Set(duplicates)) {
			diagnostics.push({
				severity: 'warning',
				code: 'DUPLICATE_HEADING_ID',
				pageId: page.id,
				file,
				message: `Two headings share the anchor "#${duplicate}"; links to it are ambiguous.`
			});
		}

		if (options.reportOrphans && !navigated.has(page.id) && !page.hidden && !page.draft) {
			diagnostics.push({
				severity: 'warning',
				code: 'ORPHAN_PAGE',
				pageId: page.id,
				file,
				message: 'Page is not reachable from navigation.'
			});
		}

		if (source === undefined) {
			continue;
		}

		if (source.trim() === '') {
			diagnostics.push({
				severity: 'warning',
				code: 'EMPTY_DOCUMENT',
				pageId: page.id,
				file,
				message: 'Document is empty.'
			});
		}

		for (const link of extractDocsLinks(source)) {
			const href = link.href.trim();
			if (href === '' || /^(https?:|mailto:|tel:|data:)/i.test(href)) {
				continue;
			}

			if (href.startsWith('#')) {
				const anchor = href.slice(1);
				const anchors = anchorsOf(source, page);
				if (!anchors.has(anchor)) {
					diagnostics.push({
						severity: 'error',
						code: 'BROKEN_ANCHOR',
						pageId: page.id,
						file,
						line: link.line,
						message: `Broken anchor: #${anchor}`,
						suggestions: closest(anchor, [...anchors]).map((entry) => `#${entry}`)
					});
				}
				continue;
			}

			if (link.kind === 'image' || /\.(png|jpe?g|gif|svg|webp|avif|mp4|webm|pdf)$/i.test(href)) {
				if (options.assetExists && !href.startsWith('http') && !options.assetExists(href)) {
					diagnostics.push({
						severity: 'error',
						code: 'MISSING_ASSET',
						pageId: page.id,
						file,
						line: link.line,
						message: `Missing asset: ${href}`
					});
				}
				continue;
			}

			if (!href.startsWith('/')) {
				// Relative links resolve against the page's own directory.
				continue;
			}

			const [pathPart = '', anchor] = href.split('#');
			const target = byPathname.get(normalizePath(pathPart));

			if (!target) {
				if (knownRoutes.has(normalizePath(pathPart))) {
					continue;
				}

				diagnostics.push({
					severity: 'error',
					code: 'BROKEN_INTERNAL_LINK',
					pageId: page.id,
					file,
					line: link.line,
					message: `Broken internal link: ${pathPart}`,
					suggestions: closest(normalizePath(pathPart), [...byPathname.keys()])
				});
				continue;
			}

			if (anchor) {
				const anchors = anchorsOf(options.sources?.get(target.id), target);
				if (!anchors.has(anchor)) {
					diagnostics.push({
						severity: 'error',
						code: 'BROKEN_ANCHOR',
						pageId: page.id,
						file,
						line: link.line,
						message: `Broken anchor: ${pathPart}#${anchor}`,
						suggestions: closest(anchor, [...anchors]).map((entry) => `${pathPart}#${entry}`)
					});
				}
			}
		}
	}

	const ordered = diagnostics.sort(
		(left, right) =>
			(left.file ?? '').localeCompare(right.file ?? '') || (left.line ?? 0) - (right.line ?? 0)
	);

	return {
		diagnostics: ordered,
		errors: ordered.filter((diagnostic) => diagnostic.severity === 'error'),
		warnings: ordered.filter((diagnostic) => diagnostic.severity === 'warning'),
		checked: pages.length
	};
}

/** Formats a diagnostic the way the CLI prints it. */
export function formatDocsDiagnostic(diagnostic: DocsDiagnostic): string {
	const location = diagnostic.file
		? `${diagnostic.file}${diagnostic.line === undefined ? '' : `:${diagnostic.line}`}`
		: '(project)';
	const lines = [
		`${diagnostic.severity.toUpperCase()} ${diagnostic.code} ${location}`,
		`  ${diagnostic.message}`
	];

	if (diagnostic.suggestions && diagnostic.suggestions.length > 0) {
		lines.push(`  Did you mean: ${diagnostic.suggestions.join(', ')}`);
	}

	return lines.join('\n');
}
