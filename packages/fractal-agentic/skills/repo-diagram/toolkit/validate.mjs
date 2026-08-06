#!/usr/bin/env node
/**
 * repograph/validate — one gate for every scan.
 *
 * Whether a scan was written by an extractor or by an agent, it passes through
 * here before it is rendered. Diagrams fail silently: a dangling flow step or a
 * quietly-empty style layer produces a picture that looks fine and is wrong.
 */
import fs from 'node:fs';

export const NODE_KINDS = [
	// layout
	'package', 'dir', 'file', 'stylesheet',
	// system
	'entry', 'cron', 'service', 'state', 'command', 'ipc', 'store',
	'component', 'layout', 'function', 'shared', 'external', 'tool', 'integration',
	'model', 'agent', 'style',
	// boundary
	'layer'
];

export const EDGE_KINDS = [
	'renders', 'imports', 'reads', 'writes', 'calls', 'commands',
	'dispatches', 'listens', 'ipc', 'navigates', 'triggers', 'uses',
	'transforms', 'allowed', 'violation', 'class', 'token', 'mixin', 'import'
];

// Layered layer names are `family:variant` — validate the family, since the
// variant is an open vocabulary the extractor is free to extend.
export const EDGE_FAMILIES = ['import', 'style', 'data', 'call', 'order'];

export const SCANS = ['layout', 'system', 'boundary', 'health'];

const CAPS = {
	layout: { nodes: 400, edges: 2000, flows: 12, notes: 8 },
	system: { nodes: 80, edges: 200, flows: 10, notes: 8 },
	boundary: { nodes: 40, edges: 200, flows: 0, notes: 12 },
	health: { nodes: 0, edges: 0, flows: 0, notes: 8 }
};

