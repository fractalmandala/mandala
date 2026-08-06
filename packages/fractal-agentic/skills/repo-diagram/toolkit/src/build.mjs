import esbuild from 'esbuild';
import sveltePlugin from 'esbuild-svelte';
import fs from 'node:fs';

const graphPath = process.argv[2] ?? 'graph.json';
const outPath = process.argv[3] ?? 'diagram.html';
const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));

// never render an invalid scan — a broken diagram looks fine and lies
const { validate, report } = await import('./validate.mjs');
if (!report(validate(graph))) { console.error('refusing to build from an invalid scan'); process.exit(1); }

const res = await esbuild.build({
	entryPoints: ['src/main.js'],
	bundle: true,
	minify: true,
	format: 'iife',
	write: false,
	platform: 'browser',
	conditions: ['svelte', 'browser', 'import'],
	mainFields: ['svelte', 'browser', 'module', 'main'],
	loader: { '.css': 'text' },
	plugins: [sveltePlugin({ compilerOptions: { css: 'injected' } })]
});

let js = '';
// esbuild treats the bare CSS import as side-effect-free, so inline it explicitly.
let css = fs.readFileSync('node_modules/@xyflow/svelte/dist/style.css', 'utf8');
for (const f of res.outputFiles) {
	if (f.path.endsWith('.css')) css += f.text;
	else js += f.text;
}

const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${graph.project.name} — ${graph.scan} scan</title>
<style>${css}</style>
</head><body>
<div id="app"></div>
<script>window.__SCAN__=${JSON.stringify(graph)};<\/script>
<script>${js}<\/script>
</body></html>`;

fs.writeFileSync(outPath, html);
console.error(`${outPath}  ${(html.length / 1024 / 1024).toFixed(2)} MB  (${graph.scan}: ${(graph.nodes ?? []).length} nodes, ${(graph.edges ?? []).length} edges, ${(graph.files ?? []).length} files)`);