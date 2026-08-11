// Docs-site theme controller. Runtime CSS-variable injection: the selected palette's tokens
// (from $lib/themes) are written onto <html> as custom properties, for the current light/dark
// mode (from mode-watcher). SITE-ONLY — the published library ships its own _tokens.sass.
//
// Wiring: mount <ModeWatcher /> and run `theme.apply(mode.current)` inside an $effect in the
// root +layout.svelte. The switcher UI lives in ThemeSwitcher.svelte.
import { browser } from "$app/environment";
import { themes, type ThemePalette, type ThemeMode } from "$lib/themes.js";
import { accents, ACCENTS, type Accent } from "$lib/accents.js";

export const PALETTES: ThemePalette[] = ["neutral", "stone", "zinc", "gray", "slate"];
export { ACCENTS, type Accent };

const PALETTE_KEY = "fs-palette";
const ACCENT_KEY = "fs-accent";
const VARS_CACHE_KEY = "fs-theme-vars"; // last-applied flat var map, for the no-flash script in app.html

// cardForeground → card-foreground, chart1 → chart-1, sidebarPrimary → sidebar-primary
const kebab = (k: string) =>
	k
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.replace(/([a-zA-Z])(\d)/g, "$1-$2")
		.toLowerCase();

class ThemeController {
	/** Neutral base palette — drives background/foreground/muted/border/etc. */
	palette = $state<ThemePalette>("neutral");
	/** Accent colour — overlays the primary family (primary/primary-foreground/ring). */
	accent = $state<Accent>("none");

	constructor() {
		if (!browser) return;
		try {
			const p = localStorage.getItem(PALETTE_KEY) as ThemePalette | null;
			if (p && PALETTES.includes(p)) this.palette = p;
			const a = localStorage.getItem(ACCENT_KEY) as Accent | null;
			if (a && ACCENTS.includes(a)) this.accent = a;
		} catch {
			// storage unavailable — keep defaults
		}
	}

	setPalette(p: ThemePalette) {
		this.palette = p;
		if (browser) try { localStorage.setItem(PALETTE_KEY, p); } catch { /* ignore */ }
	}

	setAccent(a: Accent) {
		this.accent = a;
		if (browser) try { localStorage.setItem(ACCENT_KEY, a); } catch { /* ignore */ }
	}

	/** Write the current palette + accent for `mode` onto <html>. Call from an $effect that also
	 *  reads mode.current so it re-runs on palette, accent or mode change. */
	apply(mode: ThemeMode) {
		if (!browser) return;
		const el = document.documentElement;
		// Own the `.dark` class so theme-base's dark defaults and any `.dark`-keyed CSS stay in
		// sync with the resolved mode, independent of mode-watcher's own class handling.
		el.classList.toggle("dark", mode === "dark");

		const flat: Record<string, string> = {};
		const set = (name: string, value: string) => {
			el.style.setProperty(name, value);
			flat[name] = value;
		};

		// Base palette first — every token.
		for (const [key, value] of Object.entries(themes[this.palette][mode])) {
			set(`--${kebab(key)}`, value);
		}
		// Accent overlay — primary family + sidebar-primary + chart-1, on top of the base.
		if (this.accent !== "none") {
			const a = accents[this.accent][mode];
			set("--primary", a.primary);
			set("--primary-foreground", a.primaryForeground);
			set("--ring", a.ring);
			set("--sidebar-primary", a.sidebarPrimary);
			set("--sidebar-primary-foreground", a.sidebarPrimaryForeground);
			set("--chart-1", a.chart1);
		}

		try {
			localStorage.setItem(VARS_CACHE_KEY, JSON.stringify(flat));
		} catch {
			// storage may be unavailable (private mode); the base stylesheet still covers defaults
		}
	}
}

export const theme = new ThemeController();
