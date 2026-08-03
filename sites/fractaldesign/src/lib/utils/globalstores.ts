import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const storedTheme = browser ? (localStorage.getItem('theme') || 'default-light') : 'default-light';
export const theme = writable(storedTheme);

export function setTheme(newTheme:string) {
    if (browser) {
        localStorage.setItem('theme', newTheme);
    }
    theme.set(newTheme); // Update the store
}

export const isDrawerOpen = writable(false);

export function toggleDrawer() {
    isDrawerOpen.update(n => !n);
}

export function closeDrawer() {
    isDrawerOpen.set(false);
}