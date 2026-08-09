import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const storedMenuState = browser ? JSON.parse(localStorage.getItem('menuState') || 'false') : false;
export const menuState = writable(storedMenuState);
export function toggleMenuState() {
	if (browser) {
		menuState.update((mode) => {
			const newMode = !mode;
			localStorage.setItem('menuState', JSON.stringify(newMode));
			return newMode;
		});
	}
}

const storedThemeState = browser ? JSON.parse(localStorage.getItem('themeState') || 'false') : false;
export const themeState = writable(storedThemeState);

function applyDataTheme(dark: boolean) {
	if (browser) {
		document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
	}
}

if (browser) {
	applyDataTheme(storedThemeState);
}

export function toggleThemeState() {
	if (browser) {
		themeState.update((mode) => {
			const newMode = !mode;
			localStorage.setItem('themeState', JSON.stringify(newMode));
			applyDataTheme(newMode);
			return newMode;
		});
	}
}

const storedTOCState = browser ? JSON.parse(localStorage.getItem('tocState') || 'false') : false;
export const tocState = writable(storedTOCState);
export function toggleTocState() {
	if (browser) {
		tocState.update((mode) => {
			const newMode = !mode;
			localStorage.setItem('tocState', JSON.stringify(newMode));
			return newMode;
		});
	}
}

export const iW = writable(false)