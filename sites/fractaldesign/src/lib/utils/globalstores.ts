import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function getInitialTheme(): 'light' | 'dark' {
    if (!browser) return 'light';
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'theme-dark' || stored === 'default-dark') return 'dark';
    if (stored === 'light' || stored === 'theme-light' || stored === 'default-light') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const theme = writable<'light' | 'dark'>(getInitialTheme());

export function setTheme(newTheme: 'light' | 'dark') {
    if (browser) {
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
    theme.set(newTheme);
}

export function toggleTheme() {
    theme.update(current => {
        const next = current === 'dark' ? 'light' : 'dark';
        if (browser) {
            localStorage.setItem('theme', next);
            document.documentElement.setAttribute('data-theme', next);
            document.documentElement.classList.toggle('dark', next === 'dark');
        }
        return next;
    });
}

export const isDrawerOpen = writable(false);

export function toggleDrawer() {
    isDrawerOpen.update(n => !n);
}

export function closeDrawer() {
    isDrawerOpen.set(false);
}