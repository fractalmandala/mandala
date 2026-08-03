import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { ThemeToggle } from '../src/lib/components/blocks/theme-toggle/index.js';

describe('ThemeToggle', () => {
	it('uses a safe fallback and updates the document theme', async () => {
		const toggle = vi.fn();
		render(ThemeToggle, { props: { theme: 'light', ontoggle: toggle } });
		await fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
		expect(document.documentElement.dataset.theme).toBe('dark');
		expect(toggle).toHaveBeenCalledWith('dark');
	});

	it('starts a supported view transition and cleans temporary styles', async () => {
		let finish!: () => void;
		const finished = new Promise<void>((resolve) => (finish = resolve));
		const start = vi.fn((callback: () => void) => { callback(); return { finished }; });
		Object.assign(document, { startViewTransition: start });
		render(ThemeToggle, { props: { theme: 'light', variant: 'circle', start: 'top-left' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
		expect(document.documentElement.dataset.themeTransition).toBe('circle');
		finish(); await finished; await Promise.resolve();
		expect(document.documentElement.dataset.themeTransition).toBeUndefined();
		Reflect.deleteProperty(document, 'startViewTransition');
	});
});
