import { browser } from '$app/environment';

// Svelte 5 forbids exporting a $state binding that's reassigned from within the module
// (svelte.dev/e/state_invalid_export) — the sanctioned pattern is a reactive object whose
// property gets mutated instead, so `theme`/`activePatternId` stay stable exported
// references while `.value` changes reactively.
export type ThemeId = 'theme-amrit-dark' | 'theme-amrit-light';

function validTheme(value: string | null): ThemeId {
	return value === 'theme-amrit-light' || value === 'theme-amrit-dark' ? value : 'theme-amrit-dark';
}

const storedTheme = browser ? validTheme(localStorage.getItem('theme')) : 'theme-amrit-dark';
export const theme = $state<{ value: ThemeId }>({ value: storedTheme });

export function setTheme(newTheme: ThemeId) {
	if (browser) {
		localStorage.setItem('theme', newTheme);
	}
	theme.value = newTheme;
}

const DEFAULT_PATTERN_ID = 'fractalbuilder-default-grid';
const storedPatternId = browser ? (localStorage.getItem('activePatternId') || DEFAULT_PATTERN_ID) : DEFAULT_PATTERN_ID;
export const activePatternId = $state({ value: storedPatternId });

export function setActivePattern(id: string) {
	if (browser) {
		localStorage.setItem('activePatternId', id);
	}
	activePatternId.value = id;
}
