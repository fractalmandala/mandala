// Scans the ai-elements-registry source and emits a per-component facts manifest:
// base-UI deps, cross-ai-element deps, external packages, lucide icons used, context
// modules, and file counts. Ground truth for the port plan — regenerate after any source
// change with:  node scripts/ai-elements-scan.mjs
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = `${ROOT}/ai-elements-registry/src/lib/components/ai-elements`;

function walk(dir) {
	const out = [];
	for (const e of readdirSync(dir)) {
		const p = `${dir}/${e}`;
		if (statSync(p).isDirectory()) out.push(...walk(p));
		else out.push(p);
	}
	return out;
}

const uniq = (a) => [...new Set(a)].sort();
const grabAll = (text, re) => [...text.matchAll(re)].map((m) => m[1]);

const manifest = {};
for (const name of readdirSync(SRC).filter((d) => statSync(`${SRC}/${d}`).isDirectory())) {
	const files = walk(`${SRC}/${name}`);
	const svelte = files.filter((f) => f.endsWith(".svelte"));
	const contextModules = files.filter((f) => f.endsWith(".svelte.ts") || f.endsWith(".svelte.js"));
	let text = "";
	for (const f of files) if (/\.(svelte|ts|js)$/.test(f)) text += "\n" + readFileSync(f, "utf8");

	// Strip line + block comments so commented-out imports (optional streamdown plugins) don't
	// register as real dependencies.
	const live = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

	const ui = uniq(grabAll(live, /\$lib\/components\/ui\/([a-z0-9-]+)/g));
	const ael = uniq(grabAll(live, /\$lib\/components\/ai-elements\/([a-z0-9-]+)/g)).filter((d) => d !== name);
	const icons = uniq(grabAll(live, /@lucide\/svelte\/icons\/([a-z0-9-]+)/g));
	const iconTypeOnly = /from ["']@lucide\/svelte["']/.test(live); // `type { Icon }` consumer-icon prop
	const externals = uniq(
		grabAll(live, /from ["']([^."$][^"']*)["']/g)
			.map((s) => (s.startsWith("@") ? s.split("/").slice(0, 2).join("/") : s.split("/")[0]))
			.filter((s) => !s.startsWith("svelte") && s !== "@lucide/svelte")
	);

	manifest[name] = {
		svelteFiles: svelte.length,
		contextModules: contextModules.map((f) => f.replace(`${SRC}/`, "")),
		uiDeps: ui,
		aiElementDeps: ael,
		externals,
		iconsUsed: icons,
		consumerIconProp: iconTypeOnly
	};
}

writeFileSync(`${ROOT}/ports/ai-elements-facts.json`, JSON.stringify(manifest, null, "\t") + "\n");
console.log(`scanned ${Object.keys(manifest).length} components → ports/ai-elements-facts.json`);