// Reading preferences for the editor surface, driven by the footer controls.
// Persisted to localStorage so the app opens the way it was left.

export type FontFamily = 'serif' | 'sans' | 'mono';
export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'fracta:prefs';
const SIZES = [14, 16, 18, 20, 24] as const;

interface Persisted {
	family: FontFamily;
	size: number;
	theme: ThemePreference;
}

function load(): Persisted {
	if (typeof localStorage === 'undefined') return { family: 'sans', size: 18, theme: 'light' };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) return { family: 'sans', size: 18, theme: 'light', ...JSON.parse(raw) };
	} catch {
		// Corrupt value — fall through to defaults.
	}
	return { family: 'sans', size: 18, theme: 'light' };
}

class Prefs {
	family = $state<FontFamily>('sans');
	size = $state(18);
	theme = $state<ThemePreference>('light');

	constructor() {
		const initial = load();
		this.family = initial.family;
		this.size = initial.size;
		this.theme = initial.theme;
	}

	/** CSS font-family value for the active family. */
	get fontStack(): string {
		switch (this.family) {
			case 'serif':
				return 'var(--font-serif)';
			case 'mono':
				return 'var(--font-mono)';
			default:
				return 'var(--font-sans)';
		}
	}

	setFamily(family: FontFamily) {
		this.family = family;
		this.#persist();
	}

	setTheme(theme: ThemePreference) {
		this.theme = theme;
		this.#persist();
	}

	/** Steps to the next size in the ramp, wrapping around. */
	cycleSize() {
		const index = SIZES.indexOf(this.size as (typeof SIZES)[number]);
		this.size = SIZES[(index + 1) % SIZES.length];
		this.#persist();
	}

	#persist() {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ family: this.family, size: this.size, theme: this.theme }));
	}
}

export const prefs = new Prefs();
