import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';
import { Tooltip } from '../src/lib/components/motion/tooltip/index.js';

describe('Tooltip', () => {
	it('honors delay, exposes description, and closes with Escape', async () => {
		vi.useFakeTimers();
		const { container } = render(Tooltip, { props: { content: 'Details', delay: 120 } });
		const trigger = container.querySelector('[data-slot="tooltip-trigger"]') as HTMLElement;
		await fireEvent.mouseEnter(trigger);
		expect(container.querySelector('[role="tooltip"]')).toBeNull();
		await vi.advanceTimersByTimeAsync(120);
		expect(container.querySelector('[role="tooltip"]')?.textContent).toBe('Details');
		expect(trigger.getAttribute('aria-describedby')).toBe(container.querySelector('[role="tooltip"]')?.id);
		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(container.querySelector('[role="tooltip"]')).toBeNull();
		vi.useRealTimers();
	});
});
