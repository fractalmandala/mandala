// The Tailwind oracle.
//
// Compiles the ORIGINAL shadcn component with the real Tailwind v4 CLI and reports the exact
// CSS for every utility it uses. Never translate a Tailwind class from memory — ask the oracle.
//
//   node scripts/oracle.mjs button                 # every utility, grouped, as CSS
//   node scripts/oracle.mjs button --raw           # the unprocessed Tailwind output
//   node scripts/oracle.mjs button --style luma    # include the cn-* skin (resolves @apply)
//   node scripts/oracle.mjs message --ai            # an ai-elements component (no cn-* skin)
//   node scripts/oracle.mjs --class "size-4 md:flex group-data-[x=y]:w-full"
//
// Ground truth, including arbitrary values, group-data variants, media queries and @apply.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = `${ROOT}/shadcn-registry/lib/registry`;
const WORK = `${ROOT}/.oracle`;

const argv = process.argv.slice(2);
const flag = (name) => {
	const i = argv.indexOf(`--${name}`);
	return i === -1 ? null : (argv[i + 1] ?? true);
};
const raw = argv.includes("--raw");
const ai = argv.includes("--ai");
const style = flag("style");
const classList = flag("class");
const component = argv.find((a) => !a.startsWith("--") && argv[argv.indexOf(a) - 1] !== "--style" && argv[argv.indexOf(a) - 1] !== "--class");

if (!component && !classList) {
	console.error("usage: node scripts/oracle.mjs <component> [--style luma] [--raw]");
	console.error("       node scripts/oracle.mjs --class \"size-4 md:flex\"");
	process.exit(1);
}

// ── 1. Build the theme contract Tailwind compiles against ────────────────────────────────
// The template is frozen from the shadcn registry so this keeps working after the registry
// copy is deleted. Token values come from our own palette data.
const template = readFileSync(`${ROOT}/scripts/oracle/theme-template.css`, "utf8");
const { palettes } = JSON.parse(readFileSync(`${ROOT}/src/lib/styles/data/palettes.json`, "utf8"));
const colors = palettes[flag("palette") || "neutral"];

const themeCss = template
	.replace(/<%- colors\.(light|dark)\["([a-z0-9-]+)"\] %>/g, (_, mode, token) => colors[mode][token] ?? "oklch(0 0 0)")
	// `source(none)` disables Tailwind's automatic source detection, which would otherwise
	// scan the whole package (including shadcn-registry/) and emit thousands of unrelated
	// rules on top of the one @source we actually asked for.
	.replace('@import "tailwindcss";', '@import "tailwindcss" source(none);')
	// tw-animate-css is only needed for the handful of animate-* utilities; skip if absent.
	.replace(/@import "tw-animate-css";\n?/, existsSync(`${ROOT}/node_modules/tw-animate-css`) ? '@import "tw-animate-css";\n' : "");

// ── 2. Point Tailwind at the source to scan ──────────────────────────────────────────────
mkdirSync(WORK, { recursive: true });

let sourceDirective;
if (classList) {
	// A synthetic file containing just the classes being asked about.
	writeFileSync(`${WORK}/probe.html`, `<div class="${classList}"></div>`);
	sourceDirective = `@source "${WORK}/probe.html";`;
} else {
	// ai-elements components are folders under the ai-elements-registry copy and use plain
	// Tailwind utilities (no cn-* skin). Core shadcn components live in the registry ui dir.
	const dir = ai
		? `${ROOT}/ai-elements-registry/src/lib/components/ai-elements/${component}`
		: `${REGISTRY}/ui/${component}`;
	if (!existsSync(dir)) {
		console.error(`no such component: ${component}\n(looked in ${dir})`);
		process.exit(1);
	}
	sourceDirective = `@source "${dir}";`;
}

// The cn-* skins are authored with @apply, so including one resolves the theme layer too.
const skinImport = style ? `@import "${REGISTRY}/styles/style-${style}.css";` : "";

// The skins @apply a few utilities that belong to the shadcn docs site rather than to the
// component registry. They are not part of what we are porting, but Tailwind refuses to
// compile without them, so they are shimmed here.
const shims = `
@utility no-scrollbar {
	-ms-overflow-style: none;
	scrollbar-width: none;
	&::-webkit-scrollbar { display: none; }
}
`;

// CSS requires every @import to precede other rules, so the skin is injected into the
// import block at the top rather than appended.
const withSkin = skinImport
	? themeCss.replace(/(@import "tailwindcss"[^;]*;\n)/, `$1${skinImport}\n`)
	: themeCss;

