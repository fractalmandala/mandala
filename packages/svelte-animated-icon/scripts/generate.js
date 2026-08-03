import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG_DIR = path.resolve(__dirname, '..');

// ── Config for each icon set ──────────────────────────────────────────
const SETS = [
	{
		name: 'phosphor',
		variants: {
			regular: 'static/svg/phosphor-regular',
			light: 'static/svg/phosphor-light',
			fill: 'static/svg/phosphor-fill',
		},
		defaultVariant: 'regular',
		nameFromFile: (filename, variant) =>
			filename.replace(`.svg`, '').replace(`-${variant}`, ''),
		stripSuffix: { fill: '-fill', light: '' },
	},
	{
		name: 'remix',
		variants: {
			fill: 'static/svg/remixicons-fill',
			line: 'static/svg/remixicons-line',
		},
		defaultVariant: 'line',
		nameFromFile: (filename, variant) =>
			filename.replace(`.svg`, '').replace(`-${variant}`, ''),
		stripSuffix: {},
	},
	{
		name: 'flowbite',
		variants: {
			outline: 'static/svg/flowbite-outline',
			solid: 'static/svg/flowbite-solid',
		},
		defaultVariant: 'outline',
		nameFromFile: (filename, variant) =>
			filename.replace(`.svg`, '').replace(`-${variant}`, ''),
		stripSuffix: {},
	},
	{
		name: 'hero',
		variants: {
			outline: 'static/svg/hero-outline',
			solid: 'static/svg/hero-solid',
		},
		defaultVariant: 'outline',
		nameFromFile: (filename, variant) =>
			filename.replace(`.svg`, '').replace(`-${variant}`, ''),
		stripSuffix: {},
	},
	{
		name: 'ion',
		variants: {
			outline: 'static/svg/ion-outline',
			filled: 'static/svg/ion-filled',
		},
		defaultVariant: 'outline',
		nameFromFile: (filename, variant) =>
			filename.replace(`.svg`, '').replace(`-${variant}`, ''),
		stripSuffix: {},
	},
];

// ── Helpers ───────────────────────────────────────────────────────────

function toPascalCase(str) {
	return str
		.split('-')
		.map((s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : ''))
		.join('');
}

/**
 * Turn an icon name into a valid JS component identifier. JS identifiers can't
 * start with a digit (e.g. "24-hours" → "24Hours" is invalid in an export), so
 * digit-leading names are prefixed with "Icon" → "Icon24Hours".
 */
function toComponentName(str) {
	const pascal = toPascalCase(str);
	return /^[0-9]/.test(pascal) ? `Icon${pascal}` : pascal;
}

// Hardcoded foreground colors used by each library — normalized to currentColor so
// icons respond to the CSS `color` property (and therefore to theme tokens).
const ICON_HARDCODED_COLORS = ['#000', '#000000', '#0F172A', '#0f172a'];

/** Strip the <svg> wrapper and any <rect fill="none" …> bounding rect from raw SVG.
 *  Also:
 *  - Preserves any fill="…" on <svg> via a <g> wrapper (fill="none" for outline libs,
 *    fill="currentColor" for Remix — without this, child paths default to fill="black").
 *  - Removes "px" from stroke-width in inline styles: ion-outline uses stroke-width:32px
 *    (CSS px, absolute) which at 28px display size makes a 512-viewBox icon a solid blob.
 *    Dropping the unit makes it 32 SVG user units — thin and viewBox-relative.
 *  - Replaces hardcoded dark icon colors with currentColor so icons follow CSS `color`. */
function stripSvgWrapper(raw) {
	const svgFillMatch = raw.match(/<svg[^>]*\bfill="([^"]+)"/i);
	const svgFill = svgFillMatch ? svgFillMatch[1] : null;

	let inner = raw
		.replace(/<svg[^>]*>/i, '')
		.replace(/<\/svg>/i, '')
		.replace(/<rect[^>]*fill="none"[^>]*\/>\s*/gi, '')
		.replace(/<rect[^>]*fill="none"[^>]*><\/rect>\s*/gi, '')
		.trim();

	// Fix stroke-width:Npx → stroke-width:N (user units, scales with viewBox).
	inner = inner.replace(/\bstroke-width:(\d+(?:\.\d+)?)px/g, 'stroke-width:$1');

	// Normalize hardcoded foreground colors → currentColor.
	for (const color of ICON_HARDCODED_COLORS) {
		inner = inner.replaceAll(`stroke="${color}"`, 'stroke="currentColor"');
		inner = inner.replaceAll(`fill="${color}"`, 'fill="currentColor"');
		inner = inner.replaceAll(`stroke:${color}`, 'stroke:currentColor');
		inner = inner.replaceAll(`fill:${color}`, 'fill:currentColor');
	}

	// If the SVG had an explicit fill, preserve it via a <g> wrapper.
	// If it had no fill, default to currentColor so fill-type icons (phosphor-fill,
	// ion-filled, etc.) whose paths have no fill attribute don't render as SVG-default black.
	return `<g fill="${svgFill ?? 'currentColor'}">${inner}</g>`;
}

