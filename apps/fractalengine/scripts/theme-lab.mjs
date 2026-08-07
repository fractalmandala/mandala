#!/usr/bin/env node
// =============================================================================
// FractalEngine Theme Lab
// -----------------------------------------------------------------------------
// Reads the app's live design tokens (_tokens.sass + _typography.sass) and
// generates a standalone, editable HTML playground that mirrors the app's
// layout / styling / typography. Edit colours, sizes and type live, preview
// the result on a faithful mock of the IDE, then save any configuration --
// under a name of your choosing -- straight into vendor/starterTemplates.js so
// it shows up in the app's theme dropdown.
//
//   node scripts/theme-lab.mjs            # generate + serve + open browser
//   node scripts/theme-lab.mjs --no-open  # don't auto-open the browser
//   node scripts/theme-lab.mjs --build    # only (re)write theme-lab.html, no server
//   node scripts/theme-lab.mjs --port 4321
//
// Re-run any time to regenerate an up-to-date theme-lab.html from current tokens.
// =============================================================================

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');

const TOKENS_SASS = path.join(APP_ROOT, 'src/lib/styles/_tokens.sass');
const TYPE_SASS = path.join(APP_ROOT, 'src/lib/styles/_typography.sass');
const TEMPLATES_JS = path.join(APP_ROOT, 'vendor/starterTemplates.js');
const HTML_OUT = path.join(APP_ROOT, 'theme-lab.html');

const argv = process.argv.slice(2);
const FLAG = (name) => argv.includes(name);
const PORT = (() => {
	const i = argv.indexOf('--port');
	return i !== -1 && argv[i + 1] ? Number(argv[i + 1]) : 4317;
})();

// -----------------------------------------------------------------------------
// 1. Parse the SASS token files -> [{ name, value }]
// -----------------------------------------------------------------------------
// We only care about CSS custom properties declared under a `:root` block, of
// the form `--name: value`. Indented SASS, no braces/semicolons.

function parseRootCustomProps(file) {
	if (!fs.existsSync(file)) return [];
	const src = fs.readFileSync(file, 'utf8');
	const lines = src.split(/\r?\n/);
	const props = [];
	let inRoot = false;
	for (const raw of lines) {
		const line = raw.replace(/\t/g, '    '); // normalise for indent checks
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('//')) continue;
		// A top-level selector (no leading indent) that is exactly ":root"
		if (/^:root\b/.test(line)) { inRoot = true; continue; }
		// Any other top-level selector ends the :root block.
		if (!/^\s/.test(line) && !/^:root\b/.test(line)) { inRoot = false; }
		if (!inRoot) continue;
		const m = trimmed.match(/^(--[a-z0-9-]+)\s*:\s*(.+)$/i);
		if (m) props.push({ name: m[1], value: m[2].trim() });
	}
	return props;
}

const tokenProps = parseRootCustomProps(TOKENS_SASS);
const typeProps = parseRootCustomProps(TYPE_SASS);

// -----------------------------------------------------------------------------
// 2. Classify tokens into UI groups.
// -----------------------------------------------------------------------------
const isHex = (v) => /^#([0-9a-fA-F]{3,8})$/.test(v.trim());

// The 13 semantic tokens that the app's applyTheme() actually round-trips.
// Editing only these is enough to define a working app theme; everything else
// is preview-only sugar.
const MAPPABLE = new Set([
	'--background10', '--background20', '--background30', '--background40', '--background50',
	'--text-primary', '--text-secondary', '--text-tertiary',
	'--border-primary', '--border-secondary', '--border-tertiary',
	'--theme-color', '--theme-color-alt'
]);

function groupOf(name) {
	if (/^--text-(primary|secondary|tertiary)$/.test(name)) return 'Text';
	if (/^--background\d/.test(name)) return 'Backgrounds';
	if (/^--foreground\d/.test(name)) return 'Foregrounds';
	if (/^--color\d/.test(name)) return 'Accent slots';
	if (/^--border-/.test(name)) return 'Borders';
	if (/^--theme-color|^--feedback-/.test(name)) return 'Theme accents';
	return 'Sizes & misc';
}

const GROUP_ORDER = ['Text', 'Backgrounds', 'Foregrounds', 'Borders', 'Theme accents', 'Accent slots', 'Sizes & misc'];

