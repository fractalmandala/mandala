import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';
import { Button } from '../src/lib/components/motion/button/index.js';

describe('Button', () => {
	it('defaults to a non-submitting primary button', () => {
		const { container } = render(Button);
		const button = container.querySelector('[data-slot="button"]') as HTMLButtonElement;
		expect(button.type).toBe('button');
		expect(button.dataset.variant).toBe('primary');
		expect(button.dataset.size).toBe('md');
	});

	it('creates a pointer-positioned ripple and forwards pointerdown', async () => {
		const onpointerdown = vi.fn();
		const { container } = render(Button, { props: { ripple: true, onpointerdown } });
		const button = container.querySelector('button') as HTMLButtonElement;
		vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({ left: 10, top: 20, width: 100, height: 40, right: 110, bottom: 60, x: 10, y: 20, toJSON: () => ({}) });
		await fireEvent.pointerDown(button, { clientX: 35, clientY: 45 });
		const ripple = container.querySelector('[data-slot="button-ripple"]') as HTMLElement;
		expect(ripple.style.getPropertyValue('--ripple-x')).toBe('25px');
		expect(ripple.style.getPropertyValue('--ripple-size')).toBe('200px');
		expect(onpointerdown).toHaveBeenCalledOnce();
	});

	it('does not create ripples while disabled', async () => {
		const { container } = render(Button, { props: { ripple: true, disabled: true } });
		await fireEvent.pointerDown(container.querySelector('button')!);
		expect(container.querySelector('[data-slot="button-ripple"]')).toBeNull();
	});
});
