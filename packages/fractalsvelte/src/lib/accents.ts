// Accent (primary-colour) overlays for the docs theme switcher. Each accent overrides the
// primary family (primary / primary-foreground / ring) plus the sidebar-primary and chart-1
// accents, on top of the chosen neutral base palette — the shadcn "base colour × accent" model.
// Values extracted from src/lib/styles/data/palettes.json. "none" keeps the base palette's
// own neutral values. Regenerate by editing scripts and re-running, or by hand from palettes.json.

import type { ThemeMode } from "$lib/themes.js";

export type Accent = "none" | "red" | "rose" | "orange" | "yellow" | "green" | "blue" | "violet";

export const ACCENTS: Accent[] = ["none", "red", "rose", "orange", "yellow", "green", "blue", "violet"];

export type AccentTokens = {
	primary: string;
	primaryForeground: string;
	ring: string;
	sidebarPrimary: string;
	sidebarPrimaryForeground: string;
	chart1: string;
};

export const accents: Record<Exclude<Accent, "none">, Record<ThemeMode, AccentTokens>> = {
	red: {
		light: { primary: "oklch(0.637 0.237 25.331)", primaryForeground: "oklch(0.971 0.013 17.38)", ring: "oklch(0.637 0.237 25.331)", sidebarPrimary: "oklch(0.637 0.237 25.331)", sidebarPrimaryForeground: "oklch(0.971 0.013 17.38)", chart1: "oklch(0.646 0.222 41.116)" },
		dark: { primary: "oklch(0.637 0.237 25.331)", primaryForeground: "oklch(0.971 0.013 17.38)", ring: "oklch(0.637 0.237 25.331)", sidebarPrimary: "oklch(0.637 0.237 25.331)", sidebarPrimaryForeground: "oklch(0.971 0.013 17.38)", chart1: "oklch(0.488 0.243 264.376)" }
	},
	rose: {
		light: { primary: "oklch(0.645 0.246 16.439)", primaryForeground: "oklch(0.969 0.015 12.422)", ring: "oklch(0.645 0.246 16.439)", sidebarPrimary: "oklch(0.645 0.246 16.439)", sidebarPrimaryForeground: "oklch(0.969 0.015 12.422)", chart1: "oklch(0.646 0.222 41.116)" },
		dark: { primary: "oklch(0.645 0.246 16.439)", primaryForeground: "oklch(0.969 0.015 12.422)", ring: "oklch(0.645 0.246 16.439)", sidebarPrimary: "oklch(0.645 0.246 16.439)", sidebarPrimaryForeground: "oklch(0.969 0.015 12.422)", chart1: "oklch(0.488 0.243 264.376)" }
	},
	orange: {
		light: { primary: "oklch(0.705 0.213 47.604)", primaryForeground: "oklch(0.98 0.016 73.684)", ring: "oklch(0.705 0.213 47.604)", sidebarPrimary: "oklch(0.705 0.213 47.604)", sidebarPrimaryForeground: "oklch(0.98 0.016 73.684)", chart1: "oklch(0.646 0.222 41.116)" },
		dark: { primary: "oklch(0.646 0.222 41.116)", primaryForeground: "oklch(0.98 0.016 73.684)", ring: "oklch(0.646 0.222 41.116)", sidebarPrimary: "oklch(0.646 0.222 41.116)", sidebarPrimaryForeground: "oklch(0.98 0.016 73.684)", chart1: "oklch(0.488 0.243 264.376)" }
	},
	yellow: {
		light: { primary: "oklch(0.795 0.184 86.047)", primaryForeground: "oklch(0.421 0.095 57.708)", ring: "oklch(0.795 0.184 86.047)", sidebarPrimary: "oklch(0.795 0.184 86.047)", sidebarPrimaryForeground: "oklch(0.421 0.095 57.708)", chart1: "oklch(0.646 0.222 41.116)" },
		dark: { primary: "oklch(0.795 0.184 86.047)", primaryForeground: "oklch(0.421 0.095 57.708)", ring: "oklch(0.554 0.135 66.442)", sidebarPrimary: "oklch(0.795 0.184 86.047)", sidebarPrimaryForeground: "oklch(0.421 0.095 57.708)", chart1: "oklch(0.488 0.243 264.376)" }
	},
	green: {
		light: { primary: "oklch(0.723 0.219 149.579)", primaryForeground: "oklch(0.982 0.018 155.826)", ring: "oklch(0.723 0.219 149.579)", sidebarPrimary: "oklch(0.723 0.219 149.579)", sidebarPrimaryForeground: "oklch(0.982 0.018 155.826)", chart1: "oklch(0.646 0.222 41.116)" },
		dark: { primary: "oklch(0.696 0.17 162.48)", primaryForeground: "oklch(0.393 0.095 152.535)", ring: "oklch(0.527 0.154 150.069)", sidebarPrimary: "oklch(0.696 0.17 162.48)", sidebarPrimaryForeground: "oklch(0.393 0.095 152.535)", chart1: "oklch(0.488 0.243 264.376)" }
	},
	blue: {
		light: { primary: "oklch(0.623 0.214 259.815)", primaryForeground: "oklch(0.97 0.014 254.604)", ring: "oklch(0.623 0.214 259.815)", sidebarPrimary: "oklch(0.623 0.214 259.815)", sidebarPrimaryForeground: "oklch(0.97 0.014 254.604)", chart1: "oklch(0.646 0.222 41.116)" },
		dark: { primary: "oklch(0.546 0.245 262.881)", primaryForeground: "oklch(0.379 0.146 265.522)", ring: "oklch(0.488 0.243 264.376)", sidebarPrimary: "oklch(0.546 0.245 262.881)", sidebarPrimaryForeground: "oklch(0.379 0.146 265.522)", chart1: "oklch(0.488 0.243 264.376)" }
	},
	violet: {
		light: { primary: "oklch(0.606 0.25 292.717)", primaryForeground: "oklch(0.969 0.016 293.756)", ring: "oklch(0.606 0.25 292.717)", sidebarPrimary: "oklch(0.606 0.25 292.717)", sidebarPrimaryForeground: "oklch(0.969 0.016 293.756)", chart1: "oklch(0.646 0.222 41.116)" },
		dark: { primary: "oklch(0.541 0.281 293.009)", primaryForeground: "oklch(0.969 0.016 293.756)", ring: "oklch(0.541 0.281 293.009)", sidebarPrimary: "oklch(0.541 0.281 293.009)", sidebarPrimaryForeground: "oklch(0.969 0.016 293.756)", chart1: "oklch(0.488 0.243 264.376)" }
	}
};
