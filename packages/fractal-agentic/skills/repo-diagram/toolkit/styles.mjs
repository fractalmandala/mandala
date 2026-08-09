/**
 * repograph/styles — the styling layer of a layout diagram.
 *
 * Answers the question "if I want to change how this looks, what do I touch,
 * and what else breaks?" — which is the whole reason to put CSS on the map.
 *
 * Two passes:
 *   1. definitions — what every stylesheet (and scoped <style> block) declares:
 *      class selectors, CSS custom properties, SASS mixins/variables, @use graph
 *   2. usage       — what every component actually references
 *
 * A class is AUTHORED if something in the repo defines it, and UTILITY otherwise
 * (Tailwind, Bootstrap, whatever). That rule needs no framework knowledge and
 * falls back gracefully: authored classes get listed and linked to their
 * definition site; utility classes get counted, because listing 400 of them per
 * node is noise, not information.
 */
import fs from 'node:fs';
import path from 'node:path';

export const STYLE_EXT = ['.css', '.scss', '.sass', '.less', '.styl', '.pcss'];

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// ------------------------------------------------------------- definitions

export function parseStylesheet(src) {
	src = strip(src);
	const classes = new Set();
	const tokens = new Set();
	const mixins = new Set();
	const vars = new Set();
	const imports = new Set();
	const layers = new Set();

	// selector blocks: take the text before each "{" and pull class names out
	for (const m of src.matchAll(/([^{}();@]+)\{/g)) {
		const sel = m[1];
		if (/^\s*$/.test(sel)) continue;
		for (const c of sel.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) classes.add(c[1]);
	}
	// indented SASS has no braces — selector lines start at some indent and end bare
	if (!src.includes('{')) {
		for (const line of src.split('\n')) {
			const t = line.trim();
			if (!t || t.startsWith('@') || t.startsWith('$') || /:\s*\S/.test(t)) continue;
			for (const c of t.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) classes.add(c[1]);
		}
	}

	for (const m of src.matchAll(/(--[\w-]+)\s*:/g)) tokens.add(m[1]);
	for (const m of src.matchAll(/@mixin\s+([\w-]+)/g)) mixins.add(m[1]);
	for (const m of src.matchAll(/^\s*(\$[\w-]+)\s*:/gm)) vars.add(m[1]);
	for (const m of src.matchAll(/@(?:use|forward|import)\s+['"]([^'"]+)['"]/g)) imports.add(m[1]);
	for (const m of src.matchAll(/@layer\s+([\w-]+)/g)) layers.add(m[1]);

	return {
		classes: [...classes], tokens: [...tokens], mixins: [...mixins],
		vars: [...vars], imports: [...imports], layers: [...layers]
	};
}

// ------------------------------------------------------------------- usage

const BAD_TOKEN = /[${}()<>`'"=]|^\s*$/;

function pushClasses(raw, into) {
	for (const t of String(raw).split(/\s+/)) {
		const c = t.trim();
		if (!c || c.length > 64 || BAD_TOKEN.test(c)) continue;
		if (!/^[-A-Za-z_[]/.test(c)) continue;
		into.add(c);
	}
}

export function parseUsage(src) {
	src = strip(src);
	const classes = new Set();
	const tokens = new Set();
	const mixins = new Set();
	const recipes = new Set();
	const styleImports = new Set();

	// class="…" / className="…" / class='…'
	for (const m of src.matchAll(/\bclass(?:Name)?\s*=\s*(["'])([^"']*)\1/g)) pushClasses(m[2], classes);

	// class={…} / className={…} — pull every string literal inside the expression
	for (const m of src.matchAll(/\bclass(?:Name)?\s*=\s*\{([\s\S]{0,1200}?)\}\s*(?=[\s/>])/g)) {
		for (const lit of m[1].matchAll(/(["'`])([^"'`]*)\1/g)) pushClasses(lit[2], classes);
	}

	// helper calls that build class strings: cn(), clsx(), cva(), tv(), twMerge()
	for (const m of src.matchAll(/\b(cn|clsx|classnames|cva|tv|twMerge|twJoin)\s*\(/g)) {
		const start = m.index + m[0].length;
		let depth = 1, i = start;
		while (i < src.length && depth > 0 && i - start < 4000) {
			const ch = src[i];
			if (ch === '(') depth++;
			else if (ch === ')') depth--;
			i++;
		}
		const body = src.slice(start, i - 1);
		for (const lit of body.matchAll(/(["'`])([^"'`]*)\1/g)) pushClasses(lit[2], classes);
		if (m[1] === 'cva' || m[1] === 'tv') recipes.add(m[1]);
	}

	// Svelte class: directive
	for (const m of src.matchAll(/\bclass:([\w-]+)/g)) classes.add(m[1]);
	// Vue / Angular binding
	for (const m of src.matchAll(/\[?:class\]?\s*=\s*(["'])([\s\S]{0,400}?)\1/g)) {
		for (const lit of m[2].matchAll(/(["'])([^"']*)\1/g)) pushClasses(lit[2], classes);
	}

	for (const m of src.matchAll(/var\(\s*(--[\w-]+)/g)) tokens.add(m[1]);
	for (const m of src.matchAll(/@include\s+([\w-]+)/g)) mixins.add(m[1]);
	for (const m of src.matchAll(/\bimport\s+['"]([^'"]+\.(?:css|scss|sass|less|styl|pcss))['"]/g)) styleImports.add(m[1]);

	// scoped <style> block inside a single-file component
	let scoped = null;
	const sm = src.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
	if (sm) scoped = parseStylesheet(sm[1]);

	return {
		classes: [...classes], tokens: [...tokens], mixins: [...mixins],
		recipes: [...recipes], styleImports: [...styleImports], scoped
	};
}

// ------------------------------------------------------------------ analyse

/**
 * @param root        repo root
 * @param styleFiles  [{rel, loc}] stylesheet files
 * @param codeFiles   [{rel, loc}] component/source files
 * @param containerOf (rel) => visible container id
 * @returns { sheets, byContainer, edges }
 */
export function analyzeStyles(root, styleFiles, codeFiles, containerOf) {
	// ---- pass 1: definitions
	const sheets = new Map(); // rel -> parsed
	for (const f of styleFiles) {
		try { sheets.set(f.rel, { ...parseStylesheet(fs.readFileSync(path.join(root, f.rel), 'utf8')), rel: f.rel, loc: f.loc }); }
		catch { }
	}

	// reverse indexes: class/token/mixin -> [stylesheet rel]
	const defOf = { classes: new Map(), tokens: new Map(), mixins: new Map() };
	const index = (kind, name, rel) => {
		if (!defOf[kind].has(name)) defOf[kind].set(name, []);
		defOf[kind].get(name).push(rel);
	};
	for (const s of sheets.values()) {
		for (const c of s.classes) index('classes', c, s.rel);
		for (const t of s.tokens) index('tokens', t, s.rel);
		for (const m of s.mixins) index('mixins', m, s.rel);
	}

	// ---- pass 2: usage, aggregated per visible container
	const byContainer = new Map();
	const bump = (cid) => {
		if (!byContainer.has(cid)) byContainer.set(cid, {
			authored: new Map(), utility: new Map(), tokens: new Map(),
			mixins: new Map(), scopedClasses: 0, scopedBlocks: 0, recipes: 0, filesStyled: 0
		});
		return byContainer.get(cid);
	};

	const consumers = { classes: new Map(), tokens: new Map(), mixins: new Map() };
	const noteConsumer = (kind, name, cid) => {
		if (!consumers[kind].has(name)) consumers[kind].set(name, new Set());
		consumers[kind].get(name).add(cid);
	};

	const inc = (map, k) => map.set(k, (map.get(k) ?? 0) + 1);
	const styleEdges = new Map();
	const addEdge = (src, tgt, layer) => {
		if (!src || !tgt || src === tgt) return;
		const key = `${src}→${tgt}→${layer}`;
		const cur = styleEdges.get(key) ?? { source: src, target: tgt, layer, weight: 0 };
		cur.weight++;
		styleEdges.set(key, cur);
	};

	for (const f of codeFiles) {
		let src = '';
		try { src = fs.readFileSync(path.join(root, f.rel), 'utf8'); } catch { continue; }
		if (!/class|var\(|@include/i.test(src)) continue;
		const u = parseUsage(src);
		if (!u.classes.length && !u.tokens.length && !u.scoped) continue;
		const cid = containerOf(f.rel);
		const b = bump(cid);
		b.filesStyled++;
		if (u.recipes.length) b.recipes++;

		const scopedNames = new Set(u.scoped?.classes ?? []);
		if (u.scoped) { b.scopedBlocks++; b.scopedClasses += scopedNames.size; }

		for (const c of u.classes) {
			if (scopedNames.has(c)) continue;                 // defined in the same file
			const defs = defOf.classes.get(c);
			if (defs) {
				inc(b.authored, c);
				noteConsumer('classes', c, cid);
				for (const d of new Set(defs)) addEdge(cid, containerOf(d), 'style:class');
			} else {
				inc(b.utility, c);
			}
		}
		for (const t of u.tokens) {
			inc(b.tokens, t);
			noteConsumer('tokens', t, cid);
			for (const d of new Set(defOf.tokens.get(t) ?? [])) addEdge(cid, containerOf(d), 'style:token');
		}
		for (const mx of u.mixins) {
			inc(b.mixins, mx);
			noteConsumer('mixins', mx, cid);
			for (const d of new Set(defOf.mixins.get(mx) ?? [])) addEdge(cid, containerOf(d), 'style:mixin');
		}
	}

	// stylesheet @use / @import graph
	for (const s of sheets.values()) {
		for (const spec of s.imports) {
			const base = path.posix.normalize(path.posix.join(path.posix.dirname(s.rel), spec));
			const hit = [...sheets.keys()].find((r) =>
				r === base ||
				STYLE_EXT.some((e) => r === base + e || r === `${path.posix.dirname(base)}/_${path.posix.basename(base)}${e}`)
			);
			if (hit) addEdge(containerOf(s.rel), containerOf(hit), 'style:import');
		}
	}

	return { sheets, byContainer, defOf, consumers, edges: [...styleEdges.values()] };
}

/** Trim the per-container maps down to what the renderer will actually show. */
export function summarize(agg, topN = 12) {
	const top = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, topN).map(([name, count]) => ({ name, count }));
	const total = (m) => [...m.values()].reduce((a, b) => a + b, 0);
	return {
		authored: top(agg.authored),
		authoredTotal: agg.authored.size,
		utilityTop: top(agg.utility).slice(0, 8),
		utilityDistinct: agg.utility.size,
		utilityUses: total(agg.utility),
		tokens: top(agg.tokens),
		tokensDistinct: agg.tokens.size,
		mixins: top(agg.mixins),
		scopedBlocks: agg.scopedBlocks,
		scopedClasses: agg.scopedClasses,
		recipeFiles: agg.recipes,
		filesStyled: agg.filesStyled
	};
}