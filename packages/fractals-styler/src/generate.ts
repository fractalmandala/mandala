import { BREAKPOINTS, BREAKPOINT_ORDER, resolveDeclarations, type Breakpoint } from './registry.js';
import type { ScanResult } from './scanner.js';

const BP_SUFFIX_RE = /^(.+)-(sm|md|lg|xl)$/;

function renderDeclarations(decls: { prop: string; value: string }[], indent: string): string {
	return decls.map((d) => `${indent}${d.prop}: ${d.value};`).join('\n');
}

export interface GenerateCssOptions {
	unit?: 'px' | 'rem';
}

/** Builds the CSS text for the `virtual:fractals-styler.css` module from a scan result.
 * Output is plain CSS (not SASS) — it's generated at build/dev time straight from the
 * registry, so there's nothing to preprocess. */
export function generateCss(
	{ classTokens, pxVars }: ScanResult,
	options: GenerateCssOptions = {}
): string {
	const unit = options.unit ?? 'px';
	const baseRules: Array<{ selector: string; decls: { prop: string; value: string }[] }> = [];
	const mediaRules: Record<Breakpoint, Array<{ selector: string; decls: { prop: string; value: string }[] }>> = {
		sm: [],
		md: [],
		lg: [],
		xl: []
	};

	for (const token of classTokens) {
		const bpMatch = token.match(BP_SUFFIX_RE);
		if (bpMatch) {
			const [, base, bp] = bpMatch;
			const decls = resolveDeclarations(base, unit);
			if (decls) mediaRules[bp as Breakpoint].push({ selector: token, decls });
			continue;
		}

		const decls = resolveDeclarations(token, unit);
		if (decls) baseRules.push({ selector: token, decls });
	}

	baseRules.sort((a, b) => a.selector.localeCompare(b.selector));

	const parts: string[] = [];

	if (pxVars.size > 0) {
		const sorted = [...pxVars].sort((a, b) => a - b);
		const lines = sorted.map((n) => `\t--px${n}: ${unit === 'rem' ? `${n / 16}rem` : `${n}px`};`).join('\n');
		parts.push(`:root {\n${lines}\n}`);
	}

	for (const { selector, decls } of baseRules) {
		parts.push(`.${selector} {\n${renderDeclarations(decls, '\t')}\n}`);
	}

	for (const bp of BREAKPOINT_ORDER) {
		const rules = mediaRules[bp];
		if (rules.length === 0) continue;
		rules.sort((a, b) => a.selector.localeCompare(b.selector));
		const body = rules
			.map(({ selector, decls }) => `\t.${selector} {\n${renderDeclarations(decls, '\t\t')}\n\t}`)
			.join('\n');
		parts.push(`@media ${BREAKPOINTS[bp]} {\n${body}\n}`);
	}

	return parts.join('\n\n') + (parts.length > 0 ? '\n' : '');
}