writeFileSync(
	`${WORK}/input.css`,
	[withSkin, shims, sourceDirective].filter(Boolean).join("\n\n")
);

// ── 3. Compile ───────────────────────────────────────────────────────────────────────────
try {
	execFileSync(
		"npx",
		["@tailwindcss/cli", "-i", `${WORK}/input.css`, "-o", `${WORK}/out.css`, "--cwd", ROOT],
		{ cwd: ROOT, stdio: ["ignore", "ignore", "pipe"] }
	);
} catch (err) {
	console.error("tailwind failed:\n" + (err.stderr?.toString() ?? err.message));
	process.exit(1);
}

const out = readFileSync(`${WORK}/out.css`, "utf8");

if (raw) {
	console.log(out);
	process.exit(0);
}

// ── 4. Report only the utility rules, dropping preflight and token declarations ──────────
// Tailwind emits its reset and @theme vars first; the generated utilities follow.
// Generated utilities are wrapped in `@layer utilities { … }`. Unwrap it and parse the
// contents; without this the whole layer reads as one rule.
function unwrapLayer(css, name) {
	const open = css.indexOf(`@layer ${name} {`);
	if (open === -1) return null;
	let i = css.indexOf("{", open), depth = 0;
	const start = i + 1;
	for (; i < css.length; i++) {
		if (css[i] === "{") depth++;
		else if (css[i] === "}" && --depth === 0) return css.slice(start, i);
	}
	return null;
}

const body = unwrapLayer(out, "utilities") ?? out;

// Split into top-level rules while respecting nesting (@media, @supports).
const rules = [];
let depth = 0, buf = "";
for (const ch of body) {
	buf += ch;
	if (ch === "{") depth++;
	else if (ch === "}") {
		depth--;
		if (depth <= 0) {
			const r = buf.trim();
			// @property blocks are Tailwind's internal custom-property registrations (dozens of
			// them come from tw-animate-css alone) and carry no porting information.
			if (r && !r.startsWith("@layer") && !r.startsWith("@property")) rules.push(r);
			buf = "";
			depth = 0;
		}
	}
}

// Skin rules (`.style-luma .cn-button { … }`) live outside @layer utilities. They carry the
// component's actual visual design — colours, padding, sizes — so they matter more than the
// structural utilities do. Reported separately.
const skinRules = [];
if (style) {
	// Walk every top-level construct rather than matching selector starts: a variant with no
	// base declarations (e.g. button's `ghost`) is emitted only as `.cn-button-variant-ghost:hover`,
	// and hover rules are additionally wrapped in `@media (hover: hover)`. Anchored matching
	// silently drops both.
	const top = [];
	{
		let depth = 0, buf = "";
		for (const ch of out) {
			buf += ch;
			if (ch === "{") depth++;
			else if (ch === "}" && --depth === 0) {
				top.push(buf.trim());
				buf = "";
			}
		}
	}

	// `.cn-button` must not swallow `.cn-button-group-*`, which belongs to the button-group
	// component. Disambiguate against the real component list.
	const known = readdirSync(`${REGISTRY}/ui`).filter((d) => d !== component);
	const longerMatch = known.filter((k) => k.startsWith(`${component}-`));

	const wanted = argv.includes("--skin-all") || !component
		? /\.cn-[a-z0-9-]+/
		: new RegExp(`\\.cn-${component}(?![a-z0-9])`);

	for (const rule of top) {
		if (!rule.includes(".cn-")) continue;
		if (!wanted.test(rule)) continue;
		if (longerMatch.some((k) => rule.includes(`.cn-${k}`)) && !wanted.test(rule.replace(new RegExp(`\\.cn-(${longerMatch.join("|")})[a-z0-9-]*`, "g"), ""))) continue;
		skinRules.push(rule);
	}
}

const label = classList ? `classes "${classList}"` : `component "${component}"`;
console.log(`# Tailwind oracle — ${label}${style ? ` + style-${style}` : ""}`);
console.log(`# ${rules.length} structural utilities${style ? `, ${skinRules.length} skin rules` : ""}.`);
console.log(`# This is ground truth; port from it, not from memory.\n`);

if (skinRules.length) {
	console.log(`## Skin — the component's visual design (colours, padding, sizes)\n`);
	for (const rule of skinRules) console.log(rule + "\n");
	console.log(`## Structural utilities\n`);
}
for (const rule of rules) console.log(rule + "\n");

if (!process.env.ORACLE_KEEP) rmSync(`${WORK}/probe.html`, { force: true });