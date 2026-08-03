// Generates the ai-elements port plan + docs registry from the scanned facts.
// Merges ground-truth facts (ports/ai-elements-facts.json) with the human decisions that
// can't be derived from source — wave order, difficulty tier, docs category — and the frozen
// lucide→phosphor icon map. Regenerate after re-scanning:
//   node scripts/ai-elements-scan.mjs && node scripts/ai-elements-plan.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const facts = JSON.parse(readFileSync(`${ROOT}/ports/ai-elements-facts.json`, "utf8"));

// ── Frozen lucide → phosphor-svelte map. Every target verified to exist in phosphor-svelte
// 3.x. Import style: `import { CaretDownIcon } from "phosphor-svelte"` (PascalCase + Icon).
const ICONS = {
	"arrow-down": "ArrowDownIcon",
	"arrow-left": "ArrowLeftIcon",
	"arrow-right": "ArrowRightIcon",
	book: "BookIcon",
	bookmark: "BookmarkIcon",
	brain: "BrainIcon",
	check: "CheckIcon",
	"check-circle": "CheckCircleIcon",
	"chevron-down": "CaretDownIcon",
	"chevron-left": "CaretLeftIcon",
	"chevron-right": "CaretRightIcon",
	"chevrons-up-down": "CaretUpDownIcon",
	circle: "CircleIcon",
	clock: "ClockIcon",
	copy: "CopyIcon",
	dot: "DotIcon",
	"external-link": "ArrowSquareOutIcon",
	image: "ImageIcon",
	loader: "SpinnerIcon",
	"message-circle": "ChatCircleIcon",
	paperclip: "PaperclipIcon",
	plus: "PlusIcon",
	search: "MagnifyingGlassIcon",
	send: "PaperPlaneTiltIcon",
	square: "SquareIcon",
	wrench: "WrenchIcon",
	x: "XIcon",
	"x-circle": "XCircleIcon"
};

// ── Human decisions: category + tier per component. Wave is derived from aiElementDeps.
// tier: light | medium | heavy (drives assignment difficulty, not build order).
const META = {
	action: { category: "Controls", tier: "light" },
	artifact: { category: "Content", tier: "medium" },
	"chain-of-thought": { category: "Reasoning", tier: "medium" },
	checkpoint: { category: "Controls", tier: "medium" },
	code: { category: "Content", tier: "heavy" },
	confirmation: { category: "Controls", tier: "medium" },
	context: { category: "Controls", tier: "medium" },
	conversation: { category: "Conversation", tier: "medium" },
	"copy-button": { category: "Controls", tier: "light" },
	image: { category: "Content", tier: "light" },
	"inline-citation": { category: "Content", tier: "medium" },
	loader: { category: "Controls", tier: "light" },
	message: { category: "Conversation", tier: "heavy" },
	"model-selector": { category: "Controls", tier: "heavy" },
	"open-in-chat": { category: "Controls", tier: "medium" },
	plan: { category: "Reasoning", tier: "medium" },
	"prompt-input": { category: "Conversation", tier: "heavy" },
	queue: { category: "Conversation", tier: "medium" },
	reasoning: { category: "Reasoning", tier: "medium" },
	response: { category: "Conversation", tier: "heavy" },
	shimmer: { category: "Controls", tier: "light" },
	sources: { category: "Content", tier: "medium" },
	suggestion: { category: "Conversation", tier: "light" },
	task: { category: "Reasoning", tier: "medium" },
	tool: { category: "Reasoning", tier: "medium" },
	"web-preview": { category: "Content", tier: "medium" },
	workflow: { category: "Canvas", tier: "heavy" }
};

// Derive wave from the cross-ai-element dependency graph (0 = no ai-element deps).
function waveOf(name, seen = new Set()) {
	if (seen.has(name)) return 0;
	seen.add(name);
	const deps = facts[name].aiElementDeps;
	if (!deps.length) return 0;
	return 1 + Math.max(...deps.map((d) => waveOf(d, new Set(seen))));
}

const NAME = (s) => s.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
const SRC = "ai-elements-registry/src/lib/components/ai-elements";
const DOCS = "ai-elements-registry/src/routes/(main)/components";

