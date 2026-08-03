// Amplify the LIGHT-mode tint of the hued base palettes so they are distinguishable in light
// (shadcn bases are grayscale-white in light; the hue only shows in dark). default + neutral
// stay pure neutral (they ARE the neutral family). Re-run after editing base data.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const path = `${ROOT}/src/lib/themes.json`;
const themes = JSON.parse(readFileSync(path, "utf8"));

// Characteristic hue per hued base + per-token target chroma for the light surfaces.
const HUE = { stone: 70, gray: 255, zinc: 286, slate: 240 };
const CHROMA = {
	background: 0.006, card: 0.006, popover: 0.006,
	secondary: 0.02, muted: 0.018, accent: 0.02, input: 0.022, border: 0.026,
	ring: 0.04, sidebar: 0.008, sidebarAccent: 0.02, sidebarBorder: 0.026,
};

// keep the lightness of the existing oklch, swap chroma + hue
function tint(value, chroma, hue) {
	const m = value.match(/oklch\(([^)]+)\)/);
	if (!m) return value;
	const parts = m[1].trim().split(/\s+/);
	const L = parts[0];
	const alpha = m[1].includes("/") ? " " + m[1].slice(m[1].indexOf("/")) : "";
	return `oklch(${L} ${chroma} ${hue}${alpha})`;
}

for (const [pal, hue] of Object.entries(HUE)) {
	const light = themes[pal].light;
	for (const [tok, chroma] of Object.entries(CHROMA)) {
		if (light[tok]) light[tok] = tint(light[tok], chroma, hue);
	}
}

writeFileSync(path, JSON.stringify(themes, null, 2) + "\n");
console.log("amplified light tints for:", Object.keys(HUE).join(", "));