/** Pull the viewBox from the source <svg> so the icon renders in its own coordinate space
 *  (Phosphor is 256×256, Remix/Lucide are 24×24). Falls back to Phosphor's box. */
function extractViewBox(raw) {
	const m = raw.match(/<svg[^>]*\bviewBox="([^"]+)"/i);
	return m ? m[1] : '0 0 256 256';
}

// ── Processing ────────────────────────────────────────────────────────

for (const set of SETS) {
	console.log(`\n── ${set.name} ──`);

	/** Map: baseIconName → { variantKey: svgInnerContent } */
	const icons = new Map();

	// 1. Read SVGs from each variant directory
	for (const [variant, relDir] of Object.entries(set.variants)) {
		const absDir = path.resolve(PKG_DIR, relDir);

		if (!fs.existsSync(absDir)) {
			console.warn(`  ⚠  Directory not found: ${absDir}`);
			continue;
		}

		const files = fs.readdirSync(absDir).filter((f) => f.endsWith('.svg'));

		for (const file of files) {
			// Determine the base icon name
			let name = file;
			// stripSuffix pre-processing
			const suffix = set.stripSuffix?.[variant];
			if (suffix) {
				// Replace suffix only at the end of the name (before .svg)
				const dotIndex = name.lastIndexOf('.svg');
				const base = dotIndex !== -1 ? name.slice(0, dotIndex) : name;
				if (base.endsWith(suffix)) {
					name = base.slice(0, -suffix.length) + '.svg';
				}
			}
			const iconName = set.nameFromFile(name, variant);

			if (!icons.has(iconName)) {
				icons.set(iconName, { variants: {}, viewBox: '0 0 256 256' });
			}

			// Read SVG, capture its viewBox, then strip the wrapper.
			const svgContent = fs.readFileSync(path.join(absDir, file), 'utf-8');
			const entry = icons.get(iconName);
			entry.viewBox = extractViewBox(svgContent);
			entry.variants[variant] = stripSvgWrapper(svgContent);
		}

		console.log(`  ${variant}: ${files.length} SVGs`);
	}

	// 2. Generate output files
	const outDir = path.resolve(PKG_DIR, `src/lib/${set.name}/icons`);
	const barrelPath = path.resolve(PKG_DIR, `src/lib/${set.name}/index.ts`);

	// Clear the output dir first so renamed/removed icons don't leave orphan files.
	fs.rmSync(outDir, { recursive: true, force: true });
	fs.mkdirSync(outDir, { recursive: true });

	let iconCount = 0;
	const exportLines = [];

	for (const [iconName, { variants: variantSvgs, viewBox }] of icons) {
		const pascalName = toComponentName(iconName);

		// Build VARIANTS object literal
		const variantsEntries = Object.entries(variantSvgs).map(
			([k, v]) => `\t\t${k}: \`${v}\``,
		);
		const variantsObj = `{\n${variantsEntries.join(',\n')}\n\t}`;

		// Determine valid variant keys for this icon
		const presentVariants = Object.keys(variantSvgs);
		const defaultV = presentVariants.includes(set.defaultVariant)
			? set.defaultVariant
			: presentVariants[0];

		const component = `<script lang="ts">
\timport AnimatedIcon from '../../core/AnimatedIcon.svelte';

\tconst VARIANTS: Record<string, string> = ${variantsObj};

\tinterface Props {
\t\tvariant?: string;
\t\t[key: string]: unknown;
\t}

\tlet { variant = '${defaultV}', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['${defaultV}']} viewBox="${viewBox}" {...rest} />
`;

		fs.writeFileSync(path.join(outDir, `${pascalName}.svelte`), component, 'utf-8');
		exportLines.push(
			`export { default as ${pascalName} } from './icons/${pascalName}.svelte';`,
		);
		iconCount++;
	}

	// Write barrel
	const barrel = exportLines.join('\n') + '\n';
	fs.writeFileSync(barrelPath, barrel, 'utf-8');

	console.log(`  → ${iconCount} icons generated at src/lib/${set.name}/icons/`);
	console.log(`  → barrel: src/lib/${set.name}/index.ts`);
}