const plan = [];
for (const slug of Object.keys(facts).sort()) {
	const f = facts[slug];
	const unmappedIcons = f.iconsUsed.filter((i) => !ICONS[i]);
	if (unmappedIcons.length) throw new Error(`${slug}: unmapped icons ${unmappedIcons}`);
	plan.push({
		slug,
		name: NAME(slug),
		category: META[slug].category,
		tier: META[slug].tier,
		wave: waveOf(slug),
		status: "planned",
		svelteFiles: f.svelteFiles,
		uiDeps: f.uiDeps, // fractalsvelte core components — all already ported & ready
		aiElementDeps: f.aiElementDeps, // must be ported first (see wave)
		external: f.externals, // runtime packages (already installed); "ai" is type-only → vendored
		icons: f.iconsUsed.map((i) => ({ lucide: i, phosphor: ICONS[i] })),
		consumerIconProp: f.consumerIconProp, // takes an icon *component* as a prop → type it, don't import
		contextModules: f.contextModules, // .svelte.ts state — port near-verbatim
		source: `${SRC}/${slug}`,
		examples: `${DOCS}/${slug}/examples`,
		docs: `${DOCS}/${slug}/docs.md`,
		target: `src/lib/components/ai-elements/${slug}`
	});
}
plan.sort((a, b) => a.wave - b.wave || a.slug.localeCompare(b.slug));

writeFileSync(`${ROOT}/ports/ai-elements-plan.json`, JSON.stringify({ generated: "run scripts/ai-elements-plan.mjs", components: plan }, null, "\t") + "\n");

// ── Emit the docs registry (separate array so it never dilutes the core shadcn port metrics).
const CATS = ["Conversation", "Reasoning", "Content", "Controls", "Canvas"];
const entry = (c) => `	{
		slug: '${c.slug}',
		name: '${c.name}',
		category: '${c.category}',
		tier: '${c.tier}',
		wave: ${c.wave},
		status: 'planned',
		uiDeps: [${c.uiDeps.map((d) => `'${d}'`).join(", ")}],
		aiElementDeps: [${c.aiElementDeps.map((d) => `'${d}'`).join(", ")}],
		external: [${c.external.filter((e) => e !== "ai" && e !== "tailwind-variants").map((d) => `'${d}'`).join(", ")}]
	}`;

const ts = `// The ai-elements registry — source of truth for the AI-elements docs section and port
// tracking. Kept SEPARATE from registry.ts (the core shadcn port) so the two progress
// counters never mix. GENERATED by scripts/ai-elements-plan.mjs — do not hand-edit entries;
// change status by editing the generator's inputs, or flip a single 'status' as you port.

export type AiCategory = ${CATS.map((c) => `'${c}'`).join(" | ")};
export type AiTier = 'light' | 'medium' | 'heavy';
export type Status = 'ready' | 'planned';

export type AiComponentEntry = {
	slug: string;
	name: string;
	category: AiCategory;
	tier: AiTier;
	/** Cross-ai-element dependency order. 0 = depends on no other ai-element. */
	wave: number;
	status: Status;
	/** fractalsvelte core components it composes — all already ported. */
	uiDeps: string[];
	/** Other ai-elements it composes — must be ported first (see wave). */
	aiElementDeps: string[];
	/** Runtime packages it imports (already installed). */
	external: string[];
};

export const AI_COMPONENTS: AiComponentEntry[] = [
${plan.map(entry).join(",\n")}
];

export const AI_CATEGORY_ORDER: AiCategory[] = [${CATS.map((c) => `'${c}'`).join(", ")}];

export const aiByCategory = (entries = AI_COMPONENTS) =>
	AI_CATEGORY_ORDER.map((category) => ({
		category,
		items: entries.filter((c) => c.category === category).sort((a, b) => a.name.localeCompare(b.name))
	})).filter((g) => g.items.length > 0);

export const getAiComponent = (slug: string) => AI_COMPONENTS.find((c) => c.slug === slug);

export const aiProgress = () => ({
	ready: AI_COMPONENTS.filter((c) => c.status === 'ready').length,
	total: AI_COMPONENTS.length
});
`;

writeFileSync(`${ROOT}/src/lib/docs/ai-registry.ts`, ts);
console.log(`wrote ports/ai-elements-plan.json and src/lib/docs/ai-registry.ts (${plan.length} components)`);