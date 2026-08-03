import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import PromptInput from '../src/lib/components/agents/prompt-input/prompt-input.svelte';
describe('PromptInput', () => {
	it('submits keyboard input with selected model', async () => {
		const onSubmit = vi.fn();
		render(PromptInput, {
			props: {
				defaultValue: ' hello ',
				models: [
					{ value: 'a', label: 'A' },
					{ value: 'b', label: 'B' }
				],
				defaultModel: 'b',
				onSubmit
			}
		});
		await fireEvent.keyDown(screen.getByLabelText('Prompt'), { key: 'Enter' });
		expect(onSubmit).toHaveBeenCalledWith('hello', 'b');
	});
	it('preserves newline on shift enter and exposes stop state', async () => {
		const onStop = vi.fn();
		render(PromptInput, { props: { loading: true, onStop } });
		expect(screen.getByLabelText('Stop generating')).toBeTruthy();
		await fireEvent.click(screen.getByLabelText('Stop generating'));
		expect(onStop).toHaveBeenCalled();
	});
});
