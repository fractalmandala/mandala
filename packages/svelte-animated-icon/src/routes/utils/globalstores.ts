import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const storedDarkTheme = browser ? JSON.parse(localStorage.getItem('darkTheme') || 'false') : false;
export const darkTheme = writable(storedDarkTheme);
export function toggleTheme() {
	if (browser) {
		darkTheme.update((mode) => {
			const newMode = !mode;
			localStorage.setItem('darkTheme', JSON.stringify(newMode));
			return newMode;
		});
	}
}