const tokens = tokenProps.map((p) => ({
	name: p.name,
	value: p.value,
	group: groupOf(p.name),
	kind: isHex(p.value) ? 'color' : 'text',
	mappable: MAPPABLE.has(p.name)
}));

// Typography group (preview-only). Keep the simple px/number ones editable.
const typeTokens = typeProps
	.filter((p) => /^--text-(scaling|xs|sm|md)$/.test(p.name))
	.map((p) => ({ name: p.name, value: p.value, group: 'Typography', kind: 'text', mappable: false }));

const ALL = [...tokens, ...typeTokens];

// theme type heuristic from the background luminance
function luminance(hex) {
	const h = hex.replace('#', '');
	const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
	const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
	return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
const bg10 = ALL.find((t) => t.name === '--background10');
const DEFAULT_TYPE = bg10 && isHex(bg10.value) && luminance(bg10.value) > 0.5 ? 'light' : 'dark';

// -----------------------------------------------------------------------------
// 3. Semantic-token <-> VS Code theme-key mapping (mirrors applyTheme()).
// -----------------------------------------------------------------------------
function tokensToVsCodeColors(t) {
	return {
		'editor.background': t['--background10'],
		'sideBar.background': t['--background20'],
		'titleBar.activeBackground': t['--background30'],
		'statusBar.background': t['--background30'],
		'tab.hoverBackground': t['--background40'],
		'list.hoverBackground': t['--background40'],
		'editor.lineHighlightBackground': t['--background50'],
		'list.activeSelectionBackground': t['--background50'],
		'editor.foreground': t['--text-primary'],
		'sideBar.foreground': t['--text-primary'],
		'statusBar.foreground': t['--text-secondary'],
		'editorLineNumber.foreground': t['--text-tertiary'],
		'sideBar.border': t['--border-primary'],
		'tab.border': t['--border-secondary'],
		'focusBorder': t['--border-tertiary'],
		'tab.activeBorder': t['--theme-color'],
		'activityBar.activeBorder': t['--theme-color'],
		'terminal.ansiGreen': t['--theme-color-alt']
	};
}

// -----------------------------------------------------------------------------
// 4. Write a new entry into vendor/starterTemplates.js
// -----------------------------------------------------------------------------
function slugify(name) {
	return String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'custom-theme';
}

function existingIds(src) {
	const ids = new Set();
	const re = /"id"\s*:\s*"([^"]+)"/g;
	let m;
	while ((m = re.exec(src))) ids.add(m[1]);
	return ids;
}

