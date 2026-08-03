import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';
import { Input } from '../src/lib/components/motion/input/index.js';

describe('Input', () => {
	it('associates label and error semantics and emits string changes', async () => {
		const onchange = vi.fn();
		const { getByLabelText, getByRole } = render(Input, { props: { label: 'Email', error: 'Invalid address', onchange } });
		const input = getByLabelText('Email') as HTMLInputElement;
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.getAttribute('aria-describedby')).toBe(getByRole('alert').id);
		await fireEvent.input(input, { target: { value: 'a@b.dev' } });
		expect(onchange).toHaveBeenCalledWith('a@b.dev');
	});

	it('exposes focused state without masking consumer handlers', async () => {
		const onfocus = vi.fn();
		const { container, getByRole } = render(Input, { props: { onfocus } });
		await fireEvent.focus(getByRole('textbox'));
		expect(container.querySelector('[data-slot="input"]')?.getAttribute('data-state')).toBe('focused');
		expect(onfocus).toHaveBeenCalledOnce();
	});
});
