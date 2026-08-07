// src/lib/utils/codegen.ts
// Bidirectional code engine. The scene graph already speaks CSS (block.style is
// a CSS declaration map), so export is close to lossless and import works by
// rendering the markup offscreen, measuring it, and reading computed styles.
import type { DesignBlock } from '$lib/utils/canvastypes';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function camelToDash(str: string): string {
	return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function slug(name: string): string {
	return (
		name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'block'
	);
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/** Convert `rgb()` / `rgba()` to `#hex` when fully opaque (keeps the inspector's
 *  hex-based pickers happy). Leaves other formats untouched. */
function normalizeColor(value: string): string {
	const m = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
	if (!m) return value;
	const a = m[4] !== undefined ? Number(m[4]) : 1;
	if (a < 1) return value; // keep translucent colors as rgba
	const hex = [m[1], m[2], m[3]]
		.map((n) => Math.round(Number(n)).toString(16).padStart(2, '0'))
		.join('');
	return `#${hex}`.toUpperCase();
}

/** Serialize a block's style map into bare `prop: value` declarations (no
 *  trailing punctuation — formatters add CSS `;` or leave SASS bare). */
function styleToDecls(style: Record<string, string | number>): string[] {
	const decls: string[] = [];
	for (const [k, v] of Object.entries(style)) {
		if (v === '' || v === undefined || v === null) continue;
		decls.push(`${camelToDash(k)}: ${v}`);
	}
	return decls;
}

// ---------------------------------------------------------------------------
// Export: scene graph -> HTML + CSS / indented SASS
// ---------------------------------------------------------------------------

interface StyleRule {
	selector: string;
	decls: string[]; // bare `prop: value`, no semicolons
}

interface CssResult {
	html: string;
	css: string;
}

interface SassResult {
	html: string;
	sass: string;
}

/** Format rules as braced CSS. */
function formatCss(rules: StyleRule[]): string {
	return rules
		.map((r) => {
			if (r.decls.length === 0) return `${r.selector} {}`;
			return `${r.selector} {\n${r.decls.map((d) => `\t${d};`).join('\n')}\n}`;
		})
		.join('\n\n');
}

/** Format rules as pure indented SASS: tab-indented, no braces, no semicolons. */
function formatSass(rules: StyleRule[]): string {
	return rules.map((r) => `${r.selector}\n${r.decls.map((d) => `\t${d}`).join('\n')}`).join('\n\n');
}

function buildClassNames(items: DesignBlock[]): Map<string, string> {
	const used = new Set<string>();
	const map = new Map<string, string>();
	for (const b of items) {
		let base = slug(b.name);
		let cls = base;
		let n = 2;
		while (used.has(cls)) cls = `${base}-${n++}`;
		used.add(cls);
		map.set(b.id, cls);
	}
	return map;
}

function blockInnerHtml(block: DesignBlock, indent: string): string {
	switch (block.type) {
		case 'text':
			return `${indent}\t${escapeHtml(String(block.props.text ?? block.name))}\n`;
		case 'card': {
			const desc = block.props.description ? `${indent}\t<p>${escapeHtml(String(block.props.description))}</p>\n` : '';
			return `${indent}\t<h4>${escapeHtml(block.name)}</h4>\n${desc}`;
		}
		default:
			return '';
	}
}

/** Core walk: produce the HTML tree + a flat list of style rules (shared by the
 *  CSS, SASS, and Svelte formatters). */
function serialize(items: DesignBlock[]): { html: string; rules: StyleRule[] } {
	const classes = buildClassNames(items);
	const byId = new Map(items.map((b) => [b.id, b]));
	const roots = items.filter((b) => b.parentId === null && !b.hidden);

	let maxX = 0;
	let maxY = 0;
	for (const r of roots) {
		maxX = Math.max(maxX, r.x + r.w);
		maxY = Math.max(maxY, r.y + r.h);
	}

	const rules: StyleRule[] = [];
	rules.push({ selector: '.canvas-export', decls: ['position: relative', `width: ${maxX}px`, `height: ${maxY}px`] });

	const renderHtml = (block: DesignBlock, depth: number): string => {
		if (block.hidden) return '';
		const indent = '\t'.repeat(depth + 1);
		const cls = classes.get(block.id)!;

		const decls: string[] = [
			'position: absolute',
			`left: ${block.x}px`,
			`top: ${block.y}px`,
			`width: ${block.w}px`,
			`height: ${block.h}px`
		];
		if (block.rotation) decls.push(`transform: rotate(${block.rotation}deg)`);
		if (block.type === 'image') decls.push('object-fit: cover');
		if (block.type === 'text' && block.props.color) decls.push(`color: ${block.props.color}`);
		decls.push(...styleToDecls(block.style));
		rules.push({ selector: `.${cls}`, decls });

		if (block.type === 'image') {
			const src = String(block.props.src ?? '');
			return `${indent}<img class="${cls}" src="${escapeHtml(src)}" alt="${escapeHtml(block.name)}" />\n`;
		}

		const childIds = block.children ?? [];
		const childBlocks = childIds.map((id) => byId.get(id)).filter((b): b is DesignBlock => !!b && !b.hidden);
		const inner = blockInnerHtml(block, indent);
		const childHtml = childBlocks.map((c) => renderHtml(c, depth + 1)).join('');

		if (!inner && !childHtml) return `${indent}<div class="${cls}"></div>\n`;
		return `${indent}<div class="${cls}">\n${inner}${childHtml}${indent}</div>\n`;
	};

	const bodyHtml = roots.map((r) => renderHtml(r, 1)).join('');
	const html = `<div class="canvas-export">\n${bodyHtml}</div>`;
	return { html, rules };
}

export function exportHtmlCss(items: DesignBlock[]): CssResult {
	const { html, rules } = serialize(items);
	return { html, css: formatCss(rules) };
}

export function exportHtmlSass(items: DesignBlock[]): SassResult {
	const { html, rules } = serialize(items);
	return { html, sass: formatSass(rules) };
}

export function exportSvelte(items: DesignBlock[]): string {
	const { html, rules } = serialize(items);
	// Project convention is indented SASS, so emit a `lang="sass"` block.
	// Selectors sit at column 0 inside <style> (leading indentation is illegal
	// in indented SASS).
	return `${html}\n\n<style lang="sass">\n${formatSass(rules)}\n</style>\n`;
}

// ---------------------------------------------------------------------------
// Import: HTML/CSS -> scene graph (offscreen measure)
// ---------------------------------------------------------------------------

interface ImportResult {
	blocks: DesignBlock[];
	rootIds: string[];
}

// Curated set of computed-style props we lift onto blocks. Keeps the style map
// clean instead of dumping all ~350 computed properties.
const TEXT_PROPS: Array<[string, string]> = [
	['font-size', 'fontSize'],
	['font-weight', 'fontWeight'],
	['font-style', 'fontStyle'],
	['font-family', 'fontFamily'],
	['line-height', 'lineHeight'],
	['letter-spacing', 'letterSpacing'],
	['text-align', 'textAlign'],
	['text-transform', 'textTransform']
];

function captureBoxStyle(c: CSSStyleDeclaration): Record<string, string> {
	const style: Record<string, string> = {};

	// Background
	const bgImage = c.backgroundImage;
	if (bgImage && bgImage !== 'none') {
		style.background = bgImage;
	} else {
		const bg = c.backgroundColor;
		if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') style.background = normalizeColor(bg);
	}

	// Borders (uniform -> shorthand, otherwise per-side).
	const sides = ['Top', 'Right', 'Bottom', 'Left'] as const;
	const borders = sides.map((s) => ({
		w: parseFloat(c.getPropertyValue(`border-${s.toLowerCase()}-width`)) || 0,
		s: c.getPropertyValue(`border-${s.toLowerCase()}-style`),
		col: normalizeColor(c.getPropertyValue(`border-${s.toLowerCase()}-color`))
	}));
	const uniform = borders.every((b) => b.w === borders[0].w && b.s === borders[0].s && b.col === borders[0].col);
	if (uniform && borders[0].w > 0) {
		style.border = `${borders[0].w}px ${borders[0].s} ${borders[0].col}`;
	} else {
		borders.forEach((b, i) => {
			if (b.w > 0) style[`border${sides[i]}`] = `${b.w}px ${b.s} ${b.col}`;
		});
	}

	// Radius (uniform -> shorthand).
	const corners = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'] as const;
	const radii = corners.map((k) => parseFloat(c[k] as string) || 0);
	if (radii.some((r) => r > 0)) {
		if (radii.every((r) => r === radii[0])) style.borderRadius = `${radii[0]}px`;
		else {
			style.borderTopLeftRadius = `${radii[0]}px`;
			style.borderTopRightRadius = `${radii[1]}px`;
			style.borderBottomRightRadius = `${radii[2]}px`;
			style.borderBottomLeftRadius = `${radii[3]}px`;
		}
	}

	// Padding (uniform -> shorthand).
	const pads = sides.map((s) => parseFloat(c.getPropertyValue(`padding-${s.toLowerCase()}`)) || 0);
	if (pads.some((p) => p > 0)) {
		if (pads.every((p) => p === pads[0])) style.padding = `${pads[0]}px`;
		else {
			style.paddingTop = `${pads[0]}px`;
			style.paddingRight = `${pads[1]}px`;
			style.paddingBottom = `${pads[2]}px`;
			style.paddingLeft = `${pads[3]}px`;
		}
	}

	if (c.boxShadow && c.boxShadow !== 'none') style.boxShadow = c.boxShadow;
	const op = parseFloat(c.opacity);
	if (!Number.isNaN(op) && op < 1) style.opacity = String(op);

	return style;
}

export function htmlToBlocks(html: string, idGen: () => string): ImportResult {
	if (typeof document === 'undefined') return { blocks: [], rootIds: [] };

	// Sanitize: drop scripts and inline event handlers before injecting.
	const safe = html
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/\son\w+="[^"]*"/gi, '')
		.replace(/\son\w+='[^']*'/gi, '');

	const host = document.createElement('div');
	host.style.cssText =
		'position:fixed;left:0;top:0;width:1200px;visibility:hidden;pointer-events:none;z-index:-1;contain:layout style;';
	host.innerHTML = safe;
	document.body.appendChild(host);

	const blocks: DesignBlock[] = [];
	const rootIds: string[] = [];
	const MAX = 400;

	try {
		const hostRect = host.getBoundingClientRect();

		const convert = (el: Element, parentId: string | null, parentRect: DOMRect): string | null => {
			if (blocks.length >= MAX) return null;
			const rect = el.getBoundingClientRect();
			if (rect.width < 1 || rect.height < 1) return null;

			const tag = el.tagName.toLowerCase();
			const computed = getComputedStyle(el);
			const elementChildren = Array.from(el.children).filter(
				(c) => !['script', 'style', 'br'].includes(c.tagName.toLowerCase())
			);
			const directText = Array.from(el.childNodes)
				.filter((n) => n.nodeType === Node.TEXT_NODE)
				.map((n) => n.textContent || '')
				.join('')
				.trim();

			let type: DesignBlock['type'];
			const props: Record<string, unknown> = {};
			let style: Record<string, string> = {};

			if (tag === 'img') {
				type = 'image';
				props.src = (el as HTMLImageElement).src;
				style = captureBoxStyle(computed);
			} else if (elementChildren.length === 0 && directText) {
				type = 'text';
				props.text = directText;
				props.color = normalizeColor(computed.color);
				style = captureBoxStyle(computed);
				for (const [css, camel] of TEXT_PROPS) {
					const val = computed.getPropertyValue(css);
					if (val) style[camel] = val;
				}
			} else {
				type = 'frame';
				style = captureBoxStyle(computed);
			}

			const id = idGen();
			const block: DesignBlock = {
				id,
				type,
				name: tag === 'img' ? 'Image' : type === 'text' ? directText.slice(0, 24) || 'Text' : tag,
				x: Math.round(rect.left - parentRect.left),
				y: Math.round(rect.top - parentRect.top),
				w: Math.round(rect.width),
				h: Math.round(rect.height),
				rotation: 0,
				props,
				style,
				parentId,
				children: []
			};
			blocks.push(block);

			if (type === 'frame') {
				for (const child of elementChildren) {
					const childId = convert(child, id, rect);
					if (childId) block.children.push(childId);
				}
			}
			return id;
		};

		const topLevel = Array.from(host.children).filter(
			(c) => !['script', 'style'].includes(c.tagName.toLowerCase())
		);
		for (const el of topLevel) {
			const id = convert(el, null, hostRect);
			if (id) rootIds.push(id);
		}
	} finally {
		document.body.removeChild(host);
	}

	return { blocks, rootIds };
}
