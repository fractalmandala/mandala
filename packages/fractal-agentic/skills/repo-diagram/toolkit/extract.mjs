#!/usr/bin/env node
/**
 * repograph/extract — repo → graph.json
 *
 * Emits the diagram-agnostic graph contract:
 *   { meta, nodes: [{id, kind, label, parentId, data}], edges: [{id, source, target, layer, weight}] }
 *
 * Containment comes from the filesystem + workspace manifests.
 * Import edges are parsed, resolved, then LIFTED to the deepest visible ancestor
 * and merged with a weight, so a collapsed container loses detail but never signal.
 */
import fs from 'node:fs';
import path from 'node:path';
import { STYLE_EXT, analyzeStyles, summarize } from './styles.mjs';

const DEFAULTS = {
	exclude: [
		'node_modules', '.git', 'dist', 'build', '.turbo', '.svelte-kit', '.next',
		'target', 'coverage', '.venv', '__pycache__', 'vendor', '.cache', 'out'
	],
	codeExt: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.svelte', '.astro', '.vue'],
	styleExt: STYLE_EXT,
	maxDepth: 3,          // directory depth below a package root before rolling up
	minLeafFiles: 1,      // drop containers with fewer than this many code files
	maxStyleNodes: 40     // beyond this, minor stylesheets fold into their container
};

// ---------------------------------------------------------------- fs walk

function walk(root, opts, rel = '', acc = { files: [], styleFiles: [], dirs: new Set() }) {
	let entries;
	try { entries = fs.readdirSync(path.join(root, rel), { withFileTypes: true }); }
	catch { return acc; }
	for (const e of entries) {
		if (opts.exclude.includes(e.name) || e.name.startsWith('.') && e.name !== '.') continue;
		const r = rel ? `${rel}/${e.name}` : e.name;
		if (e.isDirectory()) { acc.dirs.add(r); walk(root, opts, r, acc); continue; }
		const ext = path.extname(e.name);
		const isCode = opts.codeExt.includes(ext);
		const isStyle = opts.styleExt.includes(ext);
		if (!isCode && !isStyle) continue;
		let loc = 0;
		try { loc = fs.readFileSync(path.join(root, r), 'utf8').split('\n').length; } catch { }
		(isStyle ? acc.styleFiles : acc.files).push({ rel: r, loc });
	}
	return acc;
}

// -------------------------------------------------------- workspace packages

function findPackages(root, opts) {
	// A "package" is any dir with a package.json carrying a name. These become
	// first-class nodes so the diagram reflects module boundaries, not just folders.
	const pkgs = [];
	const seen = new Set();
	const scan = (rel, depth) => {
		if (depth > 3) return;
		const abs = path.join(root, rel);
		const manifest = path.join(abs, 'package.json');
		if (fs.existsSync(manifest)) {
			try {
				const j = JSON.parse(fs.readFileSync(manifest, 'utf8'));
				if (j.name && !seen.has(rel)) { seen.add(rel); pkgs.push({ rel, name: j.name }); }
			} catch { }
		}
		let entries = [];
		try { entries = fs.readdirSync(abs, { withFileTypes: true }); } catch { return; }
		for (const e of entries) {
			if (!e.isDirectory() || opts.exclude.includes(e.name) || e.name.startsWith('.')) continue;
			scan(rel ? `${rel}/${e.name}` : e.name, depth + 1);
		}
	};
	scan('', 0);
	return pkgs.sort((a, b) => b.rel.length - a.rel.length); // deepest first
}

// ------------------------------------------------------------ import parsing

const IMPORT_RE = [
	/\bimport\s+(?:[\w*\s{},$]*\s+from\s+)?['"]([^'"]+)['"]/g,
	/\bexport\s+(?:[\w*\s{},$]*\s+)?from\s+['"]([^'"]+)['"]/g,
	/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
	/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g
];

function parseImports(abs) {
	let src = '';
	try { src = fs.readFileSync(abs, 'utf8'); } catch { return []; }
	// cheap comment strip so commented-out imports don't count
	src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
	const out = new Set();
	for (const re of IMPORT_RE) { let m; re.lastIndex = 0; while ((m = re.exec(src))) out.add(m[1]); }
	return [...out];
}

// Framework conventions that are never written into tsconfig paths.
// Resolved relative to the containing package root, not the repo root.
const FRAMEWORK_ALIASES = [
	['$lib/', 'src/lib/'],   // SvelteKit
	['~/', 'src/'],          // Nuxt / common
	['@/', 'src/'],          // Vue / Next convention
	['#/', 'src/']
];