function saveTemplate({ name, type, tokens: tk }) {
	const src = fs.readFileSync(TEMPLATES_JS, 'utf8');
	const ids = existingIds(src);
	let id = slugify(name);
	if (ids.has(id)) {
		let n = 2;
		while (ids.has(id + '-' + n)) n++;
		id = id + '-' + n;
	}
	const entry = {
		id,
		label: name,
		name,
		type: type === 'light' ? 'light' : 'dark',
		colors: tokensToVsCodeColors(tk)
	};

	const marker = 'module.exports';
	const mi = src.indexOf(marker);
	if (mi === -1) throw new Error('Could not find module.exports in starterTemplates.js');
	const closeIdx = src.lastIndexOf('];', mi);
	if (closeIdx === -1) throw new Error('Could not locate STARTER_TEMPLATES array close');

	const before = src.slice(0, closeIdx);   // ends just before the closing ']'
	const after = src.slice(closeIdx);        // '];\n\nmodule.exports...'

	const indented = JSON.stringify(entry, null, 2).split('\n').map((l) => '  ' + l).join('\n');
	const beforeTrim = before.replace(/\s+$/, '');
	const isEmpty = /\[\s*$/.test(beforeTrim);
	const joined = isEmpty ? beforeTrim + '\n' + indented + '\n' : beforeTrim + ',\n' + indented + '\n';
	const next = joined + after;

	fs.writeFileSync(TEMPLATES_JS, next, 'utf8');
	return { id, label: name, type: entry.type };
}

function readTemplatesRaw() {
	// Pull the raw [{id,label,type,colors}] out of the CJS module without eval.
	try {
		const src = fs.readFileSync(TEMPLATES_JS, 'utf8');
		const start = src.indexOf('[');
		const end = src.lastIndexOf('];');
		if (start === -1 || end === -1) return [];
		const arr = JSON.parse(src.slice(start, end + 1));
		return arr.map((t) => ({ id: t.id, label: t.label || t.name || t.id, type: t.type || 'dark', colors: t.colors || {} }));
	} catch (e) {
		console.warn('Could not parse existing templates:', e.message);
		return [];
	}
}

// -----------------------------------------------------------------------------
// 5. Build the HTML page.
// -----------------------------------------------------------------------------
function buildHtml() {
	const rootVars = ALL.map((t) => '\t\t\t' + t.name + ': ' + t.value + ';').join('\n');
	const data = {
		tokens: ALL,
		groupOrder: [...GROUP_ORDER, 'Typography'],
		defaultType: DEFAULT_TYPE,
		mappable: [...MAPPABLE],
		templates: readTemplatesRaw(),
		hasServer: !FLAG('--build')
	};
	const dataJson = JSON.stringify(data).replace(/</g, '\\u003c');

	return PAGE_TEMPLATE
		.replace('/*__ROOT_VARS__*/', rootVars)
		.replace('/*__DATA__*/', dataJson);
}

// The page: outer template literal. The client <script> below deliberately
// avoids backticks and ${...} so nothing here is interpolated by accident.
const PAGE_TEMPLATE = `<!doctype html>
<html lang="en" data-theme-kind="${DEFAULT_TYPE}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>FractalEngine Theme Lab</title>
<style>
	:root {
/*__ROOT_VARS__*/
		--lab-panel: 340px;
		--lab-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
		--lab-mono: "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
	}
	* { box-sizing: border-box; }
	html, body { margin: 0; height: 100%; }
	body {
		display: grid;
		grid-template-columns: 1fr var(--lab-panel);
		height: 100vh;
		font-family: var(--lab-font);
		background: #050507;
		color: var(--text-primary);
		overflow: hidden;
	}

	/* ----- Preview (mock of the IDE) ----- */
	.preview { position: relative; overflow: hidden; display: flex; flex-direction: column; min-width: 0; }
	.titlebar {
		height: var(--chrome-header-strip, 40px);
		flex: none;
		display: flex; align-items: center; gap: 10px;
		padding: 0 14px;
		background: var(--background30);
		border-bottom: 1px solid var(--border-primary);
		font-size: var(--text-sm, 12px);
		color: var(--text-secondary);
	}
	.traffic { display: flex; gap: 7px; }
	.traffic i { width: 11px; height: 11px; border-radius: 50%; display: block; }
	.traffic i:nth-child(1) { background: var(--feedback-error, #ef4444); }
	.traffic i:nth-child(2) { background: var(--color30, #f59e0b); }
	.traffic i:nth-child(3) { background: var(--theme-color-alt, #10b981); }
	.titlebar .title { color: var(--text-primary); font-weight: 600; }
	.titlebar .spacer { flex: 1; }
	.titlebar .pill { padding: 3px 9px; border: 1px solid var(--border-secondary); border-radius: 6px; background: var(--background20); }

	.board {
		flex: 1; position: relative; min-height: 0;
		background-color: var(--background10);
		background-image: radial-gradient(var(--border-tertiary) 1px, transparent 1px);
		background-size: 22px 22px;
		overflow: hidden;
	}

	.tile {
		position: absolute;
		background: var(--background20);
		border: 1px solid var(--border-secondary);
		border-radius: 8px;
		box-shadow: 0 10px 34px rgba(0,0,0,0.5);
		display: flex; flex-direction: column; overflow: hidden;
	}
	.tile.active { border-color: var(--theme-color); }
	.tile-head {
		height: 30px; flex: none;
		display: flex; align-items: center; gap: 8px;
		padding: 0 10px;
		background: var(--background30);
		border-bottom: 1px solid var(--border-primary);
		font-size: var(--text-sm, 12px);
		color: var(--text-secondary);
	}
	.tile-head .dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
	.tile-head .name { color: var(--text-primary); font-weight: 600; }
	.tile-body { flex: 1; overflow: auto; min-height: 0; }

	/* Explorer tile */
	.tile.explorer { left: 24px; top: 24px; width: 220px; height: 300px; }
	.tree { padding: 8px 6px; font-size: var(--text-sm, 12px); }
	.tree .row { display: flex; align-items: center; gap: 7px; padding: 4px 8px; border-radius: 5px; color: var(--text-secondary); }
	.tree .row.sel { background: var(--background40); color: var(--text-primary); }
	.tree .row:hover { background: var(--background40); }
	.tree .row .ic { width: 13px; height: 13px; border-radius: 3px; background: var(--text-tertiary); flex: none; }
	.tree .row.dir .ic { background: var(--color30, #f59e0b); }
	.tree .row.sel .ic { background: var(--theme-color); }
	.tree .indent { padding-left: 16px; }

	/* Editor tile */
	.tile.editor { left: 268px; top: 24px; width: 430px; height: 360px; }
	.tabs { display: flex; flex: none; background: var(--background30); border-bottom: 1px solid var(--border-primary); }
	.tabs .tab { padding: 6px 14px; font-size: var(--text-sm, 12px); color: var(--text-tertiary); border-right: 1px solid var(--border-primary); }
	.tabs .tab.active { color: var(--text-primary); background: var(--background20); border-bottom: 2px solid var(--theme-color); }
	.code { display: flex; font-family: var(--lab-mono); font-size: var(--text-sm, 12px); line-height: 1.7; }
	.code .gutter { padding: 10px 8px; text-align: right; color: var(--text-tertiary); user-select: none; background: var(--background20); border-right: 1px solid var(--border-primary); }
	.code .lines { padding: 10px 12px; white-space: pre; overflow: auto; }
	.code .hl { background: var(--background50); margin: 0 -12px; padding: 0 12px; }
	.kw { color: var(--theme-color); }
	.fn { color: var(--color30, #f59e0b); }
	.str { color: var(--theme-color-alt, #10b981); }
	.num { color: var(--color10, #3b82f6); }
	.cmt { color: var(--text-tertiary); font-style: italic; }
	.var { color: var(--text-primary); }

	/* Terminal tile */
	.tile.terminal { left: 268px; top: 404px; width: 430px; height: 170px; }
	.term { padding: 10px 12px; font-family: var(--lab-mono); font-size: var(--text-sm, 12px); line-height: 1.6; }
	.term .ln { color: var(--text-secondary); }
	.term .ok { color: var(--theme-color-alt, #10b981); }
	.term .prompt { color: var(--theme-color); }
	.term .err { color: var(--feedback-error, #ef4444); }

	/* AI tile */
	.tile.ai { left: 24px; top: 344px; width: 220px; height: 230px; }
	.msg { padding: 8px 10px; font-size: var(--text-sm, 12px); line-height: 1.5; }
	.msg.user { color: var(--text-primary); }
	.msg.bot { color: var(--text-secondary); background: var(--background30); border-radius: 8px; margin: 6px 8px; padding: 8px 10px; border: 1px solid var(--border-primary); }
	.ai-input { margin: 8px; padding: 7px 9px; border: 1px solid var(--border-secondary); border-radius: 8px; background: var(--background10); color: var(--text-tertiary); font-size: var(--text-sm, 12px); }

	/* Dock */
	.dock {
		position: absolute; left: 50%; bottom: 16px; transform: translateX(-50%);
		display: flex; gap: 6px; padding: 6px;
		background: var(--background30); border: 1px solid var(--border-secondary);
		border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,0.45);
	}
	.dock button { width: 30px; height: 30px; border-radius: 8px; border: 1px solid transparent; background: var(--background40); color: var(--text-secondary); font-size: 13px; cursor: default; }
	.dock button.active { border-color: var(--theme-color); color: var(--theme-color); }
	.dock button.disabled { opacity: 0.4; }

	/* Footer */
	.footer {
		height: var(--chrome-footer, 40px); flex: none;
		display: flex; align-items: center; gap: 14px; padding: 0 14px;
		background: var(--background30); border-top: 1px solid var(--border-primary);
		font-size: var(--text-sm, 12px); color: var(--text-secondary);
	}
	.footer .accent { color: var(--theme-color); }
	.footer .spacer { flex: 1; }

	/* ----- Control panel ----- */
	.panel { background: #0b0b0e; border-left: 1px solid #1c1c22; display: flex; flex-direction: column; min-height: 0; color: #e7e7ea; }
	.panel header { padding: 14px 16px 10px; border-bottom: 1px solid #1c1c22; }
	.panel header h1 { margin: 0; font-size: 14px; letter-spacing: 0.3px; }
	.panel header p { margin: 4px 0 0; font-size: 11px; color: #8a8a92; line-height: 1.4; }
	.toolbar { display: flex; gap: 8px; padding: 10px 16px; border-bottom: 1px solid #1c1c22; flex-wrap: wrap; align-items: center; }
	.toolbar select, .toolbar button { font: inherit; font-size: 12px; }
	.btn { padding: 6px 11px; border-radius: 7px; border: 1px solid #2a2a32; background: #16161b; color: #e7e7ea; cursor: pointer; }
	.btn:hover { background: #1f1f26; }
	.btn.primary { background: var(--theme-color); border-color: var(--theme-color); color: #fff; }
	.sel { padding: 6px 9px; border-radius: 7px; border: 1px solid #2a2a32; background: #16161b; color: #e7e7ea; }
	.controls { flex: 1; overflow-y: auto; padding: 6px 12px 24px; min-height: 0; }
	.grp { margin-top: 14px; }
	.grp > h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: #7c7c86; margin: 0 0 6px; padding: 0 4px; }
	.ctl { display: flex; align-items: center; gap: 8px; padding: 4px 4px; border-radius: 6px; }
	.ctl:hover { background: #131318; }
	.ctl .label { flex: 1; font-size: 11.5px; color: #c7c7cd; font-family: var(--lab-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.ctl .star { color: var(--theme-color); font-size: 10px; }
	.ctl input[type=color] { width: 28px; height: 24px; padding: 0; border: 1px solid #2a2a32; border-radius: 5px; background: none; cursor: pointer; }
	.ctl input[type=text] { width: 92px; font-family: var(--lab-mono); font-size: 11px; padding: 4px 6px; border-radius: 5px; border: 1px solid #2a2a32; background: #16161b; color: #e7e7ea; }
	.ctl input.size { width: 128px; }
	.save { border-top: 1px solid #1c1c22; padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
	.save .row { display: flex; gap: 8px; }
	.save input[name=tname] { flex: 1; font: inherit; font-size: 13px; padding: 7px 10px; border-radius: 7px; border: 1px solid #2a2a32; background: #16161b; color: #e7e7ea; }
	.save .hint { font-size: 11px; color: #8a8a92; line-height: 1.4; }
	.note { font-size: 11px; padding: 7px 10px; border-radius: 7px; margin-top: 2px; }
	.note.ok { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
	.note.err { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
	.note.hide { display: none; }
</style>
</head>
<body>
	<div class="preview">
		<div class="titlebar">
			<span class="traffic"><i></i><i></i><i></i></span>
			<span class="title">FractalEngine Studio</span>
			<span class="spacer"></span>
			<span class="pill">main</span>
			<span class="pill" id="tb-theme">theme</span>
		</div>
		<div class="board">
			<!-- Explorer -->
			<div class="tile explorer">
				<div class="tile-head"><span class="dot" style="background:var(--theme-color)"></span><span class="name">Explorer</span></div>
				<div class="tile-body"><div class="tree">
					<div class="row dir"><span class="ic"></span>src</div>
					<div class="row indent dir"><span class="ic"></span>components</div>
					<div class="row indent sel"><span class="ic"></span>Canvas.svelte</div>
					<div class="row indent"><span class="ic"></span>Editor.svelte</div>
					<div class="row indent"><span class="ic"></span>Terminal.svelte</div>
					<div class="row dir"><span class="ic"></span>styles</div>
					<div class="row indent"><span class="ic"></span>_tokens.sass</div>
				</div></div>
			</div>
			<!-- Editor -->
			<div class="tile editor active">
				<div class="tile-head"><span class="dot" style="background:var(--theme-color)"></span><span class="name">Editor</span></div>
				<div class="tabs"><span class="tab active">Canvas.svelte</span><span class="tab">ide.svelte.ts</span></div>
				<div class="tile-body"><div class="code">
					<div class="gutter">1
2
3
4
5
6
7
8
9</div>
					<div class="lines"><span class="cmt">// infinite spatial canvas</span>
<span class="kw">let</span> <span class="var">zoom</span> = <span class="fn">$state</span>(<span class="num">1</span>)
<span class="kw">let</span> <span class="var">tiles</span> = <span class="fn">$state</span>([])

<span class="kw">function</span> <span class="fn">addTile</span>(<span class="var">kind</span>) {
  <span class="var">tiles</span>.<span class="fn">push</span>({ <span class="var">kind</span>, <span class="var">x</span>: <span class="num">0</span> })
}
<span class="hl"><span class="kw">const</span> <span class="var">label</span> = <span class="str">"FractalEngine"</span></span>
<span class="var">render</span>(<span class="var">label</span>)</div>
				</div></div>
			</div>
			<!-- Terminal -->
			<div class="tile terminal">
				<div class="tile-head"><span class="dot" style="background:var(--theme-color-alt)"></span><span class="name">Terminal</span></div>
				<div class="tile-body"><div class="term">
<span class="ln"><span class="prompt">&gt;</span> pnpm dev</span>
<span class="ok">  VITE ready in 412 ms</span>
<span class="ln">  Local:  http://localhost:5173</span>
<span class="ln"><span class="prompt">&gt;</span> svelte-check</span>
<span class="ok">  0 errors, 0 warnings</span>
				</div></div>
			</div>
			<!-- AI -->
			<div class="tile ai">
				<div class="tile-head"><span class="dot" style="background:var(--theme-color)"></span><span class="name">AI Copilot</span></div>
				<div class="tile-body">
					<div class="msg user">Recolor the terminal accent.</div>
					<div class="msg bot">Sure — adjusting <code>--theme-color-alt</code> now.</div>
					<div class="ai-input">Ask anything…</div>
				</div>
			</div>
			<!-- Dock -->
			<div class="dock">
				<button class="active">E</button>
				<button>T</button>
				<button>B</button>
				<button>AI</button>
				<button class="disabled">W</button>
				<button class="disabled">DB</button>
			</div>
		</div>
		<div class="footer">
			<span class="accent">●</span> Ready
			<span class="spacer"></span>
			<span>Ln 8, Col 24</span>
			<span>SASS</span>
			<span>UTF-8</span>
			<span id="ft-theme" class="accent">Theme Lab</span>
		</div>
	</div>

	<aside class="panel">
		<header>
			<h1>Theme Lab</h1>
			<p>Edit tokens live. <span style="color:var(--theme-color)">★</span> marks the 13 tokens that persist into a saved app theme.</p>
		</header>
		<div class="toolbar">
			<select id="loadSel" class="sel"><option value="">Load existing theme…</option></select>
			<button class="btn" id="resetBtn">Reset</button>
			<select id="typeSel" class="sel"><option value="dark">dark</option><option value="light">light</option></select>
		</div>
		<div class="controls" id="controls"></div>
		<div class="save">
			<div class="row">
				<input name="tname" id="tname" placeholder="Theme name (e.g. Midnight Citrus)" />
				<button class="btn primary" id="saveBtn">Save</button>
			</div>
			<div class="hint" id="saveHint">Saves into vendor/starterTemplates.js as a VS Code-format theme the app can load.</div>
			<div class="note hide" id="note"></div>
		</div>
	</aside>

	<script id="lab-data" type="application/json">/*__DATA__*/</script>
	<script>
	(function () {
		var DATA = JSON.parse(document.getElementById('lab-data').textContent);
		var TOKENS = DATA.tokens;
		var ORIGINAL = {};
		TOKENS.forEach(function (t) { ORIGINAL[t.name] = t.value; });
		var current = Object.assign({}, ORIGINAL);
		var root = document.documentElement;

		function applyVar(name, value) {
			current[name] = value;
			root.style.setProperty(name, value);
		}

		// ----- Build the control list, grouped -----
		var controls = document.getElementById('controls');
		var inputsByName = {};

		function makeControl(t) {
			var ctl = document.createElement('div');
			ctl.className = 'ctl';
			var label = document.createElement('span');
			label.className = 'label';
			label.textContent = t.name;
			label.title = t.name;
			ctl.appendChild(label);
			if (t.mappable) {
				var star = document.createElement('span');
				star.className = 'star';
				star.textContent = '★';
				star.title = 'Persisted into saved themes';
				ctl.appendChild(star);
			}

			if (t.kind === 'color') {
				var color = document.createElement('input');
				color.type = 'color';
				color.value = normalizeHex(t.value);
				var text = document.createElement('input');
				text.type = 'text';
				text.value = t.value;
				color.addEventListener('input', function () { text.value = color.value; applyVar(t.name, color.value); });
				text.addEventListener('input', function () {
					applyVar(t.name, text.value);
					if (/^#([0-9a-fA-F]{6})$/.test(text.value)) color.value = text.value;
				});
				ctl.appendChild(color);
				ctl.appendChild(text);
				inputsByName[t.name] = { color: color, text: text, kind: 'color' };
			} else {
				var size = document.createElement('input');
				size.type = 'text';
				size.className = 'size';
				size.value = t.value;
				size.addEventListener('input', function () { applyVar(t.name, size.value); });
				ctl.appendChild(size);
				inputsByName[t.name] = { text: size, kind: 'text' };
			}
			return ctl;
		}

		function normalizeHex(v) {
			if (/^#([0-9a-fA-F]{3})$/.test(v)) {
				return '#' + v.slice(1).split('').map(function (c) { return c + c; }).join('');
			}
			if (/^#([0-9a-fA-F]{6,8})$/.test(v)) return v.slice(0, 7);
			return '#000000';
		}

		var byGroup = {};
		TOKENS.forEach(function (t) { (byGroup[t.group] = byGroup[t.group] || []).push(t); });
		DATA.groupOrder.forEach(function (g) {
			if (!byGroup[g]) return;
			var wrap = document.createElement('div');
			wrap.className = 'grp';
			var h = document.createElement('h2');
			h.textContent = g;
			wrap.appendChild(h);
			byGroup[g].forEach(function (t) { wrap.appendChild(makeControl(t)); });
			controls.appendChild(wrap);
		});

		// ----- Reset -----
		document.getElementById('resetBtn').addEventListener('click', function () {
			TOKENS.forEach(function (t) {
				applyVar(t.name, ORIGINAL[t.name]);
				var inp = inputsByName[t.name];
				if (!inp) return;
				inp.text.value = ORIGINAL[t.name];
				if (inp.color) inp.color.value = normalizeHex(ORIGINAL[t.name]);
			});
			setNote('Reset to current app tokens.', 'ok');
		});

		// ----- Type select -----
		var typeSel = document.getElementById('typeSel');
		typeSel.value = DATA.defaultType;
		typeSel.addEventListener('change', function () { root.setAttribute('data-theme-kind', typeSel.value); });

		// ----- Load existing themes (reverse-map VS Code colors -> tokens) -----
		var loadSel = document.getElementById('loadSel');
		DATA.templates.forEach(function (tpl) {
			var o = document.createElement('option');
			o.value = tpl.id;
			o.textContent = tpl.label + '  (' + tpl.type + ')';
			loadSel.appendChild(o);
		});

		function vsCodeToTokens(c) {
			function pick() {
				for (var i = 0; i < arguments.length; i++) { if (c[arguments[i]]) return c[arguments[i]]; }
				return null;
			}
			return {
				'--background10': pick('editor.background'),
				'--background20': pick('sideBar.background'),
				'--background30': pick('titleBar.activeBackground', 'statusBar.background'),
				'--background40': pick('tab.hoverBackground', 'list.hoverBackground'),
				'--background50': pick('editor.lineHighlightBackground', 'list.activeSelectionBackground'),
				'--text-primary': pick('editor.foreground', 'sideBar.foreground'),
				'--text-secondary': pick('statusBar.foreground'),
				'--text-tertiary': pick('editorLineNumber.foreground'),
				'--border-primary': pick('sideBar.border', 'panel.border', 'editorGroup.border'),
				'--border-secondary': pick('tab.border', 'editorGroupHeader.tabsBorder'),
				'--border-tertiary': pick('focusBorder'),
				'--theme-color': pick('tab.activeBorder', 'activityBar.activeBorder'),
				'--theme-color-alt': pick('terminal.ansiGreen')
			};
		}

		loadSel.addEventListener('change', function () {
			var tpl = DATA.templates.filter(function (t) { return t.id === loadSel.value; })[0];
			if (!tpl) return;
			var mapped = vsCodeToTokens(tpl.colors || {});
			Object.keys(mapped).forEach(function (name) {
				var val = mapped[name];
				if (!val) return;
				var hex = (/^#([0-9a-fA-F]{6,8})$/.test(val)) ? val.slice(0, 7) : val;
				applyVar(name, hex);
				var inp = inputsByName[name];
				if (!inp) return;
				inp.text.value = hex;
				if (inp.color) inp.color.value = normalizeHex(hex);
			});
			typeSel.value = tpl.type || 'dark';
			root.setAttribute('data-theme-kind', typeSel.value);
			setNote('Loaded "' + tpl.label + '" into the editor.', 'ok');
		});

		// ----- Notes -----
		var note = document.getElementById('note');
		function setNote(msg, kind) {
			note.textContent = msg;
			note.className = 'note ' + (kind === 'err' ? 'err' : 'ok');
			clearTimeout(setNote._t);
			setNote._t = setTimeout(function () { note.className = 'note hide'; }, 4000);
		}

		// ----- Save -----
		var saveBtn = document.getElementById('saveBtn');
		if (!DATA.hasServer) {
			saveBtn.disabled = true;
			document.getElementById('saveHint').textContent = 'Open via the dev server (node scripts/theme-lab.mjs) to enable saving.';
		}
		saveBtn.addEventListener('click', function () {
			var name = document.getElementById('tname').value.trim();
			if (!name) { setNote('Give the theme a name first.', 'err'); return; }
			saveBtn.disabled = true;
			fetch('/api/save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: name, type: typeSel.value, tokens: current })
			}).then(function (r) { return r.json(); }).then(function (res) {
				saveBtn.disabled = false;
				if (res.ok) {
					setNote('Saved "' + res.label + '" -> starterTemplates.js (id: ' + res.id + ')', 'ok');
					var o = document.createElement('option');
					o.value = res.id; o.textContent = res.label + '  (' + res.type + ')';
					loadSel.appendChild(o);
					DATA.templates.push({ id: res.id, label: res.label, type: res.type, colors: res.colors });
				} else {
					setNote('Save failed: ' + (res.error || 'unknown'), 'err');
				}
			}).catch(function (e) { saveBtn.disabled = false; setNote('Save failed: ' + e.message, 'err'); });
		});
	})();
	</script>
</body>
</html>`;

// -----------------------------------------------------------------------------
// 6. Generate the file + (optionally) serve.
// -----------------------------------------------------------------------------
function writeHtml() {
	const html = buildHtml();
	fs.writeFileSync(HTML_OUT, html, 'utf8');
	return html;
}

const html = writeHtml();
console.log('✓ Generated ' + path.relative(process.cwd(), HTML_OUT) + ' from ' + ALL.length + ' tokens.');

if (FLAG('--build')) {
	console.log('  Build-only mode — open the file directly (saving is disabled without the server).');
	process.exit(0);
}

const server = http.createServer((req, res) => {
	if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
		// Always serve freshly-generated HTML so it reflects current tokens.
		res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
		res.end(buildHtml());
		return;
	}
	if (req.method === 'POST' && req.url === '/api/save') {
		let body = '';
		req.on('data', (c) => { body += c; if (body.length > 1e6) req.destroy(); });
		req.on('end', () => {
			try {
				const payload = JSON.parse(body);
				const result = saveTemplate(payload);
				const colors = tokensToVsCodeColors(payload.tokens);
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ ok: true, ...result, colors }));
				console.log('  ✓ Saved theme "' + result.label + '" (id: ' + result.id + ') -> vendor/starterTemplates.js');
			} catch (e) {
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ ok: false, error: e.message }));
				console.error('  ✗ Save failed:', e.message);
			}
		});
		return;
	}
	res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
	const url = 'http://localhost:' + PORT + '/';
	console.log('✓ Theme Lab running at ' + url);
	console.log('  Edit tokens, then Save to write a named theme into vendor/starterTemplates.js.');
	console.log('  Ctrl+C to stop.');
	if (!FLAG('--no-open')) {
		const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
		try { spawn(opener, [url], { stdio: 'ignore', detached: true, shell: process.platform === 'win32' }).unref(); } catch (_) {}
	}
});
