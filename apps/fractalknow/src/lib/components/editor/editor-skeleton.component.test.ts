import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import EditorSkeleton from './EditorSkeleton.svelte';

describe('EditorSkeleton', () => {
	it('exposes a busy status region with the default loading label', () => {
		render(EditorSkeleton);
		const status = screen.getByRole('status');
		expect(status.getAttribute('aria-busy')).toBe('true');
		expect(status.getAttribute('aria-label')).toBe('Loading document');
	});

	it('renders three placeholder bars mirroring the editor content column', () => {
		const { container } = render(EditorSkeleton);
		expect(container.querySelectorAll('.editor-skeleton__line')).toHaveLength(3);
		expect(container.querySelector('.editor-skeleton__line--heading')).toBeTruthy();
		expect(container.querySelector('.editor-skeleton__line--full')).toBeTruthy();
		expect(container.querySelector('.editor-skeleton__line--partial')).toBeTruthy();
	});

	it('honours a custom label', () => {
		render(EditorSkeleton, { label: 'Loading big-note' });
		expect(screen.getByRole('status').getAttribute('aria-label')).toBe('Loading big-note');
	});
});