export function validate(scan, { strict = false } = {}) {
	const errors = [];
	const warnings = [];
	const E = (m) => errors.push(m);
	const W = (m) => warnings.push(m);

	if (scan.version !== 1) E(`version must be 1, got ${scan.version}`);
	if (!SCANS.includes(scan.scan)) E(`scan must be one of ${SCANS.join(', ')} — got "${scan.scan}"`);
	if (!scan.project?.name) E('project.name is required');
	if (!/^\d{4}-\d{2}-\d{2}$/.test(scan.project?.date ?? '')) E('project.date must be YYYY-MM-DD');

	const caps = CAPS[scan.scan] ?? CAPS.layout;

	// ---- health has no graph; it carries files instead
	if (scan.scan === 'health') {
		if (!Array.isArray(scan.files) || !scan.files.length) E('health scan needs a non-empty files[]');
		for (const f of scan.files ?? []) {
			if (!f.path) E('health file missing path');
			for (const k of ['loc', 'commits', 'complexity']) {
				if (typeof f[k] !== 'number') E(`health file ${f.path}: ${k} must be a number`);
			}
			if (f.complexity < 0 || f.complexity > 100) E(`health file ${f.path}: complexity out of 0..100`);
		}
		if ((scan.notes?.length ?? 0) > caps.notes) W(`notes over cap (${scan.notes.length} > ${caps.notes})`);
		return finish(scan, errors, warnings, strict);
	}

	// ---- graph views
	const nodes = scan.nodes ?? [];
	const edges = scan.edges ?? [];
	const flows = scan.flows ?? [];
	const notes = scan.notes ?? [];

	if (!nodes.length) E('nodes[] is empty');

	const ids = new Set();
	for (const n of nodes) {
		if (!n.id) { E('node with no id'); continue; }
		if (ids.has(n.id)) E(`duplicate node id "${n.id}"`);
		ids.add(n.id);
		if (!n.label) W(`node "${n.id}" has no label`);
		if (n.kind && !NODE_KINDS.includes(n.kind)) W(`node "${n.id}" unknown kind "${n.kind}"`);
	}
	for (const n of nodes) {
		if (n.parentId && !ids.has(n.parentId)) E(`node "${n.id}" parentId "${n.parentId}" does not exist`);
		if (n.parentId === n.id) E(`node "${n.id}" is its own parent`);
	}
	// containment must be acyclic, or the renderer recurses forever
	const byId = new Map(nodes.map((n) => [n.id, n]));
	for (const n of nodes) {
		const seen = new Set();
		let cur = n.parentId;
		while (cur) {
			if (seen.has(cur)) { E(`containment cycle at "${n.id}"`); break; }
			seen.add(cur);
			cur = byId.get(cur)?.parentId;
		}
	}

	const groupIds = new Set((scan.groups ?? []).map((g) => g.id));
	for (const n of nodes) {
		if (n.group && groupIds.size && !groupIds.has(n.group)) {
			W(`node "${n.id}" references undeclared group "${n.group}"`);
		}
	}

	for (const e of edges) {
		if (!ids.has(e.source)) E(`edge ${e.source}→${e.target}: source does not exist`);
		if (!ids.has(e.target)) E(`edge ${e.source}→${e.target}: target does not exist`);
		const raw = e.layer ?? e.kind;
		if (raw?.includes(':')) {
			const family = raw.split(':')[0];
			if (!EDGE_FAMILIES.includes(family)) W(`edge ${e.source}→${e.target}: unknown layer family "${family}"`);
		} else if (raw && !EDGE_KINDS.includes(raw)) {
			W(`edge ${e.source}→${e.target}: unknown kind "${raw}"`);
		}
	}

	for (const f of flows) {
		if (!f.id) E('flow with no id');
		if (!f.trigger) W(`flow "${f.id}" has no trigger — flows must start at a real UI affordance`);
		if (!Array.isArray(f.steps) || f.steps.length < 2) E(`flow "${f.id}" needs at least 2 steps`);
		for (const s of f.steps ?? []) if (!ids.has(s)) E(`flow "${f.id}": step "${s}" does not exist`);
	}

	for (const n of notes) {
		if (!n.title) E('note with no title');
		if (n.severity && !['info', 'warn', 'alert'].includes(n.severity)) {
			E(`note "${n.title}": severity must be info|warn|alert`);
		}
		if (n.path && ids.has(n.path) === false && !n.path.includes('/')) {
			W(`note "${n.title}": path "${n.path}" is neither a node id nor a repo path`);
		}
	}

	if (nodes.length > caps.nodes) W(`nodes over cap (${nodes.length} > ${caps.nodes}) — raise granularity, not the cap`);
	if (edges.length > caps.edges) W(`edges over cap (${edges.length} > ${caps.edges})`);
	if (flows.length > caps.flows) W(`flows over cap (${flows.length} > ${caps.flows})`);
	if (notes.length > caps.notes) W(`notes over cap (${notes.length} > ${caps.notes})`);

	// ---- quality gates that catch "looks fine, is wrong"
	const c = scan.stats ?? {};
	if (c.importsParsed) {
		const ratio = (c.importsResolved ?? 0) / c.importsParsed;
		if (ratio < 0.5) E(`import resolution ${(ratio * 100).toFixed(0)}% — alias config is being missed; fix the resolver`);
		else if (ratio < 0.7) W(`import resolution ${(ratio * 100).toFixed(0)}% — check for unhandled aliases`);
	}
	if (c.stylesheets > 0 && !c.authoredClasses && !c.designTokens) {
		E('stylesheets present but the style layer is empty — the analyzer parsed nothing');
	}
	if (scan.scan === 'system' && !flows.length) {
		W('system scan with no flows — the flows are the most useful part; add 3–8');
	}
	const orphans = nodes.filter((n) => !n.parentId &&
		!edges.some((e) => e.source === n.id || e.target === n.id) &&
		!nodes.some((k) => k.parentId === n.id));
	if (orphans.length > nodes.length * 0.3) {
		W(`${orphans.length}/${nodes.length} nodes are isolated — extraction probably missed the edges`);
	}

	return finish(scan, errors, warnings, strict);
}

function finish(scan, errors, warnings, strict) {
	const ok = errors.length === 0 && (!strict || warnings.length === 0);
	return { ok, errors, warnings, scan: scan.scan };
}

export function report(res) {
	for (const w of res.warnings) console.error(`  warn   ${w}`);
	for (const e of res.errors) console.error(`  ERROR  ${e}`);
	console.error(res.ok
		? `  ok     ${res.scan} scan valid${res.warnings.length ? ` (${res.warnings.length} warning${res.warnings.length > 1 ? 's' : ''})` : ''}`
		: `  FAILED ${res.errors.length} error(s)`);
	return res.ok;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const file = process.argv[2];
	if (!file) { console.error('usage: validate.mjs <scan.json> [--strict]'); process.exit(2); }
	const res = validate(JSON.parse(fs.readFileSync(file, 'utf8')), { strict: process.argv.includes('--strict') });
	process.exit(report(res) ? 0 : 1);
}