function resolveSpecifier(spec, fromRel, root, opts, fileSet, pkgByName, tsPaths, pkgRoot = '') {
	// 1. relative
	if (spec.startsWith('.')) {
		const base = path.posix.normalize(path.posix.join(path.posix.dirname(fromRel), spec));
		return tryExtensions(base, fileSet, opts);
	}
	// 2. workspace package name (exact or subpath)
	for (const [name, rel] of pkgByName) {
		if (spec === name || spec.startsWith(name + '/')) {
			const sub = spec.slice(name.length).replace(/^\//, '');
			const guess = sub ? `${rel}/src/${sub}` : `${rel}/src/index`;
			return tryExtensions(guess, fileSet, opts)
				|| tryExtensions(`${rel}/${sub || 'index'}`, fileSet, opts)
				|| { pkgRel: rel };
		}
	}
	// 3. framework alias, relative to the owning package
	for (const [pre, dir] of FRAMEWORK_ALIASES) {
		if (!spec.startsWith(pre)) continue;
		const base = path.posix.join(pkgRoot, dir, spec.slice(pre.length));
		const hit = tryExtensions(base, fileSet, opts);
		if (hit) return hit;
	}
	// 4. tsconfig-style alias
	for (const [alias, targets] of tsPaths) {
		const stem = alias.replace(/\*$/, '');
		if (spec.startsWith(stem)) {
			const rest = spec.slice(stem.length);
			for (const t of targets) {
				const hit = tryExtensions(path.posix.normalize(t.replace(/\*$/, '') + rest), fileSet, opts);
				if (hit) return hit;
			}
		}
	}
	return null; // external dependency — not drawn
}

function tryExtensions(base, fileSet, opts) {
	if (fileSet.has(base)) return { fileRel: base };
	for (const ext of opts.codeExt) if (fileSet.has(base + ext)) return { fileRel: base + ext };
	for (const ext of opts.codeExt) if (fileSet.has(`${base}/index${ext}`)) return { fileRel: `${base}/index${ext}` };
	return null;
}

function readTsPaths(root) {
	const out = [];
	for (const f of ['tsconfig.json', 'tsconfig.base.json', 'jsconfig.json']) {
		const p = path.join(root, f);
		if (!fs.existsSync(p)) continue;
		try {
			const raw = fs.readFileSync(p, 'utf8').replace(/\/\/.*$/gm, '').replace(/,(\s*[}\]])/g, '$1');
			const paths = JSON.parse(raw)?.compilerOptions?.paths || {};
			for (const [k, v] of Object.entries(paths)) out.push([k, v.map(s => s.replace(/^\.\//, ''))]);
		} catch { }
	}
	return out;
}

// ------------------------------------------------------------------- build

export function buildGraph(root, userOpts = {}) {
	const opts = { ...DEFAULTS, ...userOpts };
	const { files, styleFiles } = walk(root, opts);
	const fileSet = new Set(files.map(f => f.rel));
	const allManifests = findPackages(root, opts);
	// The root manifest isn't drawn as a container (it would wrap everything),
	// but it still counts as a package for the stats.
	const packages = allManifests.filter(p => p.rel !== '');
	const pkgByName = packages.map(p => [p.name, p.rel]);
	const tsPaths = readTsPaths(root);

	const pkgOf = (rel) => packages.find(p => rel === p.rel || rel.startsWith(p.rel + '/'))?.rel ?? '';

	// --- visible container id for a file: package root + up to maxDepth dirs
	const containerOf = (rel) => {
		const pkg = pkgOf(rel);
		const inner = pkg ? rel.slice(pkg.length + 1) : rel;
		const parts = inner.split('/').slice(0, -1);
		// "src" / "lib" are scaffolding, not architecture — don't spend a level on them
		const meaningful = ['src', 'lib'].includes(parts[0]) ? parts.slice(1) : parts;
		const kept = meaningful.slice(0, opts.maxDepth);
		return [pkg, ...kept].filter(Boolean).join('/') || '(root)';
	};

	// --- nodes: build every ancestor chain so nesting is complete
	const nodes = new Map();
	const ensure = (id, kind, label, parentId) => {
		if (!nodes.has(id)) nodes.set(id, { id, kind, label, parentId, data: { files: 0, loc: 0 } });
		return nodes.get(id);
	};

	for (const p of packages) {
		const parent = packages.find(q => q.rel !== p.rel && p.rel.startsWith(q.rel + '/'))?.rel;
		ensure(p.rel, 'package', p.name, parent ?? null);
	}

	for (const f of files) {
		const cid = containerOf(f.rel);
		if (cid === '(root)') continue;
		// build the chain from package root down to the container
		const pkg = pkgOf(f.rel);
		const segs = cid.split('/');
		let acc = '';
		let parent = null;
		for (const seg of segs) {
			acc = acc ? `${acc}/${seg}` : seg;
			if (pkg && (acc === pkg || pkg.startsWith(acc))) { // still inside the package path
				if (acc === pkg) { parent = pkg; }
				continue;
			}
			ensure(acc, 'dir', seg, parent);
			parent = acc;
		}
		const n = nodes.get(cid) ?? nodes.get(pkg);
		if (n) { n.data.files++; n.data.loc += f.loc; }
	}

	// prune empty / trivial containers, reparenting children
	for (const n of [...nodes.values()]) {
		if (n.kind === 'package') continue;
		const kids = [...nodes.values()].filter(k => k.parentId === n.id);
		if (n.data.files < opts.minLeafFiles && kids.length === 0) nodes.delete(n.id);
	}

	// roll subtree totals upward for label badges
	const childrenOf = (id) => [...nodes.values()].filter(k => k.parentId === id);
	const rollup = (n) => {
		let files = n.data.files, loc = n.data.loc;
		for (const k of childrenOf(n.id)) { const r = rollup(k); files += r.files; loc += r.loc; }
		n.data.totalFiles = files; n.data.totalLoc = loc;
		return { files, loc };
	};
	for (const n of nodes.values()) if (!n.parentId) rollup(n);

	// --- edges: parse, resolve, lift to visible containers, merge with weight
	const visibleFor = (rel) => {
		let cid = containerOf(rel);
		while (cid && !nodes.has(cid)) cid = cid.split('/').slice(0, -1).join('/');
		return cid || pkgOf(rel) || null;
	};

	const tally = new Map();
	let parsed = 0, resolved = 0;
	for (const f of files) {
		const specs = parseImports(path.join(root, f.rel));
		parsed += specs.length;
		const src = visibleFor(f.rel);
		if (!src) continue;
		for (const spec of specs) {
			const hit = resolveSpecifier(spec, f.rel, root, opts, fileSet, pkgByName, tsPaths, pkgOf(f.rel));
			if (!hit) continue;
			resolved++;
			const tgt = hit.fileRel ? visibleFor(hit.fileRel) : hit.pkgRel;
			if (!tgt || tgt === src) continue;
			const crossPkg = pkgOf(f.rel) !== (hit.fileRel ? pkgOf(hit.fileRel) : hit.pkgRel);
			const key = `${src}→${tgt}`;
			const cur = tally.get(key) ?? { source: src, target: tgt, weight: 0, crossPkg };
			cur.weight++;
			tally.set(key, cur);
		}
	}

	const importEdges = [...tally.values()].map((e, i) => ({
		id: `e${i}`,
		source: e.source,
		target: e.target,
		layer: e.crossPkg ? 'import:cross-package' : 'import:internal',
		weight: e.weight
	}));

	// ------------------------------------------------------------ style layer
	// Stylesheets become first-class nodes so you can see *where* a class lives.
	// Beyond maxStyleNodes the minor ones fold into their container, because a
	// SASS tree with 300 partials would otherwise drown the diagram.
	const sheetRank = styleFiles
		.map(f => {
			let weight = 0;
			try {
				const s = fs.readFileSync(path.join(root, f.rel), 'utf8');
				weight = (s.match(/[{;]/g) ?? []).length;
			} catch { }
			return { ...f, weight };
		})
		.sort((a, b) => b.weight - a.weight);
	const promoted = new Set(sheetRank.slice(0, opts.maxStyleNodes).map(f => f.rel));

	for (const f of styleFiles) {
		if (!promoted.has(f.rel)) continue;
		let parent = visibleFor(f.rel);
		if (!parent || !nodes.has(parent)) parent = pkgOf(f.rel) || null;
		if (parent && !nodes.has(parent)) parent = null;
		nodes.set(f.rel, {
			id: f.rel,
			kind: 'stylesheet',
			label: path.basename(f.rel),
			parentId: parent,
			data: { files: 1, loc: f.loc, totalFiles: 1, totalLoc: f.loc }
		});
	}

	// Map any repo path to the node that represents it in the diagram.
	const nodeIdFor = (rel) => (nodes.has(rel) ? rel : visibleFor(rel));

	const style = analyzeStyles(root, styleFiles, files, nodeIdFor);

	for (const [cid, agg] of style.byContainer) {
		const n = nodes.get(cid);
		if (n) n.data.styles = summarize(agg);
	}
	for (const [rel, s] of style.sheets) {
		const n = nodes.get(rel);
		if (!n) continue;
		n.data.defines = {
			classes: s.classes.length,
			tokens: s.tokens.length,
			mixins: s.mixins.length,
			vars: s.vars.length,
			layers: s.layers,
			// who consumes what this sheet defines — the "what breaks if I edit this" list
			consumedBy: [...new Set([
				...s.classes.flatMap(c => [...(style.consumers.classes.get(c) ?? [])]),
				...s.tokens.flatMap(t => [...(style.consumers.tokens.get(t) ?? [])]),
				...s.mixins.flatMap(m => [...(style.consumers.mixins.get(m) ?? [])])
			])].slice(0, 40)
		};
		n.data.topClasses = s.classes
			.map(c => ({ name: c, users: (style.consumers.classes.get(c) ?? new Set()).size }))
			.sort((a, b) => b.users - a.users)
			.slice(0, 12);
	}

	const styleEdges = style.edges
		.filter(e => nodes.has(e.source) && nodes.has(e.target))
		.map((e, i) => ({ id: `s${i}`, source: e.source, target: e.target, layer: e.layer, weight: e.weight }));

	const edges = [...importEdges, ...styleEdges];

	const stats = {
		files: files.length,
		loc: files.reduce((a, f) => a + f.loc, 0),
		packages: allManifests.length,
		stylesheets: styleFiles.length,
		authoredClasses: style.defOf.classes.size,
		designTokens: style.defOf.tokens.size,
		mixins: style.defOf.mixins.size,
		nodes: nodes.size,
		edges: edges.length,
		importsParsed: parsed,
		importsResolved: resolved
	};

	// Findings the numbers support on their own. Anything requiring judgement is
	// left to an agent — see the notes guidance in the skill.
	const notes = [];
	const ratio = parsed ? resolved / parsed : 1;
	if (ratio < 0.7) notes.push({
		title: `Import resolution ${(ratio * 100).toFixed(0)}%`,
		body: `${parsed - resolved} of ${parsed} specifiers did not resolve to a repo file. Most are external packages; a low ratio means alias config is being missed.`,
		severity: ratio < 0.5 ? 'alert' : 'info'
	});
	const byDeg = [...nodes.values()]
		.map(n => ({ n, deg: edges.filter(e => e.source === n.id || e.target === n.id).length }))
		.sort((a, b) => b.deg - a.deg);
	if (byDeg[0] && byDeg[0].deg > 8) notes.push({
		title: `${byDeg[0].n.label} is the dependency hub`,
		body: `${byDeg[0].deg} connections — more than any other container. Changes here have the widest blast radius.`,
		severity: 'warn',
		path: byDeg[0].n.id
	});
	const totalLoc = stats.loc || 1;
	const biggest = [...nodes.values()].filter(n => n.kind === 'package')
		.sort((a, b) => (b.data.totalLoc ?? 0) - (a.data.totalLoc ?? 0))[0];
	if (biggest && (biggest.data.totalLoc ?? 0) / totalLoc > 0.4) notes.push({
		title: `${biggest.label} holds ${Math.round((biggest.data.totalLoc / totalLoc) * 100)}% of the code`,
		body: 'One package dominates the repo. Worth checking whether it is really one concern.',
		severity: 'info',
		path: biggest.id
	});
	if (stats.stylesheets && !stats.authoredClasses) notes.push({
		title: 'Style layer is empty',
		body: `${stats.stylesheets} stylesheet(s) found but no classes parsed — the analyzer is missing this syntax.`,
		severity: 'alert'
	});

	return {
		version: 1,
		scan: 'layout',
		project: {
			name: path.basename(root),
			slug: path.basename(root).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
			date: new Date().toISOString().slice(0, 10)
		},
		stats,
		groups: [],
		nodes: [...nodes.values()],
		edges,
		flows: [],
		notes
	};
}

// ------------------------------------------------------------------- cli
if (import.meta.url === `file://${process.argv[1]}`) {
	const root = path.resolve(process.argv[2] ?? '.');
	const depth = Number(process.argv[3] ?? DEFAULTS.maxDepth);
	const out = process.argv[4] ?? 'scan.json';
	const scan = buildGraph(root, { maxDepth: depth });
	fs.writeFileSync(out, JSON.stringify(scan, null, 2));
	console.error(JSON.stringify(scan.stats, null, 2));
	const { validate, report } = await import('./validate.mjs');
	if (!report(validate(scan))) process.exit(1